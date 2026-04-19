# Tasks: Work Mood Tracker App

**Input**: Design documents from `/specs/001-mood-tracker-app/`  
**Prerequisites**: plan.md ✅ | spec.md ✅ | research.md ✅ | data-model.md ✅ | contracts/ ✅ | quickstart.md ✅  
**Design reference**: `docs/mocks.pdf` — **MUST be consulted for every UI implementation task**

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no blocking dependencies)
- **[Story]**: Which user story this task belongs to (US1–US6)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization, build tooling, and routing scaffold

- [X] T001 Initialize Vite + React 18 project with all dependencies: `npm create vite@latest . -- --template react && npm install react-router-dom date-fns recharts && npm install -D tailwindcss@3 postcss autoprefixer vitest @testing-library/react @testing-library/user-event @testing-library/jest-dom jsdom`
- [X] T002 Configure Tailwind CSS v3 with full design token palette and typography in `tailwind.config.js` (paper, good, good-light, bad, bad-light, off, accent, ink, muted; font-serif Georgia, font-sans Inter)
- [X] T003 [P] Configure Vitest with jsdom environment in `vite.config.js` and create `tests/setup.js` with `@testing-library/jest-dom` import
- [X] T004 [P] Install `@fontsource/inter` (`npm install @fontsource/inter`), import in `src/main.jsx` (`import '@fontsource/inter'`), create `index.html` with viewport meta tag `width=device-width, initial-scale=1` and Vite entry point — no Google Fonts CDN link (privacy-first: no network calls to third parties)
- [X] T005 [P] Scaffold all empty directories: `src/routes/`, `src/context/`, `src/hooks/`, `src/utils/`, `src/components/`, `tests/unit/`, `tests/integration/`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core utilities, state layer, and shared UI atoms — MUST be complete before any screen is built

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T006 Implement `src/utils/storage.js`: export `STORAGE_KEY = 'mood-tracker-v1'`, `DEFAULT_STATE`, `load()` (reads key → parse JSON → converts `workableDays` array to `Set` → returns `DEFAULT_STATE` on absence or parse failure with `console.warn`), `save(state)` (converts `Set` → array → `JSON.stringify`, swallows `QuotaExceededError`), `clear()`
- [X] T007 [P] Implement `src/utils/calculations.js`: `percentGood(entries)` returns `number | null` (good/(good+bad)*100, null when denominator=0), `weekLabel(pctGood)` (≥80→"Good week", 50–79→"Mixed week", <50→"Tough week", null→"—"), `deltaVsPrior(current, prior)` (returns null if either null), `formatPctGood(value)` (null→"—", number→"68.0%")
- [X] T008 [P] Implement `src/utils/dateHelpers.js` using date-fns v3: `getWeekDays(date)` (Mon–Sun via `eachDayOfInterval(startOfISOWeek, endOfISOWeek)`), `getMonthGrid(year, month)` (days + leading offset for calendar), `getYearMonths(year)` (12 months with their days), `formatISODate(date)` (→ "YYYY-MM-DD"), `isWithin7Days(isoDate)` (`differenceInCalendarDays <= 7`), `getWeekLabel(date)` (e.g. "Week 16"), `getLast8ISOWeeks(today)` (8 complete weeks ending before this week)
- [X] T009 Write unit tests for `src/utils/calculations.js` in `tests/unit/calculations.test.js` — cover: `percentGood` with empty array, all-Off, mix of good/bad/off, 100% good; `weekLabel` at each threshold boundary; `deltaVsPrior` with null inputs; `formatPctGood` null and numeric. **Constitution mandates these tests exist before any screen ships.**
- [X] T010 [P] Write unit tests for `src/utils/storage.js` in `tests/unit/storage.test.js` — cover: `load()` on empty storage returns `DEFAULT_STATE`, `load()` with corrupted JSON returns `DEFAULT_STATE`, `save()` + `load()` round-trip preserves `workableDays` Set, `clear()` removes key
- [X] T011 [P] Write unit tests for `src/utils/dateHelpers.js` in `tests/unit/dateHelpers.test.js` — cover: `getWeekDays` starts on Monday, `getMonthGrid` has correct leading offset, `isWithin7Days` boundary (7 days = editable, 8 days = not)
- [X] T012 Implement `src/context/MoodContext.jsx`: `useReducer` with initial state from `storage.load()`, sync to `storage.save()` on every dispatch, export `MoodContext`, `MoodProvider`, `useMoodContext` hook. Reducer handles: `LOG_MOOD` (upsert by date), `UPDATE_NOTE`, `DELETE_ENTRY`, `TOGGLE_WORKABLE_DAY` (removes associated entry if un-marking), `SET_REMINDER`
- [X] T013 Implement `src/hooks/useMoodData.js`: selectors wrapping `state` from `useMoodContext()` — `getEntry(date)`, `canLog(date)` (weekday OR in workableDays), `isEditable(date)` (within 7 calendar days), `isWorkableDay(date)`, `weekEntries(isoWeekStart)`, `weekStats(isoWeekStart)` → `{pctGood, label}`, `monthEntries(year, month)`, `monthCounts(year, month)` → `{good, bad, off}`, `yearEntries(year)`, `yearStats(year)`, `trendData(endDate)` (8 ISO weeks), `dowData(entries)` (Mon–Fri + workable weekend, isBest/isWorst flags), `insightsStats(range)` → `{pctGood, delta, entries}`, `reminderSettings`
- [X] T014 [P] Implement `src/components/MoodButton.jsx`: renders a tappable button for one mood value (`good|bad|off`); props: `mood`, `selected` (boolean), `disabled` (boolean), `onClick`; uses design tokens (good/bad/off colours); 390px-first sizing; refer to `docs/mocks.pdf` for visual treatment
- [X] T015 [P] Implement `src/components/DotCell.jsx`: single day cell for calendar and heatmap grids; props: `mood` (`good|bad|off|null`), `day` (number), `isWorkable` (boolean), `onClick`; colour-fills using design tokens (good→good, good-light in heatmap, etc.); refer to `docs/mocks.pdf`
- [X] T016 [P] Implement `src/components/CountChip.jsx`: displays "Good: N · Bad: N · Off: N" summary; props: `good`, `bad`, `off`; font-sans text-xs text-muted; refer to `docs/mocks.pdf`
- [X] T017 [P] Implement `src/components/WeekStrip.jsx`: horizontal 7-day strip (Mon–Sun); props: `weekStart` (Date), `entries` (Record<string, MoodEntry>), `workableDays` (Set), `selectedDate` (string), `onSelectDate`; each cell shows mood colour or empty; today highlighted; refer to `docs/mocks.pdf`
- [X] T018 Implement `src/components/BottomNav.jsx`: 5-tab nav bar (Today, Weekly, Monthly, Yearly, Insights) using React Router `<NavLink>`; active tab uses `accent` colour; fixed bottom, full-width, mobile-first; refer to `docs/mocks.pdf`
- [X] T019 Wire `src/main.jsx` (wrap in `<BrowserRouter>` + `<MoodProvider>`) and `src/App.jsx` (define 5 `<Route>` entries, render `<BottomNav>` as persistent shell, default redirect to `/today`)

