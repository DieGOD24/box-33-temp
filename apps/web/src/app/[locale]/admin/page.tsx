import Image from 'next/image'
import { getTranslations, setRequestLocale, getLocale } from 'next-intl/server'
import { redirect } from '@/i18n/navigation'
import { getSessionToken } from '@/lib/auth/session'
import { LoginForm } from '@/components/admin/LoginForm'

export default async function AdminLoginPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  setRequestLocale(locale)

  if (await getSessionToken()) {
    redirect({ href: '/admin/resumen', locale: await getLocale() })
  }

  const t = await getTranslations('admin.login')

  return (
    <div className="bg-surface-dark flex min-h-screen items-center justify-center px-5">
      <div className="border-bone/10 bg-surface w-full max-w-sm border p-8">
        <div className="mb-6 flex flex-col items-center gap-3">
          <Image
            src="/images/logo-box33.png"
            alt={t('logoAlt')}
            width={100}
            height={60}
            className="h-14 w-auto drop-shadow-[0_0_8px_rgba(255,255,255,.25)]"
          />
          <span className="bg-gold font-condensed -rotate-[1.5deg] px-2.5 py-[3px] text-xs font-bold tracking-[2.5px] text-[#171712] uppercase">
            {t('title')}
          </span>
          <p className="text-bone/55 text-center text-sm">{t('subtitle')}</p>
        </div>
        <LoginForm />
      </div>
    </div>
  )
}
