# Research: Work Mood Tracker App

**Phase**: 0 | **Date**: 2026-04-19 | **Plan**: [plan.md](plan.md)

All NEEDS CLARIFICATION items from Technical Context are resolved below.

---

## §1 — Testing Framework

**Decision**: Vitest + @testing-library/react + jsdom

**Rationale**: Vitest is the idiomatic test runner for Vite projects — it shares the same config file, supports ESM natively, and runs the same transform pipeline as the build tool (no Babel/Jest bridging). `@testing-library/react` aligns with the constitution's "presentational shell" rule: tests exercise components through user interactions, not implementation details.

**Alternatives considered**:
- Jest: requires `babel-jest` and manual ESM handling for Vite projects; adds friction for no benefit.
- Playwright (E2E only): valuable for full-flow tests but not a unit test runner; can be added later as a complement.

**Test scope**:
- Unit tests: `calculations.js`, `dateHelpers.js`, `storage.js` (constitution §Dev Workflow mandates unit tests for `percentGood`, `weekLabel`, `deltaVsPrior` before dependent screens ship).
- Integration tests: `Today`, `Weekly`, `Insights` route components rendered with a seeded `MoodContext`.
- No E2E in v1 scope.

---

## §2 — localStorage Schema

**Decision**: Single key `"mood-tracker-v1"` storing a serialized JSON `AppState` object.

**Rationale**: One key simplifies atomic writes (no partial-state inconsistency across multiple keys) and makes migration straightforward — the version suffix in the key name (`-v1`) acts as a schema generation marker. On read, if the key is absent the app initialises to `DEFAULT_STATE`; if the key exists but fails JSON parsing, the app falls back to `DEFAULT_STATE` and logs a console warning (no error thrown to the user per edge-case spec: "App resets to an empty state with no error").

**Schema**:
```json
{
  "entries": {
    "2026-04-19": { "date": "2026-04-19", "mood": "good", "note": "Productive sprint" }
  },
  "reminder": { "enabled": false, "time": "18:00" },
  "workableDays": ["2026-04-18"]
}
```

`entries` is a plain object keyed by ISO date string (`YYYY-MM-DD`) for O(1) lookup by date. `workableDays` is an array of ISO date strings (serialised as an array for JSON; held as a `Set` in React state for O(1) lookup).

**Alternatives considered**:
- Multiple keys (one per entry): fragmented writes, harder to enumerate, no clear migration path.
- IndexedDB: overkill for ≤ 366 entries/year; constitution §Tech Constraints explicitly forbids it for mood data.

---

## §3 — Browser Notification Scheduling

**Decision**: Session-local scheduling via `setTimeout` recalculated on `visibilitychange` and page load.

**Rationale**: The constitution mandates no backend and no server-side service. The browser Push API (which *can* wake a closed tab) requires a push server to send the push message — violating Principle I. Therefore notifications are scoped to "browser tab is open." This is consistent with the spec wording "device-local Web Notifications API."

**Implementation approach**:
1. On app mount and on every `visibilitychange` to `visible`, `useReminder.js` reads `reminder.enabled` + `reminder.time` from context.
2. It calculates milliseconds until the next matching weekday (or workable weekend day) at the configured time.
3. It registers a single `setTimeout`; on fire it calls `new Notification(...)` and reschedules for the next day.
4. If `Notification.permission !== 'granted'` at fire time, the timeout silently skips.
5. If the user has already logged today, the reminder fires with a "you've already logged" message variant (or is suppressed — configurable, but simple suppression satisfies acceptance scenario 4).

**Known limitation**: Notification will not fire if the browser tab is closed. This is acceptable for a no-backend SPA; no workaround is in scope for v1.

**Alternatives considered**:
- Service Worker + `self.registration.showNotification`: works offline but requires a service worker registration. Possible without a backend, but adds complexity; service worker lifecycle bugs are common. Deferred to v2 if users request background notifications.
- `setInterval` polling: less precise for time-based firing; `setTimeout` to exact offset is cleaner.

