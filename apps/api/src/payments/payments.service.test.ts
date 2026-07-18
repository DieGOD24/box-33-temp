import { createHash } from 'node:crypto'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  BadRequestException,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common'
import { PaymentsService, type WompiEventPayload } from './payments.service'
import type { Payment } from './entities/payment.entity'

const WOMPI = {
  publicKey: 'pub_test_abc',
  privateKey: 'prv_test_abc',
  integritySecret: 'integrity-secret',
  eventsSecret: 'events-secret',
}

function makeService(overrides?: {
  wompi?: Partial<typeof WOMPI> | null
  products?: unknown[]
  payment?: Partial<Payment> | null
}) {
  const savedPayments: Payment[] = []
  const paymentsRepo = {
    create: vi.fn((data: Partial<Payment>) => data as Payment),
    save: vi.fn(async (p: Payment) => {
      savedPayments.push(p)
      return { ...p, expiresAt: p.expiresAt ?? new Date() }
    }),
    findOne: vi.fn(async () =>
      overrides?.payment === null ? null : (overrides?.payment as Payment)
    ),
    findAndCount: vi.fn(async () => [[], 0]),
    delete: vi.fn(async () => ({ affected: 0 })),
  }
  const dataSource = {
    transaction: vi.fn(async (fn: (em: unknown) => Promise<void>) =>
      fn({ save: vi.fn(async (x: unknown) => x) })
    ),
  }
  const productsService = {
    findByIds: vi.fn(async () => overrides?.products ?? []),
  }
  const ordersService = {
    createFromSnapshot: vi.fn(async () => ({ id: 'order-1' })),
  }
  const wompiConfig =
    overrides?.wompi === null
      ? { publicKey: '', privateKey: '', integritySecret: '', eventsSecret: '' }
      : { ...WOMPI, ...overrides?.wompi }
  const config = {
    get: vi.fn((key: string) => {
      if (key === 'wompi') return wompiConfig
      if (key === 'frontendUrl') return 'http://localhost:3000'
      return undefined
    }),
  }
  const service = new PaymentsService(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    paymentsRepo as any,
    dataSource as never,
    productsService as never,
    ordersService as never,
    config as never
  )
  return { service, paymentsRepo, dataSource, productsService, ordersService, savedPayments }
}

const PRODUCT = {
  id: '11111111-1111-4111-8111-111111111111',
  name: 'Top Nike Verde',
  active: true,
  soldOut: false,
  priceCents: 8_500_000,
}

const CUSTOMER = { name: 'Ana', email: 'ana@test.co', phone: '3001234567' }

