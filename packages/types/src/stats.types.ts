import type { Lead } from './lead.types'
import type { Order } from './order.types'

/** Dashboard "Resumen" aggregate. */
export interface DashboardStats {
  productsTotal: number
  productsAvailable: number
  productsSoldOut: number
  ordersTotal: number
  revenueCents: number
  currency: string
  leadsTotal: number
  recentOrders: Order[]
  recentLeads: Lead[]
}
