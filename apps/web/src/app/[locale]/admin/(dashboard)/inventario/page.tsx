import { getTranslations, setRequestLocale } from 'next-intl/server'
import { requireSession } from '@/lib/auth/session'
import { getAdminProducts } from '@/lib/api/admin'
import { ADMIN_SUBTITLE, ADMIN_TITLE } from '@/components/admin/ui'
import { Inventory } from '@/components/admin/Inventory'

export default async function InventoryAdminPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  const token = await requireSession()
  const [products, t] = await Promise.all([
    getAdminProducts(token),
    getTranslations('admin.inventory'),
  ])

  return (
    <div className="flex flex-col gap-[18px]">
      <div>
        <h1 className={ADMIN_TITLE}>{t('title')}</h1>
        <p className={ADMIN_SUBTITLE}>{t('subtitle')}</p>
      </div>
      <Inventory products={products} />
    </div>
  )
}
