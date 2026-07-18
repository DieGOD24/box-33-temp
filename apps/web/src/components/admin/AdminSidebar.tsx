'use client'

import { useLocale, useTranslations } from 'next-intl'
import { Link, usePathname } from '@/i18n/navigation'
import { cn } from '@/lib/cn'

// Intl formatters are expensive to build, so construct them once at module load
// instead of on every render. The pinned timeZone keeps SSR and client output on
// the same calendar day (the site is Colombian: es-CO / COP).
const TODAY_FORMAT = {
  'en-US': new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    timeZone: 'America/Bogota',
  }),
  'es-CO': new Intl.DateTimeFormat('es-CO', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    timeZone: 'America/Bogota',
  }),
} as const

const SECTIONS = [
  { slug: 'resumen', key: 'overview' },
  { slug: 'pizarra', key: 'wod' },
  { slug: 'reto', key: 'challenge' },
  { slug: 'podio', key: 'podium' },
  { slug: 'planes', key: 'plans' },
  { slug: 'horarios', key: 'schedule' },
  { slug: 'inventario', key: 'inventory' },
  { slug: 'pedidos', key: 'orders' },
  { slug: 'leads', key: 'leads' },
  { slug: 'ajustes', key: 'settings' },
] as const

export function AdminSidebar() {
  const t = useTranslations('admin.nav')
  const locale = useLocale()
  const pathname = usePathname()

  const today = TODAY_FORMAT[locale === 'en' ? 'en-US' : 'es-CO'].format(new Date())

  return (
    <nav className="border-bone/10 sticky top-[82px] flex w-[200px] min-w-[170px] flex-none flex-col gap-1 border bg-[#181912] p-2.5">
      {SECTIONS.map(({ slug, key }) => {
        const href = `/admin/${slug}`
        const active = pathname.startsWith(href)
        return (
          <Link
            key={slug}
            href={href}
            className={cn(
              'font-condensed border-l-[3px] px-3 py-[11px] text-left text-[15px] font-semibold tracking-[2px] uppercase transition-colors',
              active
                ? 'border-moss bg-moss/[.12] text-moss'
                : 'text-bone/65 hover:text-bone border-transparent'
            )}
          >
            {t(key)}
          </Link>
        )
      })}
      <div className="border-bone/15 mt-3.5 border-t border-dashed px-3 pt-3 pb-1.5">
        <p className="font-condensed text-bone/40 mb-0.5 text-[11px] font-semibold tracking-[2px] uppercase">
          {t('today')}
        </p>
        <p className="font-led text-ember text-[13px] font-semibold [text-shadow:0_0_8px_rgba(255,90,60,.5)]">
          {today}
        </p>
      </div>
    </nav>
  )
}
