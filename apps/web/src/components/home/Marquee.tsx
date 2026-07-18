import { getTranslations } from 'next-intl/server'
import { Bolt } from '@/components/icons/Bolt'

export async function Marquee() {
  const t = await getTranslations('marquee')
  const items = [t('freeClass'), t('openBox'), t('apparel'), t('hashtag')]

  const track = (ariaHidden: boolean) => (
    <div className="flex items-center py-3" aria-hidden={ariaHidden}>
      {items.map((item, i) => (
        <span key={item} className="flex items-center">
          <span
            className={`font-condensed px-[26px] text-base font-semibold tracking-[3px] uppercase ${
              i % 2 === 0 ? 'text-moss' : 'text-bone'
            }`}
          >
            {item}
          </span>
          <Bolt />
        </span>
      ))}
    </div>
  )

  return (
    <div className="border-bone/10 bg-carbon-deep overflow-hidden border-y">
      <div className="animate-marquee flex w-max whitespace-nowrap">
        {track(false)}
        {track(true)}
      </div>
    </div>
  )
}
