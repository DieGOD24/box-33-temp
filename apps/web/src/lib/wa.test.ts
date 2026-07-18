import { describe, expect, it } from 'vitest'
import { buildWaLink, formatPhoneLabel } from './wa'

describe('buildWaLink', () => {
  it('strips non-digits from the number', () => {
    expect(buildWaLink('+57 311 301-8283', 'hola')).toBe('https://wa.me/573113018283?text=hola')
  })

  it('URL-encodes the message', () => {
    const link = buildWaLink('573113018283', 'Hola BOX33! ¿Qué tallas hay?')
    expect(link).toContain('wa.me/573113018283?text=')
    expect(decodeURIComponent(link.split('text=')[1] ?? '')).toBe('Hola BOX33! ¿Qué tallas hay?')
  })
})

describe('formatPhoneLabel', () => {
  it('groups the last 10 digits', () => {
    expect(formatPhoneLabel('573113018283')).toBe('311 301 8283')
  })

  it('returns short numbers untouched', () => {
    expect(formatPhoneLabel('12345')).toBe('12345')
  })
})
