import { Suspense } from 'react'
import { getLocale, getTranslations, setRequestLocale } from 'next-intl/server'
import { requireAuth } from '@/lib/auth/session'
import { getLeads } from '@/lib/api/admin'
import { getSiteContent } from '@/lib/api/queries'
import { buildWaLink } from '@/lib/wa'
import { formatDateTime } from '@/lib/format'
import { ADMIN_CARD, ADMIN_SUBTITLE, ADMIN_TITLE } from '@/components/admin/ui'
import { ClearLeadsButton } from '@/components/admin/ClearLeadsButton'
import { AdminPager } from '@/components/admin/AdminPager'

export default async function LeadsAdminPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ pagina?: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  const sp = await searchParams
  const page = Math.max(1, parseInt(sp.pagina ?? '1', 10) || 1)
  const token = await requireAuth()
  const [leads, content, t, tGoals, currentLocale] = await Promise.all([
    getLeads(token, page),
    getSiteContent(),
    getTranslations('admin.leads'),
    getTranslations('goals'),
    getLocale(),
  ])

  return (
    <div className="flex flex-col gap-[22px]">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className={ADMIN_TITLE}>{t('title')}</h1>
          <p className={ADMIN_SUBTITLE}>{t('subtitle')}</p>
        </div>
        {leads.total > 0 && <ClearLeadsButton />}
      </div>

      <div className={ADMIN_CARD}>
        {leads.items.length === 0 ? (
          <p className="text-bone/50 py-6 text-center">{t('empty')}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] text-left text-sm">
              <thead>
                <tr className="border-bone/15 font-condensed text-bone/50 border-b tracking-wider uppercase">
                  <th className="py-2 pr-3">{t('name')}</th>
                  <th className="py-2 pr-3">{t('phone')}</th>
                  <th className="py-2 pr-3">{t('goal')}</th>
                  <th className="py-2 pr-3">{t('date')}</th>
                  <th className="py-2" />
                </tr>
              </thead>
              <tbody>
                {leads.items.map((lead) => (
                  <tr key={lead.id} className="border-bone/10 border-b border-dashed">
                    <td className="text-bone py-2.5 pr-3">{lead.name}</td>
                    <td className="font-led text-bone/70 py-2.5 pr-3">{lead.phone}</td>
                    <td className="text-bone/70 py-2.5 pr-3">{tGoals(lead.goal)}</td>
                    <td className="text-bone/45 py-2.5 pr-3 whitespace-nowrap">
                      {formatDateTime(lead.createdAt, currentLocale)}
                    </td>
                    <td className="py-2.5 text-right">
                      <a
                        href={buildWaLink(lead.phone, `Hola ${lead.name}! Somos BOX33 💪`)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="border-wa/60 font-condensed text-wa hover:bg-wa/10 inline-flex border px-3 py-1.5 text-xs font-bold tracking-wider uppercase"
                      >
                        {t('contact')}
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <Suspense fallback={null}>
          <AdminPager page={leads.page} pages={leads.pages} />
        </Suspense>
      </div>
    </div>
  )
}
