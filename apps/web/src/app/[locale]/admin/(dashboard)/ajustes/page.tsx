import { getTranslations, setRequestLocale } from 'next-intl/server'
import { requireAuth } from '@/lib/auth/session'
import { getAdminContent } from '@/lib/api/admin'
import { ADMIN_SUBTITLE, ADMIN_TITLE } from '@/components/admin/ui'
import { SettingsForm } from '@/components/admin/SettingsForm'

export default async function SettingsAdminPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  await requireAuth()
  const [content, t] = await Promise.all([getAdminContent(), getTranslations('admin.settings')])

  return (
    <div className="flex max-w-[560px] flex-col gap-[22px]">
      <div>
        <h1 className={ADMIN_TITLE}>{t('title')}</h1>
        <p className={ADMIN_SUBTITLE}>{t('subtitle')}</p>
      </div>
      <SettingsForm initial={content.settings} />
    </div>
  )
}
