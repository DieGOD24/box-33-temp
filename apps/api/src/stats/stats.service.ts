import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Not, Repository } from 'typeorm'
import type { DashboardStats } from '@box33/types'
import { Product } from '../products/entities/product.entity'
import { Order } from '../orders/entities/order.entity'
import { Lead } from '../leads/entities/lead.entity'
import { OrdersService } from '../orders/orders.service'
import { LeadsService } from '../leads/leads.service'

const RECENT_COUNT = 5

@Injectable()
export class StatsService {
  constructor(
    @InjectRepository(Product) private readonly products: Repository<Product>,
    @InjectRepository(Order) private readonly orders: Repository<Order>,
    @InjectRepository(Lead) private readonly leads: Repository<Lead>,
    private readonly ordersService: OrdersService,
    private readonly leadsService: LeadsService
  ) {}

  async dashboard(): Promise<DashboardStats> {
    const [productsTotal, productsSoldOut, ordersTotal, leadsTotal, revenue, recentOrders, recent] =
      await Promise.all([
        this.products.count({ where: { active: true } }),
        this.products.count({ where: { active: true, soldOut: true } }),
        this.orders.count(),
        this.leads.count(),
        this.orders
          .createQueryBuilder('o')
          .select('COALESCE(SUM(o.totalCents), 0)', 'sum')
          .where('o.status != :cancelled', { cancelled: 'cancelled' })
          .getRawOne<{ sum: string }>(),
        this.orders.find({
          where: { status: Not('cancelled') },
          order: { createdAt: 'DESC' },
          take: RECENT_COUNT,
        }),
        this.leadsService.list(1, RECENT_COUNT),
      ])

    return {
      productsTotal,
      productsAvailable: productsTotal - productsSoldOut,
      productsSoldOut,
      ordersTotal,
      revenueCents: parseInt(revenue?.sum ?? '0', 10),
      currency: 'COP',
      leadsTotal,
      recentOrders: recentOrders.map((o) => this.ordersService.serialize(o)),
      recentLeads: recent.items,
    }
  }
}
