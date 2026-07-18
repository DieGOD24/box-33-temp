import { defineRouting } from 'next-intl/routing'
import { defaultLocale, locales } from './config'

export const routing = defineRouting({
  locales,
  defaultLocale,
  // '/' is Spanish, '/en/…' is English — the bilingual switch the site needs.
  localePrefix: 'as-needed',
})
