import { getLocale, getTranslations, setRequestLocale } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { requireAuth } from '@/lib/auth/session'
import { getStats } from '@/lib/api/admin'
import { formatCOP, formatDateTime } from '@/lib/format'
import { ADMIN_CARD, ADMIN_TITLE } from '@/components/admin/ui'

const QUICK_LINKS = [
  { href: '/admin/pizarra', key: 'goWod' },
  { href: '/admin/reto', key: 'goChallenge' },
  { href: '/admin/podio', key: 'goPodium' },
  { href: '/admin/planes', key: 'goPlans' },
  { href: '/admin/inventario', key: 'goInventory' },
  { href: '/admin/horarios', key: 'goSchedule' },
] as const

export default async function OverviewPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  setRequestLocale(locale)
  const token = await requireAuth()
  const [stats, t, tGoals, currentLocale] = await Promise.all([
    getStats(token),
    getTranslations('admin.overview'),
    getTranslations('goals'),
    getLocale(),
  ])

  const statCards = [
    { label: t('productsTotal'), value: String(stats.productsTotal), color: 'text-moss' },
    { label: t('productsAvailable'), value: String(stats.productsAvailable), color: 'text-bone' },
    { label: t('productsSoldOut'), value: String(stats.productsSoldOut), color: 'text-ember' },
    { label: t('orders'), value: String(stats.ordersTotal), color: 'text-wa' },
    { label: t('revenue'), value: formatCOP(stats.revenueCents), color: 'text-gold' },
    { label: t('leads'), value: String(stats.leadsTotal), color: 'text-moss-bright' },
  ]

  return (
    <div className="flex flex-col gap-[22px]">
      <h1 className={ADMIN_TITLE}>{t('title')}</h1>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(170px,1fr))] gap-3">
        {statCards.map((card) => (
          <div key={card.label} className="border-bone/10 bg-surface border px-5 py-[18px]">
            <p className="font-condensed text-bone/50 mb-1.5 text-xs font-semibold tracking-[3px] uppercase">
              {card.label}
            </p>
            <p className={`font-led text-[28px] font-bold ${card.color}`}>{card.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] items-start gap-[22px]">
        <div className={ADMIN_CARD}>
          <h2 className="font-condensed mb-3.5 text-lg font-bold tracking-[3px] uppercase">
            {t('recentOrders')}
          </h2>
          {stats.recentOrders.length === 0 ? (
            <p className="text-bone/45 text-sm leading-relaxed">{t('noOrders')}</p>
          ) : (
            <div className="flex flex-col">
              {stats.recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="border-bone/[.12] flex justify-between gap-2.5 border-b border-dashed py-2 text-sm"
                >
                  <span className="text-bone">{order.customerName}</span>
                  <span className="font-led text-moss">{formatCOP(order.totalCents)}</span>
                  <span className="text-bone/45 whitespace-nowrap">
                    {formatDateTime(order.createdAt, currentLocale)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className={ADMIN_CARD}>
          <h2 className="font-condensed mb-3.5 text-lg font-bold tracking-[3px] uppercase">
            {t('recentLeads')}
          </h2>
          {stats.recentLeads.length === 0 ? (
            <p className="text-bone/45 text-sm leading-relaxed">{t('noLeads')}</p>
          ) : (
            <div className="flex flex-col">
              {stats.recentLeads.map((lead) => (
                <div
                  key={lead.id}
                  className="border-bone/[.12] flex justify-between gap-2.5 border-b border-dashed py-2 text-sm"
                >
                  <span className="text-bone">{lead.name}</span>
                  <span className="text-bone/60">{tGoals(lead.goal)}</span>
                  <span className="text-bone/45 whitespace-nowrap">
                    {formatDateTime(lead.createdAt, currentLocale)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className={ADMIN_CARD}>
        <h2 className="font-condensed mb-3.5 text-lg font-bold tracking-[3px] uppercase">
          {t('quickActions')}
        </h2>
        <div className="flex flex-col gap-2.5">
          {QUICK_LINKS.map(({ href, key }) => (
            <Link
              key={href}
              href={href}
              className="border-bone/20 bg-surface-dark font-condensed text-bone hover:border-moss hover:text-moss border px-4 py-[13px] text-left text-base font-semibold tracking-[2px] uppercase transition-colors"
            >
              {t(key)}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
