# Contract: calculations.js API

**Phase**: 1 | **Date**: 2026-04-19

Pure functions in `utils/calculations.js`. No side effects, no imports from other project modules. All functions MUST have unit tests before the dependent screen ships (constitution §Dev Workflow).

---

## Functions

### `percentGood(entries: MoodEntry[]) => number | null`

Calculate % good for an array of mood entries.

- Formula: `good / (good + bad) * 100`
- Off entries are excluded from the denominator
- Returns `null` when `good + bad === 0` (all Off, or empty array)
- Returns a raw float; callers format to one decimal place with `.toFixed(1)`

```js
percentGood([])                                    // null
percentGood([{ mood: 'off' }])                     // null
percentGood([{ mood: 'good' }, { mood: 'bad' }])  // 50
percentGood([{ mood: 'good' }, { mood: 'off' }])  // 100
```

---

### `weekLabel(pctGood: number | null) => string`

Derive the week-quality label from a % good value.

| Condition | Label |
|---|---|
| `pctGood === null` | `"—"` |
| `pctGood >= 80` | `"Good week"` |
| `pctGood >= 50` | `"Mixed week"` |
| `pctGood < 50` | `"Tough week"` |

```js
weekLabel(null)  // "—"
weekLabel(80)    // "Good week"
weekLabel(79.9)  // "Mixed week"
weekLabel(49)    // "Tough week"
```

---

### `deltaVsPrior(current: number | null, prior: number | null) => number | null`

Calculate the percentage-point delta between current and prior period % good.

- Returns `null` if either value is `null` (no prior period to compare)
- Returns `current - prior` (positive = improvement, negative = decline)

```js
deltaVsPrior(68, 60)    // 8
deltaVsPrior(60, 68)    // -8
deltaVsPrior(null, 60)  // null
deltaVsPrior(68, null)  // null
```

---

### `formatPctGood(value: number | null) => string`

Format a `percentGood` return value for display.

- `null` → `"—"`
- number → `value.toFixed(1) + "%"` (e.g., `"68.0%"`)

```js
formatPctGood(null)   // "—"
formatPctGood(68)     // "68.0%"
formatPctGood(100)    // "100.0%"
```

---

## Usage by Screen

| Screen | Functions used |
|---|---|
| Today | `percentGood` (week strip stat) |
| Weekly | `percentGood`, `weekLabel` |
| Monthly | `percentGood` (count chips) |
| Yearly | `percentGood`, `formatPctGood` |
| Insights | `percentGood`, `deltaVsPrior`, `formatPctGood` |
