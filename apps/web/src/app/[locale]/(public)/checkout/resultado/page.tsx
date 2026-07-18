import { Suspense } from 'react'
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
      <Suspense
        fallback={
          <div className="border-bone/20 border-t-moss h-10 w-10 animate-spin rounded-full border-2" />
        }
      >
        <ResultClient />
      </Suspense>
    </section>
  )
}
