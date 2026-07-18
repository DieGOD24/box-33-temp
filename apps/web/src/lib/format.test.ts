import { describe, expect, it } from 'vitest'
import { formatCOP } from './format'

describe('formatCOP', () => {
  it('formats minor units as whole COP pesos', () => {
    // Intl may use NBSP between symbol and number — normalize for the assert.
    expect(formatCOP(8_500_000).replace(/\s/g, ' ')).toBe('$ 85.000')
  })

  it('formats large amounts with thousands separators', () => {
    expect(formatCOP(39_000_000).replace(/\s/g, ' ')).toBe('$ 390.000')
  })

  it('rounds sub-peso remainders', () => {
    expect(formatCOP(150).replace(/\s/g, ' ')).toBe('$ 2')
  })

  it('formats zero', () => {
    expect(formatCOP(0).replace(/\s/g, ' ')).toBe('$ 0')
  })
})
