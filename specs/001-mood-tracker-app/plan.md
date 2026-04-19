# Implementation Plan: Work Mood Tracker App

**Branch**: `001-mood-tracker-app` | **Date**: 2026-04-19 | **Spec**: [spec.md](spec.md)  
**Input**: Feature specification from `/specs/001-mood-tracker-app/spec.md`

## Summary

Build a mobile-first, no-backend SPA using React 18 + Vite + Tailwind CSS that lets knowledge workers log their daily work mood (Good/Bad/Off), review patterns on five screens (Today, Weekly, Monthly, Yearly, Insights), and optionally receive browser reminders — all data living in `localStorage`.

## Technical Context

**Language/Version**: JavaScript ES2022+, Node 20 (dev toolchain)  
**Primary Dependencies**: React 18.3, React Router 6, Tailwind CSS 3, date-fns 3, Recharts 2, Vite 5  
**Storage**: `localStorage` via `utils/storage.js` — single JSON blob under key `mood-tracker-v1`  
**Testing**: Vitest + @testing-library/react (see research.md §1 for decision rationale)  
**Target Platform**: iOS Safari 15.4+, Android Chrome 90+; Chrome/Firefox desktop 90+ (secondary)  
**Project Type**: Single Page Application, served as static files  
**Performance Goals**: Interactive in < 3s on mid-range mobile / 4G (SC-005); first mood log < 10s from first open (SC-001)  
**Constraints**: Fully offline, zero network calls at runtime, 390px base viewport, single-device/single-user  
**Scale/Scope**: 5 screens, ≤ 366 entries/year, one user, one browser instance

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-checked after Phase 1 design.*

| # | Gate | Status | Evidence |
|---|------|--------|----------|
| I | No-Backend / Privacy-First | ✅ PASS | All data via `localStorage`; no fetch/XHR; reminder uses Web Notifications API device-locally; no SDK phoning home |
| II | Mobile-First UI | ✅ PASS | 390px base viewport enforced; all screens designed mobile-first; design tokens (paper, good, bad, off, accent, ink, muted) and 5-role typography scale from TRD §4 are authoritative |
| III | Single Responsibility per Route | ✅ PASS | 5 route files (Today, Weekly, Monthly, Yearly, Insights) are presentational shells; business logic lives in `hooks/` + `utils/`; selectors in `useMoodData.js` |
| IV | Declarative State via Context + Reducer | ✅ PASS | `MoodContext` + `useReducer` is the single source of truth; components read via `useMoodData`, write via dispatch; `localStorage` access isolated to `utils/storage.js` |
| V | YAGNI / v1 Scope Lock | ✅ PASS | No team dashboards, no AI, no HR integrations, no server; 7-day edit window is exact; data export deferred |

**Post-Phase-1 re-check**: All gates still pass — no new dependencies introduced; `localStorage` schema versioned with `mood-tracker-v1` key; notification approach is session-local (see research.md §3).

## Project Structure

### Documentation (this feature)

```text
specs/001-mood-tracker-app/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   ├── context-actions.md
│   ├── storage-api.md
│   └── calculations-api.md
└── tasks.md             # Phase 2 output (/speckit.tasks — NOT created here)
```

### Source Code (repository root)

```text
src/
├── main.jsx                  # Vite entry — wraps app in BrowserRouter + MoodProvider
├── App.jsx                   # Route definitions + bottom-tab nav shell
├── routes/
│   ├── Today.jsx             # P1: mood selector + note + week strip
│   ├── Weekly.jsx            # P1: Mon–Sun list + week nav + workable-day toggle
│   ├── Monthly.jsx           # P1: calendar grid + count chips + month nav
│   ├── Yearly.jsx            # P2: month-per-row heatmap + year nav
│   └── Insights.jsx          # P2: % good hero + delta badge + charts + time-range
├── context/
│   └── MoodContext.jsx       # Global state: useReducer + localStorage sync + dispatch
├── hooks/
│   ├── useMoodData.js        # Selectors: weekEntries, monthEntries, yearEntries, stats
│   └── useReminder.js        # Web Notifications API scheduling wrapper
├── utils/
│   ├── calculations.js       # percentGood(), weekLabel(), deltaVsPrior()
│   ├── storage.js            # localStorage read/write helpers (versioned key)
│   └── dateHelpers.js        # ISO week, month grid, year grid generation
└── components/
    ├── MoodButton.jsx         # Good / Bad / Off selector button atom
    ├── DotCell.jsx            # Calendar/heatmap day cell
    ├── WeekStrip.jsx          # 7-day strip used on Today screen
    ├── CountChip.jsx          # "Good: 10 · Bad: 5 · Off: 3" chip
    └── BottomNav.jsx          # 5-tab navigation bar

tests/
├── unit/
│   ├── calculations.test.js  # percentGood, weekLabel, deltaVsPrior
│   ├── dateHelpers.test.js   # ISO week, grid generation
│   └── storage.test.js       # read/write, versioning
└── integration/
    ├── Today.test.jsx         # Mood logging, note, week strip
    ├── Weekly.test.jsx        # Week list, workable-day toggle, % good label
    └── Insights.test.jsx      # 5-day gate, time-range picker, chart rendering
```

**Structure Decision**: Single-project SPA (Option 1). No backend, no monorepo needed. Mirrors the TRD §3 layout exactly with tests added.

## Complexity Tracking

> No constitution violations found. Table intentionally empty.
