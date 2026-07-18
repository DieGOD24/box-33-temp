'use client'

import { useLocale, useTranslations } from 'next-intl'
import { usePathname, useRouter } from '@/i18n/navigation'

export function LocaleSwitcher() {
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()
  const t = useTranslations('common')
  const other = locale === 'es' ? 'en' : 'es'

  return (
    <button
      type="button"
      onClick={() => router.replace(pathname, { locale: other })}
      aria-label={t('language')}
      className="border-bone/30 font-condensed text-bone/70 hover:border-moss hover:text-moss cursor-pointer border px-3 py-2 text-[13px] font-semibold tracking-[2px] uppercase transition-colors"
    >
      {other === 'en' ? 'EN' : 'ES'}
    </button>
  )
}
