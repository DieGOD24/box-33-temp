import { getTranslations } from 'next-intl/server'
import { TripleChevron } from '@/components/icons/Bolt'
import { Reveal } from './Reveal'

const ITEMS = [
  { num: '01', key: 'efficiency' },
  { num: '02', key: 'variety' },
  { num: '03', key: 'strength' },
  { num: '04', key: 'tribe' },
] as const

export async function Benefits() {
  const t = await getTranslations('benefits')

  return (
    <section className="border-bone/[.08] bg-carbon-soft border-b px-[clamp(20px,5vw,64px)] py-[clamp(64px,9vw,110px)]">
      <Reveal className="mx-auto max-w-[1200px]">
        <div className="mb-2.5 flex items-center gap-4">
          <p className="font-condensed text-moss text-base font-semibold tracking-[6px] uppercase">
            {t('kicker')}
          </p>
          <TripleChevron />
        </div>
        <h2 className="font-display mb-[42px] text-[clamp(32px,4.5vw,56px)] tracking-wide uppercase">
          {t('title')}
        </h2>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(230px,1fr))] gap-[18px]">
          {ITEMS.map(({ num, key }) => (
            <div
              key={key}
              className="border-bone/[.12] bg-carbon flex flex-col gap-2.5 border px-6 py-[26px]"
            >
              <span className="font-led text-sm font-bold tracking-[2px] text-[#8A9455]">
                {num}
              </span>
              <h3 className="font-condensed text-[21px] font-bold tracking-[2px] uppercase">
                {t(`items.${key}.title`)}
              </h3>
              <p className="text-bone/70 text-[15px] leading-relaxed">
                {t(`items.${key}.description`)}
              </p>
            </div>
          ))}
        </div>
      </Reveal>
    </section>
  )
}
