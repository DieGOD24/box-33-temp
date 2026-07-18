import { getTranslations } from 'next-intl/server'
import type { Schedule } from '@box33/types'

function LedBoard({
  title,
  meridiem,
  times,
  classLabel,
}: {
  title: string
  meridiem: string
  times: string[]
  classLabel: string
}) {
  return (
    <div className="rounded-md border-2 border-[#23241c] bg-[#050604] px-[26px] py-7 shadow-[inset_0_0_40px_rgba(0,0,0,.8)]">
      <div className="mb-[18px] flex items-baseline justify-between">
        <h3 className="font-condensed text-bone text-xl font-bold tracking-[3px] uppercase">
          {title}
        </h3>
        <span className="font-led text-olive text-xs font-semibold tracking-[3px]">{meridiem}</span>
      </div>
      <div className="flex flex-col gap-1.5">
        {times.map((time) => (
          <div
            key={time}
            className="border-bone/10 flex items-center justify-between border-b border-dashed py-[7px]"
          >
            <span className="animate-led-glow font-led text-ember text-[26px] font-bold tracking-[3px] [text-shadow:0_0_12px_rgba(255,90,60,.6)]">
              {time}
            </span>
            <span className="font-condensed text-bone/45 text-[13px] font-semibold tracking-[2.5px] uppercase">
              {classLabel}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export async function ScheduleBoard({ schedule }: { schedule: Schedule }) {
  const t = await getTranslations('schedule')

  return (
    <section
      id="horarios"
      className="border-bone/[.08] bg-carbon-deep border-y px-[clamp(20px,5vw,64px)] py-[clamp(64px,9vw,110px)]"
    >
      <div className="mx-auto max-w-[1200px]">
        <p className="font-condensed text-moss mb-2.5 text-base font-semibold tracking-[6px] uppercase">
          {t('kicker')}
        </p>
        <h2 className="font-display mb-3 text-[clamp(36px,5vw,64px)] tracking-wide uppercase">
          {t('title')}
        </h2>
        <p className="text-bone/60 mb-10 text-base">{t('subtitle')}</p>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-[18px]">
          <LedBoard
            title={t('morning')}
            meridiem="AM"
            times={schedule.morning}
            classLabel={t('guidedClass')}
          />
          <div className="bg-olive-deep relative flex flex-col justify-center overflow-hidden rounded-md px-[26px] py-7">
            <svg
              width="130"
              height="205"
              viewBox="0 0 14 22"
              fill="rgba(255,255,255,.09)"
              aria-hidden="true"
              className="absolute top-1/2 -right-3.5 -translate-y-1/2"
            >
              <path d="M8.8 0 0 12.6h4.4L3.2 22 14 8.4H8.6L11.4 0Z" />
            </svg>
            <h3 className="font-condensed mb-1.5 text-xl font-bold tracking-[3px] text-white uppercase">
              {t('openBox')}
            </h3>
            <p className="mb-4 text-[15px] text-white/80">{t('openBoxDescription')}</p>
            <p className="font-led text-[clamp(30px,3.2vw,40px)] font-bold tracking-[2px] text-white [text-shadow:0_0_14px_rgba(255,255,255,.35)]">
              {schedule.openBox.start} → {schedule.openBox.end}
            </p>
          </div>
          <LedBoard
            title={t('evening')}
            meridiem="PM"
            times={schedule.evening}
            classLabel={t('guidedClass')}
          />
        </div>
      </div>
    </section>
  )
}
