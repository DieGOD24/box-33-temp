import { getTranslations } from 'next-intl/server'
import type { Plan, SiteSettings } from '@box33/types'
import { Bolt, TripleChevron } from '@/components/icons/Bolt'
import { WhatsAppIcon } from '@/components/icons/WhatsAppIcon'
import { buildWaLink } from '@/lib/wa'
import { formatCOP } from '@/lib/format'
import { Reveal } from './Reveal'

export async function Plans({ plans, settings }: { plans: Plan[]; settings: SiteSettings }) {
  const t = await getTranslations('plans')
  const tGoals = await getTranslations('goals')

  return (
    <section
      id="planes"
      className="border-bone/[.08] bg-carbon-deep relative overflow-hidden border-b px-[clamp(20px,5vw,64px)] py-[clamp(64px,9vw,110px)]"
    >
      <svg
        width="360"
        height="560"
        viewBox="0 0 14 22"
        fill="rgba(168,181,112,.05)"
        aria-hidden="true"
        className="pointer-events-none absolute top-5 -right-[90px] rotate-[12deg]"
      >
        <path d="M8.8 0 0 12.6h4.4L3.2 22 14 8.4H8.6L11.4 0Z" />
      </svg>
      <Reveal className="relative mx-auto max-w-[1200px]">
        <div className="mb-[clamp(34px,5vw,54px)] text-center">
          <div className="mb-2.5 inline-flex items-center gap-3">
            <TripleChevron />
            <p className="font-condensed text-moss m-0 text-base font-semibold tracking-[6px] uppercase">
              {t('kicker')}
            </p>
            <TripleChevron />
          </div>
          <h2 className="font-display mb-3 text-[clamp(34px,5vw,62px)] tracking-wide uppercase">
            {t('title')}
          </h2>
          <p className="text-bone/70 mx-auto max-w-[560px] text-[17px] leading-relaxed">
            {t('subtitle')}
          </p>
        </div>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(230px,1fr))] items-stretch gap-5">
          {plans.map((plan) => {
            const waHref = buildWaLink(
              settings.whatsappNumber,
              t('waMessage', {
                name: '',
                plan: plan.name,
                price: formatCOP(plan.priceCents),
                goal: tGoals('strength'),
              })
            )
            return (
              <div
                key={plan.key}
                className={
                  plan.popular
                    ? 'border-gold/55 bg-olive-deep relative flex -translate-y-1.5 flex-col border p-[30px_26px_26px] shadow-[0_18px_40px_rgba(0,0,0,.4)]'
                    : 'border-bone/[.12] bg-surface relative flex flex-col border p-[30px_26px_26px]'
                }
              >
                {plan.popular && (
                  <span className="bg-gold font-condensed absolute -top-[13px] left-1/2 -translate-x-1/2 -rotate-[1.5deg] px-3.5 py-[5px] text-xs font-bold tracking-[2.5px] whitespace-nowrap text-[#171712] uppercase shadow-[0_3px_10px_rgba(0,0,0,.4)]">
                    {t('popular')}
                  </span>
                )}
                <h3 className="font-condensed text-bone mb-[3px] text-[22px] font-bold tracking-wide uppercase">
                  {plan.name}
                </h3>
                <p className="text-bone/60 mb-4 text-[13.5px]">{plan.tagline}</p>
                <div className="mb-[18px] flex items-baseline gap-2">
                  <span className="font-led text-[clamp(26px,3vw,34px)] font-bold tracking-wide text-white">
                    {formatCOP(plan.priceCents)}
                  </span>
                  <span className="text-bone/55 text-[13px]">{t(`unit.${plan.unit}`)}</span>
                </div>
                <ul className="mb-[22px] flex list-none flex-col gap-[9px] p-0">
                  {plan.features.map((feature) => (
                    <li
                      key={feature}
                      className="text-bone/85 flex items-start gap-[9px] text-[14.5px] leading-snug"
                    >
                      <Bolt width={10} height={15} fill="#A8B570" className="mt-0.5 flex-none" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <a
                  href={waHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={
                    plan.popular
                      ? 'bg-wa font-condensed mt-auto inline-flex items-center justify-center gap-[9px] px-5 py-[13px] text-[17px] font-bold tracking-[2px] text-[#111210] uppercase shadow-[4px_4px_0_rgba(0,0,0,.4)] hover:text-[#111210]'
                      : 'border-bone/40 font-condensed text-bone hover:border-moss hover:text-moss mt-auto inline-flex items-center justify-center gap-[9px] border bg-transparent px-5 py-[13px] text-[17px] font-bold tracking-[2px] uppercase'
                  }
                >
                  <WhatsAppIcon size={18} />
                  {t('cta')}
                </a>
              </div>
            )
          })}
        </div>
      </Reveal>
    </section>
  )
}
