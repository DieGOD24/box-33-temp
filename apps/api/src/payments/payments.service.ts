import { createHash, randomBytes, timingSafeEqual } from 'node:crypto'
import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  OnModuleDestroy,
  OnModuleInit,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { ConfigService } from '@nestjs/config'
import { DataSource, LessThan, Repository } from 'typeorm'
import type {
  CartSnapshotLine,
  CheckoutSession,
  Paginated,
  PaymentRecord,
  PaymentStatus,
  PaymentStatusResponse,
} from '@box33/types'
import type { AppConfig } from '../config/configuration'
import { ProductsService } from '../products/products.service'
import { OrdersService } from '../orders/orders.service'
import { Payment } from './entities/payment.entity'
import type { CheckoutDto } from './dto/checkout.dto'

const EXPIRY_MINUTES = 20
/** PENDING payments older than this are deleted — assumed-abandoned checkouts. */
const STALE_PENDING_MINUTES = 30
const STALE_CLEANUP_INTERVAL_MS = 5 * 60 * 1000
const WOMPI_FETCH_TIMEOUT_MS = 4_000
const WOMPI_SANDBOX_BASE = 'https://sandbox.wompi.co/v1'
const WOMPI_PROD_BASE = 'https://production.wompi.co/v1'
const TERMINAL: PaymentStatus[] = ['CONFIRMED', 'FAILED', 'CANCELLED', 'EXPIRED']
const DEFAULT_LIMIT = 20
const MAX_LIMIT = 100

interface WompiTransaction {
  id: string
  status: string
}

export interface WompiEventPayload {
  event: string
  data: { transaction: { id: string; reference: string; status: string } }
  signature: { properties: string[]; checksum: string }
  timestamp: number
}

