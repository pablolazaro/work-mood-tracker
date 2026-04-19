export const STORAGE_KEY = 'mood-tracker-v1'

export const DEFAULT_STATE = {
  entries: {},
  reminder: { enabled: false, time: '18:00' },
  workableDays: new Set(),
}

export function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw === null) return { ...DEFAULT_STATE, workableDays: new Set() }
    const parsed = JSON.parse(raw)
    return {
      ...parsed,
      workableDays: new Set(parsed.workableDays ?? []),
    }
  } catch (err) {
    console.warn('[mood-tracker] Failed to load state from storage:', err)
    return { ...DEFAULT_STATE, workableDays: new Set() }
  }
}

export function save(state) {
  try {
    const serialisable = {
      ...state,
      workableDays: [...state.workableDays],
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(serialisable))
  } catch (err) {
    if (err instanceof DOMException && err.name === 'QuotaExceededError') return
    throw err
  }
}

export function clear() {
  localStorage.removeItem(STORAGE_KEY)
}
