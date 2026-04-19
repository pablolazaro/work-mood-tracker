import { describe, it, expect, beforeEach, vi } from 'vitest'
import { load, save, clear, DEFAULT_STATE, STORAGE_KEY } from '../../src/utils/storage'

const localStorageMock = (() => {
  let store = {}
  return {
    getItem: vi.fn(key => store[key] ?? null),
    setItem: vi.fn((key, val) => { store[key] = val }),
    removeItem: vi.fn(key => { delete store[key] }),
    clear: vi.fn(() => { store = {} }),
  }
})()

Object.defineProperty(global, 'localStorage', { value: localStorageMock })

beforeEach(() => {
  localStorageMock.clear()
  vi.clearAllMocks()
})

describe('load()', () => {
  it('returns DEFAULT_STATE when storage is empty', () => {
    const state = load()
    expect(state.entries).toEqual({})
    expect(state.reminder).toEqual(DEFAULT_STATE.reminder)
    expect(state.workableDays).toBeInstanceOf(Set)
    expect(state.workableDays.size).toBe(0)
  })

  it('returns DEFAULT_STATE when JSON is corrupted', () => {
    localStorageMock.getItem.mockReturnValueOnce('not-valid-json{{{')
    const state = load()
    expect(state.entries).toEqual({})
    expect(state.workableDays).toBeInstanceOf(Set)
  })

  it('converts workableDays array to Set on load', () => {
    const stored = JSON.stringify({
      entries: {},
      reminder: { enabled: false, time: '18:00' },
      workableDays: ['2026-04-18'],
    })
    localStorageMock.getItem.mockReturnValueOnce(stored)
    const state = load()
    expect(state.workableDays).toBeInstanceOf(Set)
    expect(state.workableDays.has('2026-04-18')).toBe(true)
  })
})

describe('save() + load() round-trip', () => {
  it('preserves workableDays Set through save and load', () => {
    const state = {
      entries: { '2026-04-19': { date: '2026-04-19', mood: 'good' } },
      reminder: { enabled: true, time: '09:00' },
      workableDays: new Set(['2026-04-18', '2026-04-19']),
    }
    save(state)
    const saved = localStorageMock.setItem.mock.calls[0][1]
    localStorageMock.getItem.mockReturnValueOnce(saved)
    const loaded = load()
    expect(loaded.workableDays).toBeInstanceOf(Set)
    expect(loaded.workableDays.has('2026-04-18')).toBe(true)
    expect(loaded.workableDays.has('2026-04-19')).toBe(true)
    expect(loaded.entries['2026-04-19'].mood).toBe('good')
  })
})

describe('clear()', () => {
  it('removes the storage key', () => {
    clear()
    expect(localStorageMock.removeItem).toHaveBeenCalledWith(STORAGE_KEY)
  })
})
