import Image from 'next/image'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { requireSession } from '@/lib/auth/session'
import { logout } from '@/lib/auth/actions'
import { AdminSidebar } from '@/components/admin/AdminSidebar'

export default async function AdminDashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  await requireSession()
  const t = await getTranslations('admin.nav')

  return (
    <div className="bg-surface-dark min-h-screen">
      <header className="border-bone/[.12] sticky top-0 z-50 flex h-16 items-center justify-between gap-3 border-b bg-[rgba(16,17,9,.96)] px-[clamp(16px,3vw,32px)] backdrop-blur-[10px]">
        <div className="flex items-center gap-3">
          <Image
            src="/images/logo-box33.png"
            alt="BOX33"
            width={60}
            height={36}
            className="h-9 w-auto drop-shadow-[0_0_8px_rgba(255,255,255,.25)]"
          />
          <span className="bg-gold font-condensed -rotate-[1.5deg] px-2.5 py-[3px] text-xs font-bold tracking-[2.5px] text-[#171712] uppercase">
            {t('badge')}
          </span>
        </div>
        <div className="flex items-center gap-2.5">
          <Link
            href="/"
            className="border-bone/30 font-condensed text-bone hover:border-moss hover:text-moss inline-flex items-center gap-2 border px-4 py-2 text-sm font-semibold tracking-[2px] uppercase transition-colors"
          >
            {t('viewSite')}
          </Link>
          <form action={logout}>
            <button
              type="submit"
              className="border-bone/20 font-condensed text-bone/60 hover:border-ember hover:text-ember cursor-pointer border px-4 py-2 text-sm font-semibold tracking-[2px] uppercase transition-colors"
            >
              {t('logout')}
            </button>
          </form>
        </div>
      </header>

      <div className="mx-auto flex max-w-[1360px] flex-wrap items-start gap-[clamp(16px,2.5vw,28px)] px-[clamp(14px,3vw,32px)] py-[clamp(18px,3vw,32px)]">
        <AdminSidebar />
        <main className="min-w-[min(100%,460px)] flex-1">{children}</main>
      </div>
    </div>
  )
}
