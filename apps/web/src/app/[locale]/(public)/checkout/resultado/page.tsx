import { setRequestLocale } from 'next-intl/server'
import { ResultClient } from '@/components/store/ResultClient'

export default async function CheckoutResultPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)

  return (
    <section className="flex min-h-[70vh] items-center justify-center px-[clamp(20px,5vw,64px)] py-[clamp(40px,6vw,72px)]">
      <ResultClient />
    </section>
  )
}
