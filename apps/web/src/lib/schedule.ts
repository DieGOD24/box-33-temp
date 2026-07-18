import type { Schedule } from '@box33/types'

export interface NextClassInfo {
  /** 'hh:mm:ss' or 'Nd hh:mm', '--:--:--' when no schedule. */
  countdown: string
  /** Ms until the next class, or null when the schedule is empty. */
  msToNext: number | null
  /** Day offset of the next class: 0 = today, 1 = tomorrow, 2+ = later. */
  dayOffset: number
  /** Local Date of the next class start, or null. */
  nextAt: Date | null
  boxStatus: 'in-class' | 'open-box' | 'closed'
}

interface Slot {
  hh: number
  mm: number
}

const CLASS_DURATION_MIN = 60

function parseSlots(times: string[], pm: boolean): Slot[] {
  return times.flatMap((raw) => {
    const t = raw.trim()
    if (!t) return []
    const [h, m] = t.split(':')
    let hh = parseInt(h ?? '0', 10) || 0
    const mm = parseInt(m ?? '0', 10) || 0
    // Evening times are written as 12h ('3:30' → 15:30).
    if (pm && hh < 12) hh += 12
    return [{ hh, mm }]
  })
}

function parseHHMM(value: string): number {
  const [h, m] = value.split(':')
  return (parseInt(h ?? '0', 10) || 0) * 60 + (parseInt(m ?? '0', 10) || 0)
}

const pad = (n: number) => String(n).padStart(2, '0')

/**
 * Computes the countdown to the next weekday class and whether the box is
 * currently open (a class in progress, or inside the open-box window).
 * Pure — fully testable with an injected `now`.
 */
export function nextClassInfo(schedule: Schedule, now: Date): NextClassInfo {
  const slots = [
    ...parseSlots(schedule.morning, false),
    ...parseSlots(schedule.evening, true),
  ].sort((a, b) => a.hh - b.hh || a.mm - b.mm)

  let target: Date | null = null
  let dayOffset = 0
  if (slots.length > 0) {
    for (let offset = 0; offset < 8 && !target; offset++) {
      const day = new Date(now.getFullYear(), now.getMonth(), now.getDate() + offset)
      const dow = day.getDay()
      if (dow === 0 || dow === 6) continue // weekends: box closed
      for (const slot of slots) {
        const candidate = new Date(day)
        candidate.setHours(slot.hh, slot.mm, 0, 0)
        if (candidate.getTime() > now.getTime()) {
          target = candidate
          dayOffset = offset
          break
        }
      }
    }
  }

  let countdown = '--:--:--'
  let msToNext: number | null = null
  if (target) {
    msToNext = target.getTime() - now.getTime()
    const secs = Math.max(0, Math.floor(msToNext / 1000))
    const days = Math.floor(secs / 86400)
    const hh = Math.floor((secs % 86400) / 3600)
    const mm = Math.floor((secs % 3600) / 60)
    const ss = secs % 60
    countdown = days > 0 ? `${days}d ${pad(hh)}:${pad(mm)}` : `${pad(hh)}:${pad(mm)}:${pad(ss)}`
  }

  const dow = now.getDay()
  const weekday = dow >= 1 && dow <= 5
  const nowMin = now.getHours() * 60 + now.getMinutes()
  const inClass =
    weekday &&
    slots.some((s) => {
      const start = s.hh * 60 + s.mm
      return nowMin >= start && nowMin < start + CLASS_DURATION_MIN
    })
  const openBoxStart = parseHHMM(schedule.openBox.start)
  const openBoxEnd = parseHHMM(schedule.openBox.end)
  const inOpenBox = weekday && nowMin >= openBoxStart && nowMin < openBoxEnd

  return {
    countdown,
    msToNext,
    dayOffset,
    nextAt: target,
    boxStatus: inClass ? 'in-class' : inOpenBox ? 'open-box' : 'closed',
  }
}