**Checkpoint**: Foundation ready — all utilities tested, context wired, atoms built. User story screens can now be built.

---

## Phase 3: User Story 1 — Daily Mood Logging (Priority: P1) 🎯 MVP

**Goal**: User can open Today screen, tap a mood, optionally add a note, save, and have the entry persist across page refresh.

**Independent Test**: Log "Good" mood with a note → refresh page → entry still shown as selected. Re-log "Bad" → entry updates. Attempt to edit a day 8+ days old → controls disabled. Log on a Saturday without marking it workable → selector disabled with message.

**Refer to `docs/mocks.pdf`** for the Today screen layout on every task below.

- [X] T020 [US1] Implement `src/routes/Today.jsx` layout: screen title ("Today" + formatted date), 3 `<MoodButton>` atoms (Good/Bad/Off), note `<textarea>` with 280-char limit + live character counter, Save button that dispatches `LOG_MOOD`; read today's entry via `getEntry(today)`; use `canLog(today)` to enable/disable selector
- [X] T021 [US1] Add within-day replacement in `Today.jsx`: if entry exists for today, pre-select its mood and populate note field; Save dispatches `LOG_MOOD` (upsert behaviour already in reducer)
- [X] T022 [US1] Add `<WeekStrip>` to `Today.jsx` showing current week; selecting a past day (within 7-day window) surfaces that day's mood + note in edit mode with Update and Delete buttons; dispatch `LOG_MOOD` / `DELETE_ENTRY`; disable controls for days > 7 days old with explanatory message
- [X] T023 [US1] Add weekend-day blocking to `Today.jsx`: when today is Sat/Sun and not in `workableDays`, show disabled mood selector and message "Mark this day workable in the Weekly view to log your mood"
- [X] T024 [US1] Write integration test for `Today.jsx` in `tests/integration/Today.test.jsx`: seed MoodContext with known entries, render Today, assert mood button selection, note input, save dispatch, week strip display, 7-day edit window enforcement, weekend blocking

