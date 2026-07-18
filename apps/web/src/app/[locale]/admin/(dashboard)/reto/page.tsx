import { getTranslations, setRequestLocale } from 'next-intl/server'
import { requireAuth } from '@/lib/auth/session'
import { getAdminContent } from '@/lib/api/admin'
import { ADMIN_SUBTITLE, ADMIN_TITLE } from '@/components/admin/ui'
import { ChallengeForm } from '@/components/admin/ChallengeForm'

export default async function ChallengeAdminPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  await requireAuth()
  const [content, t] = await Promise.all([getAdminContent(), getTranslations('admin.challenge')])

  return (
    <div className="flex flex-col gap-[22px]">
      <div>
        <h1 className={ADMIN_TITLE}>{t('title')}</h1>
        <p className={ADMIN_SUBTITLE}>{t('subtitle')}</p>
      </div>
      <ChallengeForm initial={content.challenge} />
    </div>
  )
}
