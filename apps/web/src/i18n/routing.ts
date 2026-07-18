import { defineRouting } from 'next-intl/routing'
import { defaultLocale, locales } from './config'

export const routing = defineRouting({
  locales,
  defaultLocale,
  // '/' is Spanish, '/en/…' is English — the bilingual switch the site needs.
  localePrefix: 'as-needed',
  // Always serve the default locale (Spanish) at '/' instead of negotiating the
  // browser's Accept-Language — visitors switch to English explicitly via the
  // language toggle. Without this, an English-language browser gets redirected
  // '/' → '/en', which also broke the Spanish e2e smoke tests.
  localeDetection: false,
})
