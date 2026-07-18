/** Formats COP minor units for display: 8_500_000 → "$ 85.000". */
export function formatCOP(cents: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(Math.round(cents / 100))
}

export function formatDateTime(iso: string, locale: string): string {
  return new Intl.DateTimeFormat(locale === 'en' ? 'en-US' : 'es-CO', {
    day: '2-digit',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(iso))
}

export function formatLongDate(date: Date, locale: string): string {
  return new Intl.DateTimeFormat(locale === 'en' ? 'en-US' : 'es-CO', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(date)
}
