import { getTranslations } from 'next-intl/server'
import type { SiteSettings, Wod as WodData } from '@box33/types'
import { buildWaLink } from '@/lib/wa'
import { formatLongDate } from '@/lib/format'
import { Reveal } from './Reveal'

export async function Wod({
  wod,
  settings,
  locale,
}: {
  wod: WodData
  settings: SiteSettings
  locale: string
}) {
  const t = await getTranslations('wod')
  // Deterministic per request in a Server Component; hoisted out of JSX.
  const today = new Date()

  return (
    <section id="wod" className="px-[clamp(20px,5vw,64px)] py-[clamp(64px,9vw,110px)]">
      <Reveal className="mx-auto grid max-w-[1200px] grid-cols-[repeat(auto-fit,minmax(320px,1fr))] items-center gap-[clamp(28px,5vw,70px)]">
        <div>
          <p className="font-condensed text-moss mb-2.5 text-base font-semibold tracking-[6px] uppercase">
            {t('kicker')}
          </p>
          <h2 className="font-display mb-[18px] text-[clamp(36px,5vw,64px)] tracking-wide uppercase">
            {t('title')}
          </h2>
          <p className="text-bone/75 mb-[26px] max-w-[420px] text-[17px] leading-relaxed">
            {t('description')}
          </p>
          <a
            href={buildWaLink(settings.whatsappNumber, t('waMessage'))}
            target="_blank"
            rel="noopener noreferrer"
            className="border-wa font-condensed text-wa hover:bg-wa inline-flex items-center gap-2.5 border bg-transparent px-[26px] py-3.5 text-lg font-semibold tracking-[2.5px] uppercase transition-colors hover:text-[#141510]"
          >
            {t('cta')}
          </a>
        </div>
        {/* The chalkboard */}
        <div className="relative -rotate-[.8deg]">
          <div className="border-frame bg-chalk rounded border-[10px] p-[clamp(22px,3.5vw,38px)] text-[#20211b] shadow-[0_22px_46px_rgba(0,0,0,.5)]">
            <div className="mb-4 flex items-center justify-between gap-2.5 border-b-2 border-[rgba(32,33,27,.15)] pb-3">
              <span className="font-marker text-olive-deep text-[clamp(20px,2.4vw,26px)]">
                {wod.title}
              </span>
              <span
                className="font-condensed text-sm font-bold tracking-[2px] text-[#8a8a80] uppercase"
                suppressHydrationWarning
              >
                {formatLongDate(today, locale)}
              </span>
            </div>
            <pre className="font-marker m-0 text-[clamp(19px,2.3vw,25px)] leading-[1.65] whitespace-pre-wrap text-[#26271f]">
              {wod.text}
            </pre>
            <div className="mt-3.5 flex justify-end">
              <span className="font-marker text-crimson -rotate-2 text-[15px]">
                {t('signature')}
              </span>
            </div>
          </div>
          <div className="bg-crimson absolute -top-[11px] left-[26px] h-3.5 w-3.5 rounded-full shadow-[0_2px_4px_rgba(0,0,0,.4)]" />
          <div className="bg-olive-deep absolute -top-[11px] right-[26px] h-3.5 w-3.5 rounded-full shadow-[0_2px_4px_rgba(0,0,0,.4)]" />
        </div>
      </Reveal>
    </section>
  )
}
