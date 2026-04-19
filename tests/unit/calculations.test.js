import { describe, it, expect } from 'vitest'
import { percentGood, weekLabel, deltaVsPrior, formatPctGood } from '../../src/utils/calculations'

describe('percentGood', () => {
  it('returns null for empty array', () => {
    expect(percentGood([])).toBeNull()
  })

  it('returns null when all entries are off', () => {
    expect(percentGood([{ mood: 'off' }, { mood: 'off' }])).toBeNull()
  })

  it('calculates correctly for mix of good/bad/off', () => {
    const entries = [{ mood: 'good' }, { mood: 'bad' }, { mood: 'off' }]
    expect(percentGood(entries)).toBe(50)
  })

  it('returns 100 when all entries are good', () => {
    expect(percentGood([{ mood: 'good' }, { mood: 'good' }])).toBe(100)
  })

  it('returns 0 when all are bad', () => {
    expect(percentGood([{ mood: 'bad' }, { mood: 'bad' }])).toBe(0)
  })

  it('excludes off from denominator', () => {
    const entries = [{ mood: 'good' }, { mood: 'off' }]
    expect(percentGood(entries)).toBe(100)
  })
})

describe('weekLabel', () => {
  it('returns — for null', () => {
    expect(weekLabel(null)).toBe('—')
  })

  it('returns Good week at exactly 80', () => {
    expect(weekLabel(80)).toBe('Good week')
  })

  it('returns Good week above 80', () => {
    expect(weekLabel(100)).toBe('Good week')
  })

  it('returns Mixed week at 79.9', () => {
    expect(weekLabel(79.9)).toBe('Mixed week')
  })

  it('returns Mixed week at exactly 50', () => {
    expect(weekLabel(50)).toBe('Mixed week')
  })

  it('returns Tough week at 49', () => {
    expect(weekLabel(49)).toBe('Tough week')
  })

  it('returns Tough week at 0', () => {
    expect(weekLabel(0)).toBe('Tough week')
  })
})

describe('deltaVsPrior', () => {
  it('returns null when current is null', () => {
    expect(deltaVsPrior(null, 60)).toBeNull()
  })

  it('returns null when prior is null', () => {
    expect(deltaVsPrior(68, null)).toBeNull()
  })

  it('returns null when both are null', () => {
    expect(deltaVsPrior(null, null)).toBeNull()
  })

  it('returns positive delta for improvement', () => {
    expect(deltaVsPrior(68, 60)).toBe(8)
  })

  it('returns negative delta for decline', () => {
    expect(deltaVsPrior(60, 68)).toBe(-8)
  })
})

describe('formatPctGood', () => {
  it('returns — for null', () => {
    expect(formatPctGood(null)).toBe('—')
  })

  it('formats number to one decimal', () => {
    expect(formatPctGood(68)).toBe('68.0%')
  })

  it('formats 100', () => {
    expect(formatPctGood(100)).toBe('100.0%')
  })
})
