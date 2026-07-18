import Image from 'next/image'
import { getTranslations } from 'next-intl/server'
import type { SiteSettings } from '@box33/types'
import { Link } from '@/i18n/navigation'

export async function SiteFooter({ settings }: { settings: SiteSettings }) {
  const t = await getTranslations('footer')

  return (
    <footer className="border-bone/10 flex flex-wrap items-center justify-between gap-3.5 border-t px-[clamp(20px,5vw,64px)] py-[34px]">
      <Image
        src="/images/logo-box33.png"
        alt={t('logoAlt')}
        width={67}
        height={40}
        className="h-10 w-auto drop-shadow-[0_0_8px_rgba(255,255,255,.25)]"
      />
      <span className="text-bone/50 text-sm">{t('hours')}</span>
      <span className="text-bone/50 flex items-center gap-4 text-sm">
        <a
          href={`https://instagram.com/${settings.instagramHandle}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-bone/70"
        >
          @{settings.instagramHandle}
        </a>
        <Link
          href="/admin"
          title={t('adminPanel')}
          className="border-bone/20 font-condensed text-bone/45 hover:border-moss hover:text-moss inline-flex items-center gap-1.5 border px-3 py-[5px] text-xs tracking-[2px] uppercase transition-colors"
        >
          {t('adminPanel')}
        </Link>
      </span>
    </footer>
  )
}