**Checkpoint**: User Story 1 fully functional — daily mood logging, editing, deletion, and weekend guard all work.

---

## Phase 4: User Story 2 — Weekly Review (Priority: P1)

**Goal**: User can see all 7 days of a week with mood indicators + note previews, a % good stat, a week-quality label, navigate to any prior/future week, and mark a weekend day workable.

**Independent Test**: Seed 3 Good + 1 Bad + 1 Off for current week → Weekly screen shows % good = 75%, label "Mixed week". Navigate back one week → different data loads. Toggle Saturday workable → Saturday becomes active day. Navigate to different week → Saturday reverts to non-workday.

**Refer to `docs/mocks.pdf`** for the Weekly screen layout on every task below.

- [X] T025 [US2] Implement `src/routes/Weekly.jsx` layout: screen title ("Week N, YYYY"), Mon–Sun list rows each showing day name + date + mood indicator + truncated note preview (if any); empty rows for days without entries; use `weekEntries(isoWeekStart)` selector
- [X] T026 [US2] Add week navigation to `Weekly.jsx`: back/forward arrow buttons update local `weekStart` state (default = current ISO week start); title updates; entries re-derive from selector
- [X] T027 [US2] Add `weekStats` display to `Weekly.jsx`: % good hero (using `formatPctGood`) + week-quality label (`weekLabel`) via `weekStats(weekStart)` selector; display "—" when pctGood is null
- [X] T028 [US2] Add workable-day toggle to `Weekly.jsx`: Sat and Sun rows show a toggle control; dispatches `TOGGLE_WORKABLE_DAY`; toggling on makes the row active and enables mood entry for that day; un-toggling also removes any existing entry for that date (handled in reducer, tested in T030)
- [X] T029 [US2] Apply non-workday visual treatment in `Weekly.jsx`: Sat/Sun rows that are NOT in `workableDays` are visually muted (text-muted, no mood indicator slot) and labelled as non-workday; refer to `docs/mocks.pdf`
- [X] T030 [US2] Write integration test for `Weekly.jsx` in `tests/integration/Weekly.test.jsx`: verify % good and week label for each threshold case, week navigation, workable-day toggle behaviour, per-week toggle isolation (toggling week N doesn't affect week N-1)

**Checkpoint**: User Stories 1 + 2 both functional independently.

---

## Phase 5: User Story 3 — Monthly Calendar View (Priority: P1)

**Goal**: User can see a calendar grid for the month with colour-filled cells, count chips for Good/Bad/Off totals, and navigate to any month.

**Independent Test**: Seed 10 Good + 5 Bad + 3 Off for a month → chips show correct counts → cells are colour-coded → navigate to previous month → different data loads → tapping a day with a note reveals the note.

**Refer to `docs/mocks.pdf`** for the Monthly screen layout on every task below.

- [X] T031 [US3] Implement `src/routes/Monthly.jsx` layout: screen title ("Month YYYY"), calendar grid using `getMonthGrid` with leading empty cells for weekday offset, each cell is a `<DotCell>` coloured by mood token; use `monthEntries(year, month)` selector
- [X] T032 [US3] Add `<CountChip>` to `Monthly.jsx` above the grid showing `monthCounts(year, month)` totals
- [X] T033 [US3] Add month navigation to `Monthly.jsx`: back/forward arrows update local `{year, month}` state; title and grid re-derive
- [X] T034 [US3] Add tap-to-reveal note in `Monthly.jsx`: tapping a `<DotCell>` that has an entry opens a bottom sheet or inline expansion showing the full note for that day; refer to `docs/mocks.pdf` for interaction pattern

**Checkpoint**: All P1 screens (Today, Weekly, Monthly) independently functional. P1 delivery complete.

---

## Phase 6: User Story 4 — Yearly Heatmap (Priority: P2)

**Goal**: User can see a full-year heatmap (one row per month, dot per day), a YTD % good stat with total counts, and navigate to any year.

**Independent Test**: Seed a full year of entries → 12 rows visible → dots colour-coded by mood-light tokens → YTD % good and totals accurate → navigate to previous year → different data loads.

**Refer to `docs/mocks.pdf`** for the Yearly screen layout on every task below.

- [X] T035 [US4] Implement `src/routes/Yearly.jsx` layout: screen title (year number), 12 month rows each with month label + row of `<DotCell>` atoms (good-light/bad-light/off/neutral colour scale); use `getYearMonths(year)` + `yearEntries(year)` selectors; refer to `docs/mocks.pdf`
- [X] T036 [US4] Add yearly stats to `Yearly.jsx`: YTD % good hero (using `formatPctGood`), total Good day count, total Bad day count via `yearStats(year)` selector
- [X] T037 [US4] Add year navigation to `Yearly.jsx`: back/forward arrows update local `year` state; grid and stats re-derive

**Checkpoint**: User Stories 1–4 all independently functional.

---

## Phase 7: User Story 5 — Insights Dashboard (Priority: P2)

**Goal**: User with ≥ 5 logged days sees a % good hero, delta badge, 8-week trend line, and day-of-week bar chart; time-range picker filters all stats; user with < 5 days sees an empty-state message.

**Independent Test**: Seed < 5 entries → no charts rendered, message shown. Seed ≥ 5 entries → all chart elements render. Switch range to "Last 90 days" → stats update. Verify delta badge sign and colour. Verify best/worst day bars highlighted.

**Refer to `docs/mocks.pdf`** for the Insights screen layout on every task below.

- [X] T038 [US5] Implement 5-day gate in `src/routes/Insights.jsx`: count total logged entries; if < 5, render empty state message "Log at least 5 days to see insights"; otherwise render insights content; no charts rendered below threshold (FR-011)
- [X] T039 [US5] Add % good hero + delta badge to `Insights.jsx`: use `insightsStats(range)` → `{pctGood, delta}`; render `formatPctGood(pctGood)` in Display typography; delta badge shows `"+ N pp"` in good colour or `"- N pp"` in bad colour; show "—" if delta is null (no prior period); refer to `docs/mocks.pdf`
- [X] T040 [US5] Add time-range picker to `Insights.jsx`: three-segment control (Last 30 days / Last 90 days / This year); updates local `range` state; all stats and charts re-derive via `insightsStats(range)` and `trendData` / `dowData`
- [X] T041 [US5] Implement 8-week trend `<LineChart>` (Recharts) in `Insights.jsx`: data from `trendData(today)` — always the **8 most recent complete ISO weeks**, independent of the time-range picker; `<ResponsiveContainer>`, `<Line type="monotone" dataKey="pctGood" stroke={good token}>`, `<XAxis dataKey="week">`, `<Tooltip>`; null points render as line gaps; refer to `docs/mocks.pdf`
- [X] T042 [US5] Implement day-of-week `<BarChart>` (Recharts) in `Insights.jsx`: data from `dowData(entries)`; `<Cell>` fill: `good-light` for isBest, `bad-light` for isWorst, `off` otherwise; `<ResponsiveContainer>`, `<XAxis dataKey="day">`, `<Tooltip>`; refer to `docs/mocks.pdf`
- [X] T053 [US5] Write integration test for `Insights.jsx` in `tests/integration/Insights.test.jsx`: (a) seed < 5 entries → assert no charts rendered + message shown; (b) seed ≥ 5 entries → assert hero stat, delta badge, trend line, and bar chart all render; (c) seed exactly 5 entries with no prior-period data → assert delta badge shows "—"; (d) switch time range → assert hero stat and delta badge update; (e) assert trend line always shows 8-week data regardless of selected range

**Checkpoint**: All P2 analytical screens (Yearly, Insights) functional. Insights gate verified.

---

## Phase 8: User Story 6 — Daily Reminder (Priority: P2)

**Goal**: User can enable a daily reminder at a chosen time (default 18:00 weekdays); notification fires via Web Notifications API; fires on workable weekend days; suppressed if already logged.

**Independent Test**: Enable reminder → grant permission → wait for configured time → notification fires. Deny permission → toggle reverts to off + message shown. Already logged today → reminder suppressed. Saturday marked workable + reminder enabled → notification fires Saturday.

**Refer to `docs/mocks.pdf`** for any reminder/settings UI layout.

- [X] T043 [US6] Implement `src/hooks/useReminder.js`: read `reminderSettings` from `useMoodContext`; on mount and `visibilitychange` → `visible`, calculate `setTimeout` ms to the next eligible fire time — if the configured time has already passed for today, schedule for the next eligible weekday (or workable day); on fire call `new Notification('Work Mood Tracker', { body: ... })` then reschedule for the following day; clear timeout on unmount; check `Notification.permission` before firing; suppress notification (but still reschedule) if today's entry already exists
- [X] T044 [US6] Add reminder settings UI: render a settings panel accessible via a gear icon (⚙) in the Today screen header; the panel contains a reminder on/off toggle + `<input type="time">` (default `"18:00"`); on toggle-on, call `Notification.requestPermission()`; if denied, show inline message "Notification permission required" and keep toggle off; dispatch `SET_REMINDER` on any change; do NOT add a 6th tab to BottomNav (FR-005 limits navigation to 5 tabs); refer to `docs/mocks.pdf`
- [X] T045 [US6] Add workable-day check to `useReminder.js`: before scheduling for Saturday/Sunday, check `isWorkableDay(date)` via `useMoodData`; only schedule if workable
- [X] T046 [US6] Add "already logged" suppression to `useReminder.js`: at notification fire time, check `getEntry(today)`; if entry exists, skip `new Notification()` call; reschedule for next day

**Checkpoint**: All 6 user stories complete and independently functional.

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Responsiveness, font loading, performance, and validation

- [X] T047 [P] Add `sm:` responsive padding and `max-w-sm mx-auto` centering to all 5 route layouts for 640px+ viewports; implement `md:` sidebar navigation in `App.jsx` (BottomNav hidden at md+, sidebar shown with same 5 tabs); refer to TRD §4.2
- [X] T048 [P] Verify Tailwind mobile-first integrity: no `sm:` / `md:` prefix used to fix broken 390px layouts; audit all 5 route files and components
- [X] T049 [P] Add PWA manifest (`public/manifest.json`) and theme-color meta to `index.html` so the app is installable on iOS/Android home screen
- [ ] T050 [P] Verify storage recovery: clear `localStorage` in browser dev tools → reload → app shows empty state with no errors; corrupt the storage key manually → app recovers silently
- [X] T051 Run `npm run build` and `npm run preview`; verify production bundle loads and is interactive in < 3s on throttled 4G in Chrome DevTools (SC-005); fix any Vite build warnings
- [X] T052 Run full Vitest suite (`npm test`) and confirm all unit and integration tests pass; fix any failures before marking complete
- [ ] T054 Manual validation checklist — SC-001: time first mood log from cold open (target < 10s); SC-002: log mood on Today screen, navigate to Weekly, confirm data appears without page refresh; SC-003: enable airplane mode → reload app → verify all 5 screens render with existing data and no network errors

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — start immediately; T003/T004/T005 can run in parallel after T001+T002
- **Phase 2 (Foundational)**: Depends on Phase 1 complete — **BLOCKS all screens**
  - T006 before T012 (storage before context)
  - T007, T008 can run in parallel (independent utils)
  - T009, T010, T011 (unit tests) can run in parallel with each other after their respective implementations
  - T012 after T006; T013 after T012
  - T014–T017 (atom components) can run in parallel
  - T018 after T014–T017; T019 after T018 + T013
- **Phase 3 (US1)**: After Phase 2 complete
- **Phase 4 (US2)**: After Phase 2 complete (parallel with US1 if staffed)
- **Phase 5 (US3)**: After Phase 2 complete (parallel with US1/US2 if staffed)
- **Phase 6 (US4)**: After Phase 2 + ideally Phase 3–5 data in place
- **Phase 7 (US5)**: After Phase 2; requires `trendData` / `dowData` / `insightsStats` selectors in T013; T053 (integration test) can run after T038–T042
- **Phase 8 (US6)**: After Phase 2 + T044 needs BottomNav/Settings structure from Phase 2
- **Phase 9 (Polish)**: After all desired stories complete

### User Story Dependencies

- **US1 (P1)**: Starts after Phase 2 — independent
- **US2 (P1)**: Starts after Phase 2 — independent
- **US3 (P1)**: Starts after Phase 2 — independent
- **US4 (P2)**: Starts after Phase 2 — independent (but benefits from real data from US1–3)
- **US5 (P2)**: Starts after Phase 2 — requires `insightsStats`, `trendData`, `dowData` in `useMoodData` (T013)
- **US6 (P2)**: Starts after Phase 2 — `useReminder` reads from context; settings UI needs nav structure

---

## Parallel Execution Examples

### Phase 2 Parallel Batch A (after T006)
```
Task: T007 — Implement calculations.js
Task: T008 — Implement dateHelpers.js
```

### Phase 2 Parallel Batch B (after T007/T008)
```
Task: T009 — Unit tests calculations.js
Task: T010 — Unit tests storage.js
Task: T011 — Unit tests dateHelpers.js
```

### Phase 2 Parallel Batch C (after T013)
```
Task: T014 — MoodButton.jsx
Task: T015 — DotCell.jsx
Task: T016 — CountChip.jsx
Task: T017 — WeekStrip.jsx
```

### P1 Stories Parallel (after Phase 2 complete)
```
Task: T020–T024 — Today screen (US1)
Task: T025–T030 — Weekly screen (US2)
Task: T031–T034 — Monthly screen (US3)
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (**CRITICAL** — blocks all stories)
3. Complete Phase 3: User Story 1 (Today screen)
4. **STOP and VALIDATE**: Log a mood, refresh, verify persistence, test edit/delete, test weekend guard
5. Ship MVP

### Incremental P1 Delivery

1. Setup + Foundational → Foundation ready
2. US1 (Today) → MVP
3. US2 (Weekly) → adds review layer
4. US3 (Monthly) → completes P1 set

### Full P2 Delivery

5. US4 (Yearly) → macro view
6. US5 (Insights) → analytical layer
7. US6 (Reminder) → retention feature
8. Polish → production-ready

---

## Notes

- **Every UI task must be implemented to match `docs/mocks.pdf`** — open it before writing any JSX
- [P] tasks touch different files and have no blocking dependencies — safe to run in parallel
- Unit tests for `calculations.js` (T009) are **mandatory** before any screen ships (constitution §Dev Workflow)
- `TOGGLE_WORKABLE_DAY` that removes a workable day must also delete the associated entry — test this explicitly
- `percentGood` returns raw float; always format via `formatPctGood()` for display — never call `.toFixed()` directly in components
- Commit after each checkpoint to preserve a known-good state
