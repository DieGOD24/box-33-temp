import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository, type EntityManager } from 'typeorm'
import type { CartSnapshotLine, Order as OrderRecord, Paginated } from '@box33/types'
import { Order } from './entities/order.entity'
import { OrderItem } from './entities/order-item.entity'

const ORDER_STATUSES = ['paid', 'delivered', 'cancelled'] as const
const DEFAULT_LIMIT = 20
const MAX_LIMIT = 100

@Injectable()
export class OrdersService {
  constructor(@InjectRepository(Order) private readonly orders: Repository<Order>) {}

  async adminList(page = 1, limit = DEFAULT_LIMIT): Promise<Paginated<OrderRecord>> {
    const safePage = Math.max(1, Math.floor(page))
    const safeLimit = Math.min(MAX_LIMIT, Math.max(1, Math.floor(limit)))
    const [items, total] = await this.orders.findAndCount({
      order: { createdAt: 'DESC' },
      skip: (safePage - 1) * safeLimit,
      take: safeLimit,
    })
    return {
      items: items.map((o) => this.serialize(o)),
      total,
      page: safePage,
      limit: safeLimit,
      pages: Math.max(1, Math.ceil(total / safeLimit)),
    }
  }

  async updateStatus(id: string, status: string): Promise<OrderRecord> {
    if (!(ORDER_STATUSES as readonly string[]).includes(status)) {
      throw new BadRequestException(`Invalid status — use one of: ${ORDER_STATUSES.join(', ')}`)
    }
    const order = await this.orders.findOne({ where: { id } })
    if (!order) throw new NotFoundException('Order not found')
    order.status = status
    return this.serialize(await this.orders.save(order))
  }

  /**
   * Materializes a paid order from a payment's cart snapshot. Runs inside the
   * CALLER's transaction manager so payment + order commit atomically.
   */
  async createFromSnapshot(
    em: EntityManager,
    input: {
      lines: CartSnapshotLine[]
      totalCents: number
      currency: string
      customerName: string
      customerEmail: string
      customerPhone: string
    }
  ): Promise<Order> {
    const items = input.lines.map((line) => {
      const item = new OrderItem()
      item.productId = line.productId
      item.name = line.name
      item.size = line.size
      item.quantity = line.quantity
      item.unitPriceCents = line.unitPriceCents
      item.subtotalCents = line.subtotalCents
      return item
    })
    const order = em.create(Order, {
      status: 'paid',
      totalCents: input.totalCents,
      currency: input.currency,
      customerName: input.customerName,
      customerEmail: input.customerEmail,
      customerPhone: input.customerPhone,
      items,
    })
    return em.save(order)
  }

  serialize(order: Order): OrderRecord {
    return {
      id: order.id,
      status: order.status as OrderRecord['status'],
      totalCents: order.totalCents,
      currency: order.currency,
      customerName: order.customerName,
      customerEmail: order.customerEmail,
      customerPhone: order.customerPhone,
      items: (order.items ?? []).map((i) => ({
        id: i.id,
        productId: i.productId,
        name: i.name,
        size: i.size,
        quantity: i.quantity,
        unitPriceCents: i.unitPriceCents,
        subtotalCents: i.subtotalCents,
      })),
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
    }
  }
}
