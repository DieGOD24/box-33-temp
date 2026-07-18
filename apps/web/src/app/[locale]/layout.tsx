import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { NextIntlClientProvider, hasLocale } from 'next-intl'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { Anton, Barlow, Barlow_Condensed, Chakra_Petch, Permanent_Marker } from 'next/font/google'
import { Toaster } from 'sonner'
import { routing } from '@/i18n/routing'
import '../globals.css'

const anton = Anton({ weight: '400', subsets: ['latin'], variable: '--font-anton' })
const barlow = Barlow({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-barlow',
})
const barlowCondensed = Barlow_Condensed({
  weight: ['500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-barlow-condensed',
})
const permanentMarker = Permanent_Marker({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-permanent-marker',
})
const chakraPetch = Chakra_Petch({
  weight: ['600', '700'],
  subsets: ['latin'],
  variable: '--font-chakra-petch',
})

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'metadata' })
  return {
    title: t('title'),
    description: t('description'),
    icons: { icon: '/images/logo-box33.png' },
  }
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) notFound()
  setRequestLocale(locale)

  return (
    <html lang={locale}>
      <body
        className={`${anton.variable} ${barlow.variable} ${barlowCondensed.variable} ${permanentMarker.variable} ${chakraPetch.variable} bg-carbon text-bone font-body`}
      >
        <NextIntlClientProvider>{children}</NextIntlClientProvider>
        <Toaster theme="dark" position="bottom-center" />
      </body>
    </html>
  )
}
