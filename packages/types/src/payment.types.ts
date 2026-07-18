export type PaymentStatus = 'PENDING' | 'CONFIRMED' | 'FAILED' | 'CANCELLED' | 'EXPIRED'

export interface CartLineInput {
  productId: string
  quantity: number
  size?: string | null
}

export interface CheckoutCustomerInput {
  name: string
  email: string
  phone: string
}

export interface CheckoutInput {
  items: CartLineInput[]
  customer: CheckoutCustomerInput
}

export interface CheckoutSession {
  reference: string
  /** Wompi hosted checkout URL to redirect the customer to. */
  checkoutUrl: string
  amountCents: number
  currency: string
  expiresAt: string
}

export interface CartSnapshotLine {
  productId: string
  name: string
  size: string | null
  quantity: number
  unitPriceCents: number
  subtotalCents: number
}

export interface PaymentRecord {
  id: string
  reference: string
  status: PaymentStatus
  amountCents: number
  currency: string
  orderId: string | null
  wompiTransactionId: string | null
  customerName: string | null
  customerEmail: string | null
  customerPhone: string | null
  cartSnapshot: CartSnapshotLine[]
  expiresAt: string
  createdAt: string
  updatedAt: string
}

export interface PaymentStatusResponse {
  status: PaymentStatus
  orderId?: string
}
