import { createContext, useContext, useReducer, useEffect } from 'react'
import { load, save } from '../utils/storage'

export const MoodContext = createContext(null)

function reducer(state, action) {
  switch (action.type) {
    case 'LOG_MOOD': {
      const { date, mood, note } = action.payload
      return {
        ...state,
        entries: {
          ...state.entries,
          [date]: { date, mood, note: note || undefined },
        },
      }
    }
    case 'UPDATE_NOTE': {
      const { date, note } = action.payload
      const existing = state.entries[date]
      if (!existing) return state
      return {
        ...state,
        entries: {
          ...state.entries,
          [date]: { ...existing, note: note || undefined },
        },
      }
    }
    case 'DELETE_ENTRY': {
      const { date } = action.payload
      const { [date]: _removed, ...remaining } = state.entries
      return { ...state, entries: remaining }
    }
    case 'TOGGLE_WORKABLE_DAY': {
      const { date } = action.payload
      const next = new Set(state.workableDays)
      if (next.has(date)) {
        next.delete(date)
        const { [date]: _removed, ...remaining } = state.entries
        return { ...state, workableDays: next, entries: remaining }
      } else {
        next.add(date)
        return { ...state, workableDays: next }
      }
    }
    case 'SET_REMINDER': {
      const { enabled, time } = action.payload
      return {
        ...state,
        reminder: {
          enabled,
          time: time ?? state.reminder.time,
        },
      }
    }
    default:
      return state
  }
}

export function MoodProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, undefined, load)

  useEffect(() => {
    save(state)
  }, [state])

  return (
    <MoodContext.Provider value={{ state, dispatch }}>
      {children}
    </MoodContext.Provider>
  )
}

export function useMoodContext() {
  const ctx = useContext(MoodContext)
  if (!ctx) throw new Error('useMoodContext must be used inside MoodProvider')
  return ctx
}
