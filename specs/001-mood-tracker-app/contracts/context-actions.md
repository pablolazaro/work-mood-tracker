# Contract: MoodContext Actions & Selectors

**Phase**: 1 | **Date**: 2026-04-19

This document defines the public interface of `MoodContext` and `useMoodData`. Route components and UI atoms MUST interact with state exclusively through these interfaces.

---

## Context Shape

```js
// Accessed via useMoodContext() hook
{
  state: AppState,       // current root state
  dispatch: Dispatch     // useReducer dispatcher
}
```

---

## Dispatch Actions

All actions are dispatched as plain objects: `dispatch({ type: ACTION_TYPE, payload: ... })`.

### `LOG_MOOD`
Log or replace a mood entry for a given date.

```js
dispatch({
  type: 'LOG_MOOD',
  payload: {
    date: string,          // ISO date "YYYY-MM-DD"
    mood: 'good'|'bad'|'off',
    note: string|undefined // max 280 chars; undefined = no note
  }
})
```

**Guard**: Caller MUST verify `useMoodData.canLog(date)` returns `true` before dispatching.

---

### `UPDATE_NOTE`
Update only the note on an existing entry, preserving the current mood value. Use this when the user edits a note without re-selecting a mood. If the user changes both mood and note, use `LOG_MOOD` instead (upsert covers that case).

```js
dispatch({
  type: 'UPDATE_NOTE',
  payload: {
    date: string,  // must have an existing entry
    note: string   // max 280 chars
  }
})
```

---

### `DELETE_ENTRY`
Remove an entry, returning the day to unlogged state.

```js
dispatch({
  type: 'DELETE_ENTRY',
  payload: { date: string }
})
```

**Guard**: Caller MUST verify `useMoodData.isEditable(date)` returns `true`.

---

### `TOGGLE_WORKABLE_DAY`
Mark a Saturday or Sunday workable (or un-mark it). Un-marking also deletes any existing mood entry for that date.

```js
dispatch({
  type: 'TOGGLE_WORKABLE_DAY',
  payload: { date: string }  // must be a Saturday or Sunday ISO date
})
```

---

### `SET_REMINDER`
Update reminder preferences.

```js
dispatch({
  type: 'SET_REMINDER',
  payload: {
    enabled: boolean,
    time?: string   // HH:MM 24-hour format; optional — reducer preserves existing time value if omitted
  }
})
```

---

## useMoodData Selectors

`useMoodData()` returns a stable selector object. All selectors derive from the current `AppState` and are memoised with `useMemo`.

```js
const {
  // Lookups
  getEntry,          // (date: string) => MoodEntry | undefined
  canLog,            // (date: string) => boolean  — weekday OR workable weekend
  isEditable,        // (date: string) => boolean  — within 7-day window
  isWorkableDay,     // (date: string) => boolean  — in workableDays set

  // Week
  weekEntries,       // (isoWeekStart: Date) => MoodEntry[]  — Mon–Sun of that week
  weekStats,         // (isoWeekStart: Date) => { pctGood: number|null, label: string }

  // Month
  monthEntries,      // (year: number, month: number) => MoodEntry[]
  monthCounts,       // (year: number, month: number) => { good, bad, off }

  // Year
  yearEntries,       // (year: number) => MoodEntry[]
  yearStats,         // (year: number) => { pctGood: number|null, good, bad, off }

  // Insights
  trendData,         // (endDate: Date, weeks?: 8) => { week: string, pctGood: number|null }[]
  dowData,           // (entries: MoodEntry[]) => { day: string, pctGood: number|null, isBest, isWorst }[]
  insightsStats,     // (range: '30d'|'90d'|'year') => { pctGood: number|null, delta: number|null, entries: MoodEntry[] }
                     // entries = all MoodEntry records whose date falls within the selected range window
                     // pctGood = percentGood(entries)
                     // delta = deltaVsPrior(pctGood, priorPctGood) where prior period is:
                     //   '30d'  → days 31–60 ago
                     //   '90d'  → days 91–180 ago
                     //   'year' → Jan 1 – today of the prior calendar year

  // Reminder
  reminderSettings,  // ReminderSettings
} = useMoodData();

// Note: formatPctGood() is NOT a selector — import it directly from utils/calculations.js:
// import { formatPctGood } from '../utils/calculations'
// Route components call formatPctGood(pctGood) for display; selectors return raw number|null.
```
