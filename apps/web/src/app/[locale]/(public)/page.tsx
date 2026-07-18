import { setRequestLocale } from 'next-intl/server'
import { getFeaturedProducts, getSiteContent } from '@/lib/api/queries'
import { Hero } from '@/components/home/Hero'
import { Marquee } from '@/components/home/Marquee'
import { Plans } from '@/components/home/Plans'
import { LiveStrip } from '@/components/home/LiveStrip'
import { Wod } from '@/components/home/Wod'
import { Challenge } from '@/components/home/Challenge'
import { ScheduleBoard } from '@/components/home/ScheduleBoard'
import { Benefits } from '@/components/home/Benefits'
import { Featured } from '@/components/home/Featured'
import { Podium } from '@/components/home/Podium'
import { Community } from '@/components/home/Community'
import { Contact } from '@/components/home/Contact'

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  setRequestLocale(locale)
  const [content, featured] = await Promise.all([getSiteContent(), getFeaturedProducts()])

  return (
    <>
      <Hero />
      <Marquee />
      <Plans plans={content.plans} settings={content.settings} />
      <LiveStrip schedule={content.schedule} />
      <Wod wod={content.wod} settings={content.settings} locale={locale} />
      <Challenge challenge={content.challenge} settings={content.settings} />
      <ScheduleBoard schedule={content.schedule} />
      <Benefits />
      <Featured products={featured} />
      <Podium podium={content.podium} locale={locale} />
      <Community settings={content.settings} />
      <Contact settings={content.settings} />
    </>
  )
}
