import { describe, it, expect } from 'vitest'
import { getWeekDays, getMonthGrid, isWithin7Days, formatISODate } from '../../src/utils/dateHelpers'

describe('getWeekDays', () => {
  it('starts on Monday', () => {
    const thursday = new Date('2026-04-16')
    const days = getWeekDays(thursday)
    expect(days).toHaveLength(7)
    expect(formatISODate(days[0])).toBe('2026-04-13') // Monday
    expect(formatISODate(days[6])).toBe('2026-04-19') // Sunday
  })

  it('returns 7 days', () => {
    const days = getWeekDays(new Date('2026-04-19'))
    expect(days).toHaveLength(7)
  })
})

describe('getMonthGrid', () => {
  it('April 2026: first day is Wednesday → offset 2 (Mon-indexed)', () => {
    const { days, offset } = getMonthGrid(2026, 4)
    expect(days).toHaveLength(30)
    expect(offset).toBe(2)
  })

  it('January 2026: first day is Thursday → offset 3', () => {
    const { offset } = getMonthGrid(2026, 1)
    expect(offset).toBe(3)
  })

  it('February 2021: first day is Monday → offset 0', () => {
    const { offset } = getMonthGrid(2021, 2)
    expect(offset).toBe(0)
  })
})

describe('isWithin7Days', () => {
  it('today is within 7 days', () => {
    const today = formatISODate(new Date())
    expect(isWithin7Days(today)).toBe(true)
  })

  it('exactly 7 days ago is still editable', () => {
    const d = new Date()
    d.setDate(d.getDate() - 7)
    expect(isWithin7Days(formatISODate(d))).toBe(true)
  })

  it('8 days ago is not editable', () => {
    const d = new Date()
    d.setDate(d.getDate() - 8)
    expect(isWithin7Days(formatISODate(d))).toBe(false)
  })
})
