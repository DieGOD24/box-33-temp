export type OrderStatus = 'paid' | 'delivered' | 'cancelled'

export interface OrderItem {
  id: string
  productId: string | null
  name: string
  size: string | null
  quantity: number
  /** Unit price in minor units at purchase time. */
  unitPriceCents: number
  subtotalCents: number
}

export interface Order {
  id: string
  status: OrderStatus
  totalCents: number
  currency: string
  customerName: string
  customerEmail: string
  customerPhone: string
  items: OrderItem[]
  createdAt: string
  updatedAt: string
}
