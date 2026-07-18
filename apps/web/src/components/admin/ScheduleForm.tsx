'use client'

import { useState, useTransition } from 'react'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'
import type { Schedule } from '@box33/types'
import { ADMIN_CARD, ADMIN_INPUT, ADMIN_LABEL, ADMIN_SAVE } from './ui'
import { saveSchedule } from './actions'

const TIME_RE = /^\d{1,2}:\d{2}$/

const parseTimes = (raw: string) =>
  raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)

export function ScheduleForm({ initial }: { initial: Schedule }) {
  const t = useTranslations('admin.schedule')
  const tCommon = useTranslations('common')
  const [morningRaw, setMorningRaw] = useState(() => initial.morning.join(','))
  const [eveningRaw, setEveningRaw] = useState(() => initial.evening.join(','))
  const [openBoxStart, setOpenBoxStart] = useState(initial.openBox.start)
  const [openBoxEnd, setOpenBoxEnd] = useState(initial.openBox.end)
  const [pending, startTransition] = useTransition()

  const morning = parseTimes(morningRaw)
  const evening = parseTimes(eveningRaw)

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const all = [...morning, ...evening, openBoxStart, openBoxEnd]
    if (all.some((time) => !TIME_RE.test(time))) {
      toast.error(tCommon('error'))
      return
    }
    startTransition(async () => {
      const result = await saveSchedule({
        morning,
        evening,
        openBox: { start: openBoxStart, end: openBoxEnd },
      })
      if (result.ok) toast.success(tCommon('saved'))
      else toast.error(result.message ?? tCommon('error'))
    })
  }

  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] items-start gap-[22px]">
      <form onSubmit={submit} className={ADMIN_CARD}>
        <label htmlFor="sch-am" className={ADMIN_LABEL}>
          {t('morningLabel')}
        </label>
        <input
          id="sch-am"
          value={morningRaw}
          onChange={(e) => setMorningRaw(e.target.value)}
          className={`${ADMIN_INPUT} font-led text-ember mb-[18px]`}
        />
        <label htmlFor="sch-pm" className={ADMIN_LABEL}>
          {t('eveningLabel')}
        </label>
        <input
          id="sch-pm"
          value={eveningRaw}
          onChange={(e) => setEveningRaw(e.target.value)}
          className={`${ADMIN_INPUT} font-led text-ember mb-[18px]`}
        />
        <div className="mb-4 grid grid-cols-2 gap-3.5">
          <div>
            <label htmlFor="sch-ob-start" className={ADMIN_LABEL}>
              {t('openBoxStartLabel')}
            </label>
            <input
              id="sch-ob-start"
              value={openBoxStart}
              onChange={(e) => setOpenBoxStart(e.target.value)}
              className={`${ADMIN_INPUT} font-led`}
            />
          </div>
          <div>
            <label htmlFor="sch-ob-end" className={ADMIN_LABEL}>
              {t('openBoxEndLabel')}
            </label>
            <input
              id="sch-ob-end"
              value={openBoxEnd}
              onChange={(e) => setOpenBoxEnd(e.target.value)}
              className={`${ADMIN_INPUT} font-led`}
            />
          </div>
        </div>
        <button type="submit" disabled={pending} className={ADMIN_SAVE}>
          {pending ? tCommon('saving') : tCommon('save')}
        </button>
      </form>

      {/* LED preview */}
      <div className="rounded-md border-2 border-[#23241c] bg-[#050604] p-6 shadow-[inset_0_0_40px_rgba(0,0,0,.8)]">
        <p className="font-condensed text-bone/40 mb-3 text-[13px] font-semibold tracking-[2px] uppercase">
          {t('preview')}
        </p>
        <div className="flex flex-wrap items-center gap-x-[18px] gap-y-2.5">
          {morning.map((time) => (
            <span
              key={`m-${time}`}
              className="font-led text-ember text-[22px] font-bold tracking-[2px] [text-shadow:0_0_12px_rgba(255,90,60,.6)]"
            >
              {time}
            </span>
          ))}
          <span className="font-led text-olive text-[22px] font-semibold">/</span>
          {evening.map((time) => (
            <span
              key={`e-${time}`}
              className="font-led text-ember text-[22px] font-bold tracking-[2px] [text-shadow:0_0_12px_rgba(255,90,60,.6)]"
            >
              {time}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
