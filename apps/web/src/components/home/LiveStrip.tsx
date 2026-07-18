'use client'

import { useEffect, useState } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import type { Schedule } from '@box33/types'
import { nextClassInfo } from '@/lib/schedule'

// Built once at module load rather than on every render (see lib/format.ts).
// Explicit timeZone keeps the rendered time deterministic: the box is in
// Colombia and the schedule is authored in Bogotá wall-clock time.
const TIME_FMT = {
  'en-US': new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: 'America/Bogota',
  }),
  'es-CO': new Intl.DateTimeFormat('es-CO', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: 'America/Bogota',
  }),
} as const

const WEEKDAY_FMT = {
  'en-US': new Intl.DateTimeFormat('en-US', { weekday: 'long', timeZone: 'America/Bogota' }),
  'es-CO': new Intl.DateTimeFormat('es-CO', { weekday: 'long', timeZone: 'America/Bogota' }),
} as const

export function LiveStrip({ schedule }: { schedule: Schedule }) {
  const t = useTranslations('live')
  const locale = useLocale()
  const [now, setNow] = useState<Date | null>(null)

  useEffect(() => {
    // Subscribe to the wall clock; the deferred kickoff keeps SSR + first
    // client render identical (placeholder) and satisfies set-state-in-effect.
    const update = () => setNow(new Date())
    const kickoff = setTimeout(update, 0)
    const tick = setInterval(update, 1000)
    return () => {
      clearTimeout(kickoff)
      clearInterval(tick)
    }
  }, [])

  // SSR + first client render agree (placeholder) — the clock starts after mount.
  const info = now ? nextClassInfo(schedule, now) : null
  const open = info !== null && info.boxStatus !== 'closed'
  const statusLabel = !info
    ? '…'
    : info.boxStatus === 'in-class'
      ? t('inClass')
      : info.boxStatus === 'open-box'
        ? t('openBox')
        : t('closed')

  let nextLabel = t('checkSchedule')
  if (info?.nextAt) {
    const key = locale === 'en' ? 'en-US' : 'es-CO'
    const time = TIME_FMT[key].format(info.nextAt)
    const day =
      info.dayOffset === 0
        ? t('today')
        : info.dayOffset === 1
          ? t('tomorrow')
          : WEEKDAY_FMT[key].format(info.nextAt)
    nextLabel = `${day} · ${time}`
  }

  return (
    <div className="border-bone/[.08] font-condensed flex flex-wrap items-center justify-center gap-x-7 gap-y-2.5 border-b bg-[#141510] px-5 py-3 text-sm font-semibold tracking-[2px] uppercase">
      <span
        className="inline-flex items-center gap-[9px]"
        style={{ color: open ? '#A8B570' : 'rgba(242,240,235,.5)' }}
      >
        <span
          className="animate-live-pulse h-2.5 w-2.5 rounded-full"
          style={{ background: open ? '#A8B570' : 'rgba(242,240,235,.5)' }}
        />
        {statusLabel}
      </span>
      <span className="text-bone/70 inline-flex items-center gap-[9px]">
        {t('nextClassIn')}
        <span className="font-led text-ember text-lg font-bold tracking-[2px] [text-shadow:0_0_12px_rgba(255,90,60,.55)]">
          {info?.countdown ?? '--:--:--'}
        </span>
      </span>
      <span className="text-bone/55">{nextLabel}</span>
    </div>
  )
}
