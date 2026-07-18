import { describe, expect, it } from 'vitest'
import { addLine, cartTotals, removeLine, setLineQty, type CartItem } from './cart-utils'

const item = (overrides: Partial<CartItem> = {}): CartItem => ({
  productId: 'p1',
  slug: 'top-nike-verde',
  name: 'Top Nike Verde',
  size: 'M',
  quantity: 1,
  priceCents: 8_500_000,
  imageUrl: null,
  ...overrides,
})

describe('cart-utils', () => {
  it('adds a new line', () => {
    expect(addLine([], item())).toHaveLength(1)
  })

  it('merges quantities for the same product + size', () => {
    const cart = addLine(addLine([], item()), item({ quantity: 2 }))
    expect(cart).toHaveLength(1)
    expect(cart[0]?.quantity).toBe(3)
  })

  it('keeps different sizes as separate lines', () => {
    const cart = addLine(addLine([], item({ size: 'M' })), item({ size: 'L' }))
    expect(cart).toHaveLength(2)
  })

  it('clamps quantity to 10', () => {
    const cart = addLine(addLine([], item({ quantity: 9 })), item({ quantity: 5 }))
    expect(cart[0]?.quantity).toBe(10)
  })

  it('removes a line by product + size', () => {
    const cart = addLine(addLine([], item({ size: 'M' })), item({ size: 'L' }))
    const after = removeLine(cart, 'p1', 'M')
    expect(after).toHaveLength(1)
    expect(after[0]?.size).toBe('L')
  })

  it('setLineQty updates and removes at zero', () => {
    const cart = addLine([], item())
    expect(setLineQty(cart, 'p1', 'M', 4)[0]?.quantity).toBe(4)
    expect(setLineQty(cart, 'p1', 'M', 0)).toHaveLength(0)
  })

  it('computes totals across lines', () => {
    const cart = addLine(
      addLine([], item({ quantity: 2 })),
      item({ productId: 'p2', size: null, priceCents: 1_000_000 })
    )
    expect(cartTotals(cart)).toEqual({ totalCents: 18_000_000, count: 3 })
  })

  it('empty cart totals are zero', () => {
    expect(cartTotals([])).toEqual({ totalCents: 0, count: 0 })
  })
})
