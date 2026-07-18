/** Builds a wa.me deep link: strips non-digits from the number, encodes the text. */
export function buildWaLink(number: string, text: string): string {
  const digits = number.replace(/[^0-9]/g, '')
  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`
}

/** '573113018283' → '311 301 8283' (last 10 digits, grouped for display). */
export function formatPhoneLabel(number: string): string {
  const digits = number.replace(/[^0-9]/g, '')
  if (digits.length < 10) return number
  return digits.slice(-10).replace(/(\d{3})(\d{3})(\d{4})/, '$1 $2 $3')
}
