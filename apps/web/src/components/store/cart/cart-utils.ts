export interface CartItem {
  productId: string
  slug: string
  name: string
  size: string | null
  quantity: number
  priceCents: number
  imageUrl: string | null
}

const MAX_QTY = 10

/** A line is identified by product + size ('M' and 'L' are separate lines). */
export const lineKey = (productId: string, size: string | null) => `${productId}|${size ?? ''}`

/** Adds a line, merging quantities when the same product+size already exists. */
export function addLine(items: CartItem[], line: CartItem): CartItem[] {
  const key = lineKey(line.productId, line.size)
  const existing = items.find((i) => lineKey(i.productId, i.size) === key)
  if (!existing) return [...items, { ...line, quantity: clampQty(line.quantity) }]
  return items.map((i) =>
    lineKey(i.productId, i.size) === key
      ? { ...i, quantity: clampQty(i.quantity + line.quantity) }
      : i
  )
}

export function removeLine(items: CartItem[], productId: string, size: string | null): CartItem[] {
  const key = lineKey(productId, size)
  return items.filter((i) => lineKey(i.productId, i.size) !== key)
}

/** Sets a line's quantity; qty ≤ 0 removes the line. */
export function setLineQty(
  items: CartItem[],
  productId: string,
  size: string | null,
  quantity: number
): CartItem[] {
  if (quantity <= 0) return removeLine(items, productId, size)
  const key = lineKey(productId, size)
  return items.map((i) =>
    lineKey(i.productId, i.size) === key ? { ...i, quantity: clampQty(quantity) } : i
  )
}

export function cartTotals(items: CartItem[]): { totalCents: number; count: number } {
  return items.reduce(
    (acc, i) => ({
      totalCents: acc.totalCents + i.priceCents * i.quantity,
      count: acc.count + i.quantity,
    }),
    { totalCents: 0, count: 0 }
  )
}

function clampQty(qty: number): number {
  return Math.min(MAX_QTY, Math.max(1, Math.floor(qty)))
}
