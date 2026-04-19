# Data Model: Work Mood Tracker App

**Phase**: 1 | **Date**: 2026-04-19 | **Plan**: [plan.md](plan.md)

---

## Entities

### MoodEntry

Represents a single logged workday.

| Field | Type | Constraints | Notes |
|---|---|---|---|
| `date` | `string` | ISO date `YYYY-MM-DD`, unique key | Device local date — attributed to calendar day of device clock |
| `mood` | `"good" \| "bad" \| "off"` | Required | `"off"` is excluded from % good denominator |
| `note` | `string \| undefined` | Max 280 chars, optional | Absent means no note; `""` is treated the same as absent |

---

### ReminderSettings

Stores the user's notification preferences.

| Field | Type | Default | Constraints | Notes |
|---|---|---|---|---|
| `enabled` | `boolean` | `false` | — | Off by default (FR-017) |
| `time` | `string` | `"18:00"` | HH:MM 24-hour format | Defaults to 6 PM on first enable (FR-018) |

---

### WorkableDay (implicit via `workableDays` set)

Not a standalone entity — represented as a `Set<string>` of ISO date strings for Saturday or Sunday dates that the user has explicitly marked workable. Each string is a specific calendar date (e.g., `"2026-04-18"`), so the per-week behaviour is automatic.

---

### AppState (root)

The single runtime state object, serialised to localStorage under key `"mood-tracker-v1"`.

| Field | Runtime Type | Serialised Type | Notes |
|---|---|---|---|
| `entries` | `Record<string, MoodEntry>` | `object` | Keyed by ISO date string; O(1) lookup |
| `reminder` | `ReminderSettings` | `object` | — |
| `workableDays` | `Set<string>` | `string[]` | Converted to/from array on read/write |

**Default state** (first open or after storage clear):
```js
{
  entries: {},
  reminder: { enabled: false, time: "18:00" },
  workableDays: new Set()
}
```

---

## Validation Rules

| Rule | Where enforced |
|---|---|
| Note max 280 chars | `Today.jsx` input + `useMoodData` selector guard |
| Mood must be `good \| bad \| off` | Reducer action validation + TypeScript JSDoc types |
| Edit/delete allowed only within 7 calendar days | `useMoodData.isEditable(date)` → `differenceInCalendarDays(today, date) <= 7` |
| Weekend day requires `workableDays.has(date)` before logging | Checked in `useMoodData.canLog(date)` and enforced via disabled state in UI |
| % good denominator = 0 → return `null` | `utils/calculations.percentGood()` |

---

## State Transitions

```
UNLOGGED DAY
    │
    ▼ LOG_MOOD (within 7-day window; weekday OR workable weekend)
LOGGED (mood + optional note)
    │
    ├─▶ UPDATE_MOOD (within 7-day window) ──▶ LOGGED (updated)
    ├─▶ UPDATE_NOTE (within 7-day window) ──▶ LOGGED (updated note)
    └─▶ DELETE_ENTRY (within 7-day window) ──▶ UNLOGGED DAY

LOGGED (> 7 days old) ──▶ READ-ONLY (no transitions allowed)
```

---

## Reducer Actions

| Action Type | Payload | State Change |
|---|---|---|
| `LOG_MOOD` | `{ date, mood, note? }` | Upsert entry; replace existing if same date |
| `UPDATE_NOTE` | `{ date, note }` | Update `note` on existing entry |
| `DELETE_ENTRY` | `{ date }` | Remove entry from `entries` |
| `TOGGLE_WORKABLE_DAY` | `{ date }` | Add/remove from `workableDays`; if removing and entry exists for date, also deletes that entry |
| `SET_REMINDER` | `{ enabled, time? }` | Update `reminder` object |

---

## Storage Schema (localStorage)

**Key**: `"mood-tracker-v1"`

**Write strategy**: Full-state serialisation on every dispatch. Given ≤ 366 entries/year, serialisation cost is negligible.

**Read strategy**: On `MoodContext` mount, call `storage.load()`. If key absent → `DEFAULT_STATE`. If JSON parse fails → `DEFAULT_STATE` + `console.warn`.

**Migration path**: If a future schema change is needed, introduce `"mood-tracker-v2"` key and a one-time migration function in `storage.js` that reads v1, transforms, writes v2, then deletes v1.
