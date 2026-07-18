import Image from 'next/image'
import { getTranslations } from 'next-intl/server'
import type { SiteSettings } from '@box33/types'
import { TripleChevron } from '@/components/icons/Bolt'
import { Reveal } from './Reveal'

const PHOTOS = [
  '/images/community/community-01.jpg',
  '/images/community/community-02.jpg',
  '/images/community/community-03.jpg',
  '/images/community/community-04.jpg',
]

function InstagramIcon({ size = 17 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <rect x="2.5" y="2.5" width="19" height="19" rx="5.5" />
      <circle cx="12" cy="12" r="4.5" />
      <circle cx="17.8" cy="6.2" r="1.3" fill="currentColor" stroke="none" />
    </svg>
  )
}

export async function Community({ settings }: { settings: SiteSettings }) {
  const t = await getTranslations('community')
  const igUrl = `https://instagram.com/${settings.instagramHandle}`

  return (
    <section className="px-[clamp(20px,5vw,64px)] py-[clamp(64px,9vw,110px)]">
      <Reveal className="mx-auto max-w-[1280px]">
        <div className="mb-[34px] flex flex-wrap items-end justify-between gap-[18px]">
          <div>
            <div className="mb-2.5 flex items-center gap-4">
              <p className="font-condensed text-moss text-base font-semibold tracking-[6px] uppercase">
                {t('kicker')}
              </p>
              <TripleChevron />
            </div>
            <h2 className="font-display text-[clamp(32px,4.5vw,56px)] tracking-wide uppercase">
              {t('title')}
            </h2>
            <span className="font-condensed text-ember mt-3 inline-flex items-center gap-2 text-[13px] font-bold tracking-[3px] uppercase">
              <span className="animate-live-pulse bg-ember h-[9px] w-[9px] rounded-full" />
              {t('live')}
            </span>
          </div>
          <a
            href={igUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="border-bone/35 font-condensed text-bone hover:border-moss hover:text-moss inline-flex items-center gap-[9px] border px-6 py-3 text-[17px] font-semibold tracking-[2px] uppercase transition-colors"
          >
            <InstagramIcon />@{settings.instagramHandle}
          </a>
        </div>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-5">
          {PHOTOS.map((src, i) => (
            <a
              key={src}
              href={igUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block"
              style={{ transform: `rotate(${i % 2 === 0 ? 1.1 : -1.1}deg)` }}
            >
              <div className="bg-paper p-[10px_10px_28px] shadow-[0_14px_30px_rgba(0,0,0,.45)] transition-transform hover:-translate-y-1">
                <div className="relative aspect-[4/5] w-full overflow-hidden bg-[#101109]">
                  <Image
                    src={src}
                    alt={t('postAlt')}
                    fill
                    sizes="(max-width: 768px) 50vw, 300px"
                    className="object-cover"
                  />
                </div>
              </div>
            </a>
          ))}
        </div>
      </Reveal>
    </section>
  )
}
