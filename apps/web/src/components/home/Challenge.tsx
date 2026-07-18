import { getTranslations } from 'next-intl/server'
import type { Challenge as ChallengeData, SiteSettings } from '@box33/types'
import { Bolt } from '@/components/icons/Bolt'
import { buildWaLink } from '@/lib/wa'
import { Reveal } from './Reveal'

export async function Challenge({
  challenge,
  settings,
}: {
  challenge: ChallengeData
  settings: SiteSettings
}) {
  const t = await getTranslations('challenge')

  return (
    <section
      id="reto"
      className="bg-olive-deep relative overflow-hidden px-[clamp(20px,5vw,64px)] py-[clamp(56px,8vw,96px)]"
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: 'radial-gradient(120% 120% at 85% -10%,rgba(201,166,72,.35),transparent 55%)',
        }}
      />
      <svg
        viewBox="0 0 46 14"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-full opacity-[.06]"
      >
        <path
          d="M1 1 L8 7 L1 13 H6 L13 7 L6 1 Z M17 1 L24 7 L17 13 H22 L29 7 L22 1 Z M33 1 L40 7 L33 13 H38 L45 7 L38 1 Z"
          fill="#fff"
        />
      </svg>
      <Reveal className="relative mx-auto grid max-w-[1120px] grid-cols-[repeat(auto-fit,minmax(300px,1fr))] items-center gap-[clamp(28px,5vw,58px)]">
        <div>
          <div className="mb-3.5 flex items-center gap-3.5">
            <span className="bg-gold font-condensed inline-block -rotate-[1.6deg] px-3.5 py-1.5 text-sm font-bold tracking-[3px] text-[#171712] uppercase shadow-[0_3px_10px_rgba(0,0,0,.35)]">
              {t('badge')}
            </span>
            <Bolt fill="#C9A648" className="drop-shadow-[0_0_6px_rgba(201,166,72,.6)]" />
          </div>
          <h2 className="font-display mb-4 text-[clamp(34px,5vw,62px)] leading-[.98] tracking-wide text-white uppercase">
            {challenge.title}
          </h2>
          <p className="mb-[26px] max-w-[460px] text-[17px] leading-relaxed text-white/85">
            {challenge.description}
          </p>
          <a
            href={buildWaLink(settings.whatsappNumber, t('waMessage', { title: challenge.title }))}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-bone font-condensed inline-flex items-center gap-2.5 px-7 py-[15px] text-lg font-bold tracking-[2.5px] text-[#20211b] uppercase shadow-[5px_5px_0_rgba(0,0,0,.4)] transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5 hover:text-[#20211b]"
          >
            {t('cta')}
          </a>
        </div>
        <div className="flex flex-col gap-3.5">
          <div className="border border-white/[.18] bg-[rgba(13,14,10,.55)] px-6 py-[22px] backdrop-blur-xs">
            <p className="font-condensed mb-1.5 text-[13px] font-semibold tracking-[3px] text-white/55 uppercase">
              {t('goalLabel')}
            </p>
            <p className="animate-led-glow font-led text-ember text-[clamp(30px,3.6vw,44px)] font-bold tracking-[2px] [text-shadow:0_0_16px_rgba(255,90,60,.5)]">
              {challenge.goal}
            </p>
          </div>
          <div className="border border-white/[.18] bg-[rgba(13,14,10,.55)] px-6 py-[22px] backdrop-blur-xs">
            <p className="font-condensed mb-1.5 text-[13px] font-semibold tracking-[3px] text-white/55 uppercase">
              {t('prizeLabel')}
            </p>
            <p className="font-condensed text-moss text-[clamp(20px,2.4vw,26px)] font-bold tracking-wide uppercase">
              {challenge.prize}
            </p>
          </div>
        </div>
      </Reveal>
    </section>
  )
}
