'use client'

import { useEffect, useState } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import type { Schedule } from '@box33/types'
import { nextClassInfo } from '@/lib/schedule'

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
    const time = new Intl.DateTimeFormat(locale === 'en' ? 'en-US' : 'es-CO', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).format(info.nextAt)
    const day =
      info.dayOffset === 0
        ? t('today')
        : info.dayOffset === 1
          ? t('tomorrow')
          : new Intl.DateTimeFormat(locale === 'en' ? 'en-US' : 'es-CO', {
              weekday: 'long',
            }).format(info.nextAt)
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
