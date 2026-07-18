import { getRequestConfig } from 'next-intl/server'
import { routing } from './routing'
import type { Locale } from './config'

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale
  if (!locale || !routing.locales.includes(locale as Locale)) {
    locale = routing.defaultLocale
  }

  // Static import paths so the bundler splits each locale into its own chunk.
  const messages =
    locale === 'en'
      ? (await import('../../messages/en.json')).default
      : (await import('../../messages/es.json')).default

  return { locale, messages }
})
