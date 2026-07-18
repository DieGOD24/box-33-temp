import Image from 'next/image'
import { getTranslations } from 'next-intl/server'
import type { Podium as PodiumData, PodiumEntry } from '@box33/types'
import { Bolt, TripleChevron } from '@/components/icons/Bolt'
import { Reveal } from './Reveal'

const MEDAL: Record<number, { color: string; height: number }> = {
  1: { color: '#C9A648', height: 168 },
  2: { color: '#B6BCC4', height: 128 },
  3: { color: '#B07A45', height: 100 },
}

/** Podium visual order: silver, gold, bronze (gold center + tallest). */
const DISPLAY_ORDER: Array<1 | 2 | 3> = [2, 1, 3]

// Built once at module load rather than on every render (see lib/format.ts).
const MONTH = {
  'en-US': new Intl.DateTimeFormat('en-US', { month: 'long' }),
  'es-CO': new Intl.DateTimeFormat('es-CO', { month: 'long' }),
} as const

function initials(name: string): string {
  return name
    .split(/\s+/)
    .map((w) => w[0] ?? '')
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

function PodiumPlace({ entry, photoAlt }: { entry: PodiumEntry; photoAlt: string }) {
  const medal = MEDAL[entry.place] ?? MEDAL[3]!

  return (
    <div className="flex max-w-[250px] min-w-40 flex-1 basis-[200px] flex-col items-center text-center">
      <div
        className="relative mb-3.5 h-[clamp(96px,11vw,120px)] w-[clamp(96px,11vw,120px)] overflow-hidden rounded-full"
        style={{ boxShadow: `0 0 0 4px #191a15, 0 0 0 7px ${medal.color}` }}
      >
        {entry.photoUrl ? (
          <Image src={entry.photoUrl} alt={photoAlt} fill sizes="120px" className="object-cover" />
        ) : (
          <div className="bg-bone/10 font-display text-bone/50 flex h-full w-full items-center justify-center text-3xl">
            {initials(entry.name)}
          </div>
        )}
      </div>
      <h3 className="font-condensed text-bone mb-[3px] text-[clamp(19px,2.1vw,23px)] font-bold tracking-wide uppercase">
        {entry.name}
      </h3>
      <p className="text-bone/60 mb-4 max-w-[200px] text-[13.5px] leading-snug">
        {entry.achievement}
      </p>
      <div
        className="relative flex w-full items-start justify-center overflow-hidden rounded-t-md pt-3.5 shadow-[inset_0_2px_0_rgba(255,255,255,.25),0_-3px_14px_rgba(0,0,0,.35)]"
        style={{
          height: medal.height,
          background: `linear-gradient(180deg, ${medal.color} 0%, rgba(0,0,0,.35) 260%)`,
        }}
      >
        <span
          aria-hidden="true"
          className="animate-shine pointer-events-none absolute top-0 bottom-0 w-[38%] bg-gradient-to-r from-transparent via-white/40 to-transparent"
        />
        <span className="font-display relative text-[clamp(40px,5.5vw,64px)] leading-none text-[rgba(23,23,18,.55)] [text-shadow:0_1px_0_rgba(255,255,255,.25)]">
          {entry.place}
        </span>
      </div>
    </div>
  )
}

export async function Podium({ podium, locale }: { podium: PodiumData; locale: string }) {
  const t = await getTranslations('podium')
  const month =
    podium.month || MONTH[locale === 'en' ? 'en-US' : 'es-CO'].format(new Date())
  const byPlace = new Map(podium.entries.map((e) => [e.place, e]))

  return (
    <section
      id="podio"
      className="border-bone/[.08] bg-carbon-soft relative overflow-hidden border-t px-[clamp(20px,5vw,64px)] py-[clamp(64px,9vw,110px)]"
    >
      <svg
        width="360"
        height="560"
        viewBox="0 0 14 22"
        fill="rgba(201,166,72,.05)"
        aria-hidden="true"
        className="pointer-events-none absolute top-10 -left-[90px] -rotate-[12deg]"
      >
        <path d="M8.8 0 0 12.6h4.4L3.2 22 14 8.4H8.6L11.4 0Z" />
      </svg>
      <Reveal className="relative mx-auto max-w-[1120px]">
        <div className="mb-[clamp(34px,5vw,54px)] flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="mb-2.5 flex items-center gap-3.5">
              <p className="font-condensed text-moss text-base font-semibold tracking-[6px] uppercase">
                {t('kicker')}
              </p>
              <TripleChevron />
            </div>
            <h2 className="font-display text-[clamp(34px,4.8vw,60px)] tracking-wide uppercase">
              {t('title')}
            </h2>
          </div>
          <span className="bg-gold font-condensed inline-flex -rotate-1 items-center gap-[9px] px-[18px] py-2 text-base font-bold tracking-[3px] text-[#171712] uppercase shadow-[0_3px_10px_rgba(0,0,0,.35)]">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M5 4h14v3a5 5 0 0 1-4 4.9V14a3 3 0 0 0 3 3h.5v2H5.5v-2H6a3 3 0 0 0 3-3v-2.1A5 5 0 0 1 5 7V4Zm2 2v1a3 3 0 0 0 2 2.8V6H7Zm8 0v3.8A3 3 0 0 0 17 7V6h-2Z" />
            </svg>
            {month}
          </span>
        </div>

        <div className="flex flex-wrap items-end justify-center gap-[clamp(14px,3vw,30px)]">
          {DISPLAY_ORDER.map((place) => {
            const entry = byPlace.get(place)
            if (!entry) return null
            return (
              <PodiumPlace
                key={place}
                entry={entry}
                photoAlt={t('photoAlt', { name: entry.name })}
              />
            )
          })}
        </div>

        {podium.mentions.length > 0 && (
          <div className="border-bone/[.14] mt-[clamp(34px,5vw,52px)] border-t border-dashed pt-[26px]">
            <p className="font-condensed text-bone/50 mb-4 text-sm font-semibold tracking-[4px] uppercase">
              {t('mentions')}
            </p>
            <div className="flex flex-wrap gap-3">
              {podium.mentions.map((mention) => (
                <div
                  key={`${mention.name}-${mention.achievement}`}
                  className="border-bone/[.12] bg-carbon flex items-center gap-2.5 border px-4 py-2.5"
                >
                  <Bolt width={9} height={14} fill="#C9A648" />
                  <div>
                    <span className="font-condensed text-bone text-[15px] font-bold tracking-wide uppercase">
                      {mention.name}
                    </span>
                    <span className="text-bone/55 text-[13px]"> — {mention.achievement}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </Reveal>
    </section>
  )
}