describe('PaymentsService', () => {
  beforeEach(() => vi.restoreAllMocks())

  describe('integrity signature', () => {
    it('matches the Wompi formula sha256(reference + amount + currency + secret)', () => {
      const { service } = makeService()
      const expected = createHash('sha256').update('ref12490000COPsecret').digest('hex')
      expect(service.generateIntegrity('ref1', 2_490_000, 'COP', 'secret')).toBe(expected)
    })
  })

  describe('checkout', () => {
    it('rejects with WOMPI_NOT_CONFIGURED when keys are missing', async () => {
      const { service } = makeService({ wompi: null })
      await expect(
        service.checkout({ items: [{ productId: PRODUCT.id, quantity: 1 }], customer: CUSTOMER })
      ).rejects.toBeInstanceOf(ServiceUnavailableException)
    })

    it('prices strictly server-side from the DB product', async () => {
      const { service, savedPayments } = makeService({ products: [PRODUCT] })
      const session = await service.checkout({
        items: [{ productId: PRODUCT.id, quantity: 2 }],
        customer: CUSTOMER,
      })
      expect(session.amountCents).toBe(17_000_000)
      expect(savedPayments[0]?.cartSnapshot?.[0]?.unitPriceCents).toBe(8_500_000)
    })

    it('builds a checkout URL with signature:integrity and redirect-url', async () => {
      const { service } = makeService({ products: [PRODUCT] })
      const session = await service.checkout({
        items: [{ productId: PRODUCT.id, quantity: 1 }],
        customer: CUSTOMER,
      })
      const url = new URL(session.checkoutUrl)
      expect(url.origin + url.pathname).toBe('https://checkout.wompi.co/p/')
      expect(url.searchParams.get('public-key')).toBe(WOMPI.publicKey)
      expect(url.searchParams.get('amount-in-cents')).toBe('8500000')
      expect(url.searchParams.get('signature:integrity')).toBe(
        service.generateIntegrity(session.reference, 8_500_000, 'COP', WOMPI.integritySecret)
      )
      expect(url.searchParams.get('redirect-url')).toContain('/checkout/resultado?ref=BOX33-')
    })

    it('rejects sold-out products', async () => {
      const { service } = makeService({ products: [{ ...PRODUCT, soldOut: true }] })
      await expect(
        service.checkout({ items: [{ productId: PRODUCT.id, quantity: 1 }], customer: CUSTOMER })
      ).rejects.toBeInstanceOf(BadRequestException)
    })

    it('rejects products without an online price', async () => {
      const { service } = makeService({ products: [{ ...PRODUCT, priceCents: null }] })
      await expect(
        service.checkout({ items: [{ productId: PRODUCT.id, quantity: 1 }], customer: CUSTOMER })
      ).rejects.toBeInstanceOf(BadRequestException)
    })

    it('rejects inactive/unknown products', async () => {
      const { service } = makeService({ products: [] })
      await expect(
        service.checkout({ items: [{ productId: PRODUCT.id, quantity: 1 }], customer: CUSTOMER })
      ).rejects.toBeInstanceOf(BadRequestException)
    })
  })

  describe('webhook signature', () => {
    function makeEvent(secret: string, status = 'APPROVED'): WompiEventPayload {
      const txn = { id: 'txn-1', reference: 'BOX33-1-abc', status, amount_in_cents: 8_500_000 }
      const timestamp = 1700000000
      const checksum = createHash('sha256')
        .update(`${txn.id}${txn.status}${txn.amount_in_cents}${timestamp}${secret}`)
        .digest('hex')
      return {
        event: 'transaction.updated',
        data: { transaction: txn as never },
        signature: {
          properties: ['transaction.id', 'transaction.status', 'transaction.amount_in_cents'],
          checksum,
        },
        timestamp,
      }
    }

    it('accepts a correctly signed event', () => {
      const { service } = makeService()
      expect(
        service.verifyWebhookSignature(makeEvent(WOMPI.eventsSecret), WOMPI.eventsSecret)
      ).toBe(true)
    })

    it('rejects a tampered checksum', () => {
      const { service } = makeService()
      const event = makeEvent(WOMPI.eventsSecret)
      event.signature.checksum = 'f'.repeat(64)
      expect(service.verifyWebhookSignature(event, WOMPI.eventsSecret)).toBe(false)
    })

    it('rejects an event signed with the wrong secret', () => {
      const { service } = makeService()
      expect(service.verifyWebhookSignature(makeEvent('other-secret'), WOMPI.eventsSecret)).toBe(
        false
      )
    })

    it('throws Unauthorized for a bad signature on a live payment', async () => {
      const pending: Partial<Payment> = {
        reference: 'BOX33-1-abc',
        status: 'PENDING',
        cartSnapshot: [],
        expiresAt: new Date(Date.now() + 60_000),
      }
      const { service } = makeService({ payment: pending })
      const event = makeEvent('other-secret')
      await expect(service.handleWebhookEvent(event)).rejects.toBeInstanceOf(UnauthorizedException)
    })

    it('is idempotent — terminal payments ignore further events', async () => {
      const confirmed: Partial<Payment> = {
        reference: 'BOX33-1-abc',
        status: 'CONFIRMED',
        orderId: 'order-1',
        cartSnapshot: [],
        expiresAt: new Date(),
      }
      const { service, dataSource } = makeService({ payment: confirmed })
      await service.handleWebhookEvent(makeEvent(WOMPI.eventsSecret))
      expect(dataSource.transaction).not.toHaveBeenCalled()
    })
  })

  describe('getStatus', () => {
    it('expires a PENDING payment past its deadline without calling Wompi', async () => {
      const pending: Partial<Payment> = {
        reference: 'BOX33-1-abc',
        status: 'PENDING',
        expiresAt: new Date(Date.now() - 1000),
      }
      const { service, paymentsRepo } = makeService({ payment: pending })
      const fetchSpy = vi.spyOn(globalThis, 'fetch')
      const result = await service.getStatus('BOX33-1-abc')
      expect(result.status).toBe('EXPIRED')
      expect(paymentsRepo.save).toHaveBeenCalled()
      expect(fetchSpy).not.toHaveBeenCalled()
    })

    it('returns terminal status without polling', async () => {
      const confirmed: Partial<Payment> = {
        reference: 'BOX33-1-abc',
        status: 'CONFIRMED',
        orderId: 'order-9',
        expiresAt: new Date(),
      }
      const { service } = makeService({ payment: confirmed })
      const fetchSpy = vi.spyOn(globalThis, 'fetch')
      await expect(service.getStatus('BOX33-1-abc')).resolves.toEqual({
        status: 'CONFIRMED',
        orderId: 'order-9',
      })
      expect(fetchSpy).not.toHaveBeenCalled()
    })
  })
})
