// Intl formatters are expensive to construct, so build them once at module
// load instead of on every call. Locale-dependent ones are keyed by locale.
const COP = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0,
})

const DATE_TIME = {
  'en-US': new Intl.DateTimeFormat('en-US', {
    day: '2-digit',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
  }),
  'es-CO': new Intl.DateTimeFormat('es-CO', {
    day: '2-digit',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
  }),
} as const

const LONG_DATE = {
  'en-US': new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }),
  'es-CO': new Intl.DateTimeFormat('es-CO', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }),
} as const

/** Formats COP minor units for display: 8_500_000 → "$ 85.000". */
export function formatCOP(cents: number): string {
  return COP.format(Math.round(cents / 100))
}

export function formatDateTime(iso: string, locale: string): string {
  return DATE_TIME[locale === 'en' ? 'en-US' : 'es-CO'].format(new Date(iso))
}

export function formatLongDate(date: Date, locale: string): string {
  return LONG_DATE[locale === 'en' ? 'en-US' : 'es-CO'].format(date)
}
