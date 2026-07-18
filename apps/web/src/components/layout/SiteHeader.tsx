import Image from 'next/image'
import { getTranslations } from 'next-intl/server'
import type { SiteSettings } from '@box33/types'
import { Link } from '@/i18n/navigation'
import { buildWaLink } from '@/lib/wa'
import { CartButton } from './CartButton'
import { LocaleSwitcher } from './LocaleSwitcher'

const NAV_LINK =
  'text-bone hover:text-moss uppercase tracking-[2.5px] text-[15px] font-semibold font-condensed transition-colors'

export async function SiteHeader({ settings }: { settings: SiteSettings }) {
  const t = await getTranslations('nav')
  const tw = await getTranslations('whatsapp')
  const waTrialHref = buildWaLink(settings.whatsappNumber, tw('trial'))

  return (
    <header className="border-bone/10 sticky top-0 z-50 flex h-[70px] items-center justify-between gap-3 border-b bg-[rgba(20,21,16,.94)] px-[clamp(16px,4vw,48px)] backdrop-blur-[10px]">
      <Link href="/#inicio" className="flex items-center">
        <Image
          src="/images/logo-box33.png"
          alt="BOX33"
          width={73}
          height={44}
          priority
          className="h-11 w-auto drop-shadow-[0_0_8px_rgba(255,255,255,.3)]"
        />
      </Link>
      <nav className="flex flex-wrap items-center gap-[clamp(10px,2.4vw,30px)]">
        <Link href="/#wod" className={NAV_LINK}>
          {t('wod')}
        </Link>
        <Link href="/#reto" className={NAV_LINK}>
          {t('challenge')}
        </Link>
        <Link href="/#planes" className={NAV_LINK}>
          {t('plans')}
        </Link>
        <Link href="/#podio" className={NAV_LINK}>
          {t('podium')}
        </Link>
        <Link href="/#horarios" className={NAV_LINK}>
          {t('schedule')}
        </Link>
        <Link href="/tienda" className={NAV_LINK}>
          {t('store')}
        </Link>
        <Link href="/#contacto" className={NAV_LINK}>
          {t('contact')}
        </Link>
        <a
          href={waTrialHref}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-olive font-condensed inline-flex items-center gap-2 px-4 py-[9px] text-[15px] font-semibold tracking-[2px] text-white uppercase transition-colors hover:bg-[#6E7A3B] hover:text-white"
        >
          {t('freeClass')}
        </a>
        <CartButton />
        <LocaleSwitcher />
      </nav>
    </header>
  )
}
