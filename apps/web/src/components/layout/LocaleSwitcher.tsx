'use client'

import { useLocale, useTranslations } from 'next-intl'
import { useRouter } from '@/i18n/navigation'

export function LocaleSwitcher() {
  const locale = useLocale()
  const router = useRouter()
  const t = useTranslations('common')
  const other = locale === 'es' ? 'en' : 'es'

  // Read the current path inside the handler instead of subscribing via
  // usePathname() (which re-renders on every URL change). Only the non-default
  // 'en' locale is prefixed (localePrefix: 'as-needed'), so strip '/en' to
  // recover the locale-less internal path that router.replace expects.
  const switchLocale = () => {
    const path = new URL(window.location.href).pathname
    const internal = locale === 'en' ? path.replace(/^\/en(?=\/|$)/, '') || '/' : path
    router.replace(internal, { locale: other })
  }

  return (
    <button
      type="button"
      onClick={switchLocale}
      aria-label={t('language')}
      className="border-bone/30 font-condensed text-bone/70 hover:border-moss hover:text-moss cursor-pointer border px-3 py-2 text-[13px] font-semibold tracking-[2px] uppercase transition-colors"
    >
      {other === 'en' ? 'EN' : 'ES'}
    </button>
  )
}
