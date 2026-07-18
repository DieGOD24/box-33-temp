import { describe, expect, it } from 'vitest'
import type { Schedule } from '@box33/types'
import { nextClassInfo } from './schedule'

const SCHEDULE: Schedule = {
  morning: ['5:30', '6:30', '7:30', '8:30', '9:30'],
  evening: ['3:30', '4:30', '5:30', '6:30', '7:30'],
  openBox: { start: '10:30', end: '13:00' },
  updatedAt: '2026-01-01T00:00:00.000Z',
}

// 2026-07-15 is a Wednesday.
const wednesdayAt = (h: number, m: number) => new Date(2026, 6, 15, h, m, 0)

describe('nextClassInfo', () => {
  it('finds the next slot later the same day', () => {
    const info = nextClassInfo(SCHEDULE, wednesdayAt(6, 0))
    expect(info.dayOffset).toBe(0)
    expect(info.nextAt?.getHours()).toBe(6)
    expect(info.nextAt?.getMinutes()).toBe(30)
    expect(info.countdown).toBe('00:30:00')
  })

  it('maps evening times to PM (3:30 → 15:30)', () => {
    const info = nextClassInfo(SCHEDULE, wednesdayAt(14, 0))
    expect(info.nextAt?.getHours()).toBe(15)
    expect(info.nextAt?.getMinutes()).toBe(30)
  })

  it('rolls over to Monday from Friday after the last class', () => {
    // 2026-07-17 is a Friday; last class 19:30 + buffer.
    const friday = new Date(2026, 6, 17, 20, 0, 0)
    const info = nextClassInfo(SCHEDULE, friday)
    expect(info.dayOffset).toBe(3) // Sat + Sun skipped → Monday
    expect(info.nextAt?.getDay()).toBe(1)
    expect(info.nextAt?.getHours()).toBe(5)
    expect(info.countdown).toMatch(/^\dd /)
  })

  it('detects a class in progress', () => {
    expect(nextClassInfo(SCHEDULE, wednesdayAt(6, 45)).boxStatus).toBe('in-class')
  })

  it('detects the open-box window', () => {
    expect(nextClassInfo(SCHEDULE, wednesdayAt(11, 0)).boxStatus).toBe('open-box')
  })

  it('reports closed outside class hours and on weekends', () => {
    expect(nextClassInfo(SCHEDULE, wednesdayAt(14, 45)).boxStatus).toBe('closed')
    const saturday = new Date(2026, 6, 18, 11, 0, 0)
    expect(nextClassInfo(SCHEDULE, saturday).boxStatus).toBe('closed')
  })

  it('handles an empty schedule without crashing', () => {
    const empty: Schedule = { ...SCHEDULE, morning: [], evening: [] }
    const info = nextClassInfo(empty, wednesdayAt(6, 0))
    expect(info.countdown).toBe('--:--:--')
    expect(info.nextAt).toBeNull()
  })
})