---

## §4 — date-fns Usage Patterns

**Decision**: Use `date-fns` v3 tree-shakeable named imports throughout.

**Key functions resolved**:

| Need | date-fns function |
|---|---|
| ISO week number | `getISOWeek(date)` |
| Start of ISO week (Monday) | `startOfISOWeek(date)` |
| Generate week strip days | `eachDayOfInterval({ start: startOfISOWeek(today), end: endOfISOWeek(today) })` |
| 8-week trend: last 8 complete ISO weeks | `eachWeekOfInterval(interval, { weekStartsOn: 1 })` + `subWeeks(startOfISOWeek(today), 8)` |
| Month calendar grid | `eachDayOfInterval({ start: startOfMonth(d), end: endOfMonth(d) })` + `getDay()` for offset |
| Year heatmap (days per month) | `eachMonthOfInterval` + nested `eachDayOfInterval` |
| Format display labels | `format(date, 'MMM d')`, `format(date, 'MMMM yyyy')`, `format(date, 'yyyy')` |
| 7-day edit window | `differenceInCalendarDays(today, entryDate) <= 7` |

**Rationale**: All needed operations are covered by date-fns v3 without any custom date math, keeping `dateHelpers.js` thin.

---

## §5 — Recharts Patterns

**Decision**: `LineChart` (trend) and `BarChart` (day-of-week), both responsive via `ResponsiveContainer`.

**Trend line** (`Insights.jsx`):
- Data: array of `{ week: "W14", pctGood: 68 }` for the 8 most recent complete ISO weeks.
- `<LineChart>` + `<Line type="monotone" dataKey="pctGood" stroke={token.good}>` + `<XAxis dataKey="week">` + `<Tooltip>`.
- If any week has zero loggable days, the point is `null` (gap in line, not zero).

**Day-of-week bar chart** (`Insights.jsx`):
- Data: array of `{ day: "Mon", pctGood: 72, isBest: true, isWorst: false }` for Mon–Fri (+ workable weekend days if any).
- `<BarChart>` with a custom `<Cell>` fill: `good-light` for best day, `bad-light` for worst, `off` for others.
- Highlighting is determined in `useMoodData` selector, not inside the component.

**Alternatives considered**:
- D3 direct: constitution §Tech Constraints explicitly prohibits D3 for chart rendering.
- Victory: smaller community, less maintained for React 18.

---

## §6 — % Good Calculation Edge Cases

**Decision**: Implement `percentGood(entries)` in `utils/calculations.js` to return `null` when denominator is zero, and display `"—"` in the UI.

**Logic**:
```js
function percentGood(entries) {
  const good = entries.filter(e => e.mood === 'good').length;
  const bad  = entries.filter(e => e.mood === 'bad').length;
  if (good + bad === 0) return null;
  return (good / (good + bad)) * 100;
}
```

Returns a raw number (not rounded) so callers can format to one decimal place with `toFixed(1)`. Returns `null` for the "all Off" case; UI checks for `null` and renders `"—"` (FR-016).

---

## §7 — Workable-Day State Design

**Decision**: `workableDays` in `AppState` is a `Set<string>` in runtime (JavaScript `Set`), serialised as `string[]` to localStorage.

**Lookup**: `workableDays.has('2026-04-18')` — O(1). Used by every screen that needs to check if a Saturday/Sunday is eligible for logging.

**Toggle action**: `TOGGLE_WORKABLE_DAY` dispatched with `{ date: isoString }`. If date is in the set, remove it (and delete any associated mood entry for that day if it exists — the entry for a day that is no longer workable becomes orphaned). If not in set, add it.

**Constraint**: The toggle applies per-week (per spec). Since `workableDays` stores specific ISO dates (not week-level flags), the per-week behaviour is automatic — toggling `2026-04-18` only affects that exact Saturday.
