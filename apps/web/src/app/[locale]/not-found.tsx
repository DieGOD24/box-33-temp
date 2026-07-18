import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'

export default function NotFoundPage() {
  const t = useTranslations('notFound')

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-5 text-center">
      <p className="font-display text-[40px] tracking-wide uppercase">{t('title')}</p>
      <p className="text-bone/60 mt-2">{t('description')}</p>
      <Link
        href="/"
        className="border-bone/40 font-condensed text-bone hover:border-moss hover:text-moss mt-6 inline-flex border px-6 py-3.5 text-lg font-semibold tracking-[2.5px] uppercase transition-colors"
      >
        {t('cta')}
      </Link>
    </div>
  )
}
