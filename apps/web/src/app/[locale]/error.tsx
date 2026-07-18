'use client'

import { useTranslations } from 'next-intl'

export default function ErrorPage({ reset }: { error: Error; reset: () => void }) {
  const t = useTranslations('error')

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-5 text-center">
      <p className="font-display text-[40px] tracking-wide uppercase">{t('title')}</p>
      <p className="text-bone/60 mt-2">{t('description')}</p>
      <button
        type="button"
        onClick={reset}
        className="border-bone/40 font-condensed text-bone hover:border-moss hover:text-moss mt-6 inline-flex cursor-pointer border px-6 py-3.5 text-lg font-semibold tracking-[2.5px] uppercase transition-colors"
      >
        {t('retry')}
      </button>
    </div>
  )
}
