import { setRequestLocale } from 'next-intl/server'
import { getSiteContent } from '@/lib/api/queries'

// Render at request time: the API isn't reachable during `next build` (CI
// builds the web image without a running stack). Data stays cached via the
// tagged fetch() calls (revalidate 60 + on-demand revalidation), so this only
// moves HTML assembly to request time — not the data fetching.
export const dynamic = 'force-dynamic'
import { SiteHeader } from '@/components/layout/SiteHeader'
import { SiteFooter } from '@/components/layout/SiteFooter'
import { WaFloat } from '@/components/layout/WaFloat'
import { CartProvider } from '@/components/store/cart/CartProvider'
import { CartDrawer } from '@/components/store/cart/CartDrawer'

export default async function PublicLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  const content = await getSiteContent()

  return (
    <CartProvider>
      <SiteHeader settings={content.settings} />
      <main>{children}</main>
      <SiteFooter settings={content.settings} />
      <WaFloat whatsappNumber={content.settings.whatsappNumber} />
      <CartDrawer />
    </CartProvider>
  )
}