@Injectable()
export class PaymentsService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PaymentsService.name)
  private staleCleanupTimer: NodeJS.Timeout | null = null

  constructor(
    @InjectRepository(Payment) private readonly payments: Repository<Payment>,
    private readonly dataSource: DataSource,
    private readonly productsService: ProductsService,
    private readonly ordersService: OrdersService,
    private readonly config: ConfigService<AppConfig, true>
  ) {}

  onModuleInit(): void {
    this.staleCleanupTimer = setInterval(() => {
      this.cleanupStalePending().catch((err: Error) => {
        this.logger.error(`stale-pending cleanup failed: ${err.message}`)
      })
    }, STALE_CLEANUP_INTERVAL_MS)
    this.staleCleanupTimer.unref?.()
  }

  onModuleDestroy(): void {
    if (this.staleCleanupTimer) {
      clearInterval(this.staleCleanupTimer)
      this.staleCleanupTimer = null
    }
  }

  /** Deletes abandoned PENDING sessions so they don't pollute the dashboard. */
  async cleanupStalePending(): Promise<number> {
    const cutoff = new Date(Date.now() - STALE_PENDING_MINUTES * 60 * 1000)
    const result = await this.payments.delete({
      status: 'PENDING' as PaymentStatus,
      createdAt: LessThan(cutoff),
    })
    const deleted = result.affected ?? 0
    if (deleted > 0) this.logger.log(`[PAYMENT] cleaned ${deleted} stale PENDING sessions`)
    return deleted
  }

  // ── Checkout ────────────────────────────────────────────────────────────────

  async checkout(dto: CheckoutDto): Promise<CheckoutSession> {
    const wompi = this.config.get('wompi', { infer: true })
    if (!wompi.publicKey || !wompi.privateKey || !wompi.integritySecret) {
      throw new ServiceUnavailableException({
        code: 'WOMPI_NOT_CONFIGURED',
        message: 'Online payments are not configured — order via WhatsApp instead',
      })
    }

    // Server-side pricing: the client only sends ids + quantities + sizes.
    const ids = [...new Set(dto.items.map((i) => i.productId))]
    const catalog = await this.productsService.findByIds(ids)
    const byId = new Map(catalog.map((p) => [p.id, p]))

    let totalCents = 0
    const lines: CartSnapshotLine[] = dto.items.map((line) => {
      const product = byId.get(line.productId)
      if (!product || !product.active) {
        throw new BadRequestException('Una de las prendas ya no está disponible')
      }
      if (product.soldOut) {
        throw new BadRequestException(`"${product.name}" está agotada`)
      }
      if (product.priceCents == null) {
        throw new BadRequestException(
          `"${product.name}" no tiene precio en línea — pídela por WhatsApp`
        )
      }
      const subtotalCents = product.priceCents * line.quantity
      totalCents += subtotalCents
      return {
        productId: product.id,
        name: product.name,
        size: line.size ?? null,
        quantity: line.quantity,
        unitPriceCents: product.priceCents,
        subtotalCents,
      }
    })

    const reference = `BOX33-${Date.now()}-${randomBytes(3).toString('hex')}`
    const expiresAt = new Date(Date.now() + EXPIRY_MINUTES * 60 * 1000)
    const currency = 'COP'

    const payment = await this.payments.save(
      this.payments.create({
        reference,
        status: 'PENDING' as PaymentStatus,
        amountCents: totalCents,
        currency,
        orderId: null,
        wompiTransactionId: null,
        customerName: dto.customer.name,
        customerEmail: dto.customer.email,
        customerPhone: dto.customer.phone,
        cartSnapshot: lines,
        expiresAt,
      })
    )

    return {
      reference: payment.reference,
      checkoutUrl: this.buildCheckoutUrl({
        publicKey: wompi.publicKey,
        reference,
        amountCents: totalCents,
        currency,
        integrityHash: this.generateIntegrity(
          reference,
          totalCents,
          currency,
          wompi.integritySecret
        ),
      }),
      amountCents: totalCents,
      currency,
      expiresAt: payment.expiresAt.toISOString(),
    }
  }

  // ── Status polling ──────────────────────────────────────────────────────────

  async getStatus(reference: string): Promise<PaymentStatusResponse> {
    const payment = await this.payments.findOne({ where: { reference } })
    if (!payment) throw new NotFoundException('Payment not found')

    if (TERMINAL.includes(payment.status)) {
      return { status: payment.status, orderId: payment.orderId ?? undefined }
    }

    if (new Date() > payment.expiresAt) {
      await this.expirePayment(payment)
      return { status: 'EXPIRED' }
    }

    const privateKey = this.config.get('wompi', { infer: true }).privateKey
    if (!privateKey) return { status: payment.status }

    const txn = await this.fetchWompiTransaction(reference, privateKey)
    if (txn) {
      payment.wompiTransactionId = txn.id
      if (txn.status === 'APPROVED') {
        await this.confirmPayment(payment)
        return { status: 'CONFIRMED', orderId: payment.orderId ?? undefined }
      }
      if (txn.status === 'DECLINED' || txn.status === 'VOIDED' || txn.status === 'ERROR') {
        await this.failPayment(payment)
        return { status: 'FAILED' }
      }
    }
    return { status: payment.status }
  }

  // ── Webhook ─────────────────────────────────────────────────────────────────

  /**
   * Verifies and processes a Wompi event. Idempotent: events for terminal
   * payments are no-ops. Throws Unauthorized on signature mismatch.
   */
  async handleWebhookEvent(payload: WompiEventPayload): Promise<void> {
    if (!payload?.data?.transaction || !payload?.signature) {
      throw new BadRequestException('Malformed Wompi event')
    }

    const txn = payload.data.transaction
    const payment = await this.payments.findOne({ where: { reference: txn.reference } })
    if (!payment) {
      this.logger.warn(`[WEBHOOK] no payment for reference=${txn.reference}`)
      return
    }

    const eventsSecret = this.config.get('wompi', { infer: true }).eventsSecret
    if (!eventsSecret) {
      this.logger.error('[WEBHOOK] WOMPI_EVENTS_SECRET not configured')
      throw new UnauthorizedException('Webhook secret not configured')
    }
    if (!this.verifyWebhookSignature(payload, eventsSecret)) {
      this.logger.warn(`[WEBHOOK] signature mismatch reference=${txn.reference}`)
      throw new UnauthorizedException('Invalid webhook signature')
    }

    if (TERMINAL.includes(payment.status)) {
      this.logger.log(
        `[WEBHOOK] ignored — payment already ${payment.status} (ref=${txn.reference})`
      )
      return
    }

    payment.wompiTransactionId = txn.id
    if (txn.status === 'APPROVED') {
      await this.confirmPayment(payment)
    } else if (txn.status === 'DECLINED' || txn.status === 'VOIDED' || txn.status === 'ERROR') {
      await this.failPayment(payment)
    }
    // PENDING events are dropped — we already track it as PENDING.
  }

  // ── Admin listing ───────────────────────────────────────────────────────────

  async adminList(
    page = 1,
    limit = DEFAULT_LIMIT,
    status?: PaymentStatus
  ): Promise<Paginated<PaymentRecord>> {
    const safePage = Math.max(1, Math.floor(page))
    const safeLimit = Math.min(MAX_LIMIT, Math.max(1, Math.floor(limit)))
    const [items, total] = await this.payments.findAndCount({
      where: status ? { status } : {},
      order: { createdAt: 'DESC' },
      skip: (safePage - 1) * safeLimit,
      take: safeLimit,
    })
    return {
      items: items.map((p) => this.toRecord(p)),
      total,
      page: safePage,
      limit: safeLimit,
      pages: Math.max(1, Math.ceil(total / safeLimit)),
    }
  }

  // ── Internals ───────────────────────────────────────────────────────────────

  /**
   * Materializes the order from the cart snapshot and marks the payment
   * confirmed, atomically. Idempotent — an already-confirmed payment no-ops.
   */
  private async confirmPayment(payment: Payment): Promise<void> {
    if (payment.status === 'CONFIRMED' && payment.orderId) return
    if (!payment.cartSnapshot || payment.cartSnapshot.length === 0) {
      this.logger.error(`[PAYMENT] cannot confirm ${payment.reference} — empty cart snapshot`)
      await this.failPayment(payment)
      return
    }

    await this.dataSource.transaction(async (em) => {
      const order = await this.ordersService.createFromSnapshot(em, {
        lines: payment.cartSnapshot,
        totalCents: payment.amountCents,
        currency: payment.currency,
        customerName: payment.customerName ?? '',
        customerEmail: payment.customerEmail ?? '',
        customerPhone: payment.customerPhone ?? '',
      })
      payment.status = 'CONFIRMED'
      payment.orderId = order.id
      await em.save(payment)
    })
    this.logger.log(`[PAYMENT] CONFIRMED reference=${payment.reference} orderId=${payment.orderId}`)
  }

  private async failPayment(payment: Payment): Promise<void> {
    if (payment.status === 'FAILED') return
    payment.status = 'FAILED'
    await this.payments.save(payment)
    this.logger.log(`[PAYMENT] FAILED reference=${payment.reference}`)
  }

  private async expirePayment(payment: Payment): Promise<void> {
    if (payment.status === 'EXPIRED') return
    payment.status = 'EXPIRED'
    await this.payments.save(payment)
    this.logger.log(`[PAYMENT] EXPIRED reference=${payment.reference}`)
  }

  private async fetchWompiTransaction(
    reference: string,
    privateKey: string
  ): Promise<WompiTransaction | null> {
    const base = privateKey.startsWith('prv_test_') ? WOMPI_SANDBOX_BASE : WOMPI_PROD_BASE
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), WOMPI_FETCH_TIMEOUT_MS)
    try {
      const resp = await fetch(`${base}/transactions?reference=${encodeURIComponent(reference)}`, {
        headers: { Authorization: `Bearer ${privateKey}` },
        signal: controller.signal,
      })
      if (!resp.ok) return null
      const json = (await resp.json()) as { data?: WompiTransaction[] }
      return json.data?.[0] ?? null
    } catch (err) {
      this.logger.warn(`Wompi poll failed for ${reference}: ${(err as Error).message}`)
      return null
    } finally {
      clearTimeout(timeout)
    }
  }

  /** Wompi integrity: SHA256(reference + amountInCents + currency + secret). */
  generateIntegrity(
    reference: string,
    amountCents: number,
    currency: string,
    secret: string
  ): string {
    return createHash('sha256')
      .update(`${reference}${amountCents}${currency}${secret}`)
      .digest('hex')
  }

  /**
   * Wompi event signature: SHA256(prop1 + prop2 + … + timestamp + secret) where
   * properties are dot-paths into `data`. Constant-time comparison.
   */
  verifyWebhookSignature(payload: WompiEventPayload, secret: string): boolean {
    const props = payload.signature.properties
    if (!Array.isArray(props) || props.length === 0) return false

    let concatenated = ''
    for (const path of props) {
      const value = this.readPath(payload.data, path)
      if (value === undefined || value === null) return false
      concatenated += String(value)
    }
    concatenated += String(payload.timestamp)
    concatenated += secret

    const expected = createHash('sha256').update(concatenated).digest('hex')
    const received = payload.signature.checksum
    if (typeof received !== 'string' || received.length !== expected.length) return false
    try {
      return timingSafeEqual(Buffer.from(received), Buffer.from(expected))
    } catch {
      return false
    }
  }

  private readPath(obj: unknown, path: string): unknown {
    return path.split('.').reduce<unknown>((acc, key) => {
      if (acc && typeof acc === 'object' && key in (acc as Record<string, unknown>)) {
        return (acc as Record<string, unknown>)[key]
      }
      return undefined
    }, obj)
  }

  buildCheckoutUrl(params: {
    publicKey: string
    reference: string
    amountCents: number
    currency: string
    integrityHash: string
  }): string {
    const url = new URL('https://checkout.wompi.co/p/')
    url.searchParams.set('public-key', params.publicKey)
    url.searchParams.set('currency', params.currency)
    url.searchParams.set('amount-in-cents', String(params.amountCents))
    url.searchParams.set('reference', params.reference)
    url.searchParams.set('signature:integrity', params.integrityHash)
    const frontendUrl = this.config.get('frontendUrl', { infer: true })
    url.searchParams.set(
      'redirect-url',
      `${frontendUrl.replace(/\/$/, '')}/checkout/resultado?ref=${params.reference}`
    )
    return url.toString()
  }

  private toRecord(p: Payment): PaymentRecord {
    return {
      id: p.id,
      reference: p.reference,
      status: p.status,
      amountCents: p.amountCents,
      currency: p.currency,
      orderId: p.orderId,
      wompiTransactionId: p.wompiTransactionId,
      customerName: p.customerName,
      customerEmail: p.customerEmail,
      customerPhone: p.customerPhone,
      cartSnapshot: p.cartSnapshot ?? [],
      expiresAt: p.expiresAt.toISOString(),
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
    }
  }
}
