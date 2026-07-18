import { setRequestLocale } from 'next-intl/server'
import { getSiteContent } from '@/lib/api/queries'
import { CheckoutForm } from '@/components/store/CheckoutForm'

export default async function CheckoutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  setRequestLocale(locale)
  const content = await getSiteContent()

  return (
    <section className="px-[clamp(20px,5vw,64px)] py-[clamp(40px,6vw,72px)]">
      <div className="mx-auto max-w-[980px]">
        <CheckoutForm whatsappNumber={content.settings.whatsappNumber} />
      </div>
    </section>
  )
}
