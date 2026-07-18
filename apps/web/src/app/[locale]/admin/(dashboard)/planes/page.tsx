import { getTranslations, setRequestLocale } from 'next-intl/server'
import { requireSession } from '@/lib/auth/session'
import { getAdminPlans } from '@/lib/api/admin'
import { ADMIN_SUBTITLE, ADMIN_TITLE } from '@/components/admin/ui'
import { PlanForm } from '@/components/admin/PlanForm'

export default async function PlansAdminPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  setRequestLocale(locale)
  const token = await requireSession()
  const [plans, t] = await Promise.all([getAdminPlans(token), getTranslations('admin.plans')])

  return (
    <div className="flex flex-col gap-[22px]">
      <div>
        <h1 className={ADMIN_TITLE}>{t('title')}</h1>
        <p className={ADMIN_SUBTITLE}>{t('subtitle')}</p>
      </div>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-4">
        {plans.map((plan) => (
          <PlanForm key={plan.key} plan={plan} />
        ))}
      </div>
    </div>
  )
}
