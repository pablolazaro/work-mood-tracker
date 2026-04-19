# Feature Specification: Work Mood Tracker App

**Feature Branch**: `001-mood-tracker-app`
**Created**: 2026-04-19
**Status**: Draft
**Input**: User description: "read the @docs/PRD.md"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Daily Mood Logging (Priority: P1)

A knowledge worker opens the app at the end of their workday and logs how the day felt with a single tap. They can optionally add a short note before saving. If they logged the wrong mood, they can re-log any day within the past 7 days.

**Why this priority**: This is the core loop. Without daily logging, no other screen has data to show. Everything else depends on this working correctly.

**Independent Test**: Can be tested end-to-end by selecting a mood, adding a note, saving, and confirming the entry persists after a page refresh. Delivers a functional MVP on its own.

**Acceptance Scenarios**:

1. **Given** the Today screen is open with no entry for today, **When** the user taps "Good", **Then** today's mood is saved as Good and the button shows as selected.
2. **Given** the Today screen is open with no entry for today, **When** the user taps "Bad", adds a 50-character note, and saves, **Then** the mood and note are persisted to local storage.
3. **Given** the user already logged "Good" today, **When** they return and tap "Bad", **Then** the entry is updated to Bad (within-day replacement).
4. **Given** the user wants to correct a mood from 3 days ago, **When** they select that day on the week strip and change the mood, **Then** the historical entry is updated.
5. **Given** the user wants to correct a mood from 8 days ago, **When** they attempt to do so, **Then** the edit control is disabled and a message indicates the 7-day edit window has passed.
8. **Given** the user wants to delete an entry from 2 days ago, **When** they confirm the deletion, **Then** the day returns to an unlogged state and all stats update accordingly.
9. **Given** the user wants to delete an entry from 8 days ago, **When** they attempt to do so, **Then** the delete control is disabled (same 7-day window constraint as editing).
6. **Given** the user types a note exceeding 280 characters, **When** they reach the limit, **Then** further input is blocked and a character count indicator is shown.
7. **Given** the "Off" mood is selected, **When** the entry is saved, **Then** the day is stored as Off and is excluded from % good calculations.
10. **Given** today is a Saturday that has not been marked workable, **When** the user views the Today screen, **Then** the mood selector for today is disabled and a message indicates the day must be marked workable before logging.

---

### User Story 2 - Weekly Review (Priority: P1)

A user wants to review how their week went. They open the Weekly screen to see each day Mon–Fri with its mood and note preview, a headline % good for the week, and a label ("Good week", "Mixed week", or "Tough week"). Saturday and Sunday are shown but marked as non-workdays by default; the user can toggle any weekend day to be a workable day, which makes it accept mood entries and include it in weekly stats.

**Why this priority**: The weekly view is the first aggregation layer and provides immediate feedback on recent patterns — it shares P1 priority with Today because it validates the logging habit.

**Independent Test**: Can be tested by pre-seeding entries for a full Mon–Fri week and verifying the list, % good calculation, and week label all render correctly. Weekend workable-day toggle can be tested independently by enabling Saturday and logging a mood.

**Acceptance Scenarios**:

1. **Given** 5 entries exist (3 Good, 1 Bad, 1 Off) for the current week, **When** the Weekly screen opens, **Then** % good = 75% (3 ÷ 4, Off excluded) and the label is "Mixed week".
2. **Given** 5 entries exist (4 Good, 1 Bad), **When** the Weekly screen opens, **Then** % good = 80% and the label is "Good week".
3. **Given** 2 Good entries and 3 Bad entries for the week, **When** the Weekly screen opens, **Then** % good = 40% and the label is "Tough week".
4. **Given** a day has a note, **When** viewing the weekly list, **Then** a preview of the note (truncated if long) is shown below the mood indicator.
5. **Given** a day has no entry logged, **When** viewing the weekly list, **Then** it appears as blank/empty (no mood shown).
6. **Given** the Weekly screen is open, **When** it first loads, **Then** Saturday and Sunday are displayed but visually marked as non-workday (greyed out or labelled) and do not accept mood entries.
7. **Given** the user toggles Saturday to "workable" for a specific week, **When** the toggle is confirmed, **Then** Saturday becomes an active day in that week's list and accepts a mood entry.
8. **Given** Saturday has been marked workable and a Good mood logged, **When** viewing weekly stats, **Then** Saturday's entry is included in the % good calculation for that week.
9. **Given** Saturday was marked workable in week N, **When** viewing a different week, **Then** Saturday reverts to non-workday (the toggle applies per week, not globally).

---

### User Story 3 - Monthly Calendar View (Priority: P1)

A user wants to see their mood pattern across the entire month. They open the Monthly screen and see a calendar grid where each day cell is colour-filled based on its mood. Count chips at the top show how many Good, Bad, and Off days occurred.

**Why this priority**: The monthly view completes the P1 set of views required for meaningful pattern awareness.

**Independent Test**: Can be tested by seeding a month of entries and verifying colour coding, count chips, and empty cells for days without entries.

**Acceptance Scenarios**:

1. **Given** a month with 10 Good, 5 Bad, and 3 Off entries, **When** the Monthly screen opens, **Then** count chips display "Good: 10 · Bad: 5 · Off: 3".
2. **Given** a day has a Good mood logged, **When** viewing the calendar grid, **Then** that cell is filled with the "good" design-token colour.
3. **Given** a day has a Bad mood, **When** viewing the calendar grid, **Then** that cell is filled with the "bad" colour.
4. **Given** a day has no entry, **When** viewing the calendar grid, **Then** that cell is empty/neutral.
5. **Given** the user taps a day cell that has an entry, **When** the tap occurs, **Then** the note (if any) for that day is surfaced.

---

### User Story 4 - Yearly Heatmap (Priority: P2)

A user wants a bird's-eye view of the entire year. The Yearly screen shows one row per month, with a dot or cell per day colour-coded by mood. A YTD % good stat and total good/bad day counts are shown.

**Why this priority**: Provides macro-level insight but requires substantial data to be meaningful. Comes after P1 logging and review screens.

**Independent Test**: Can be tested by seeding a full year of entries and verifying the heatmap layout, YTD stats, and colour coding.

**Acceptance Scenarios**:

1. **Given** data for a full year, **When** the Yearly screen opens, **Then** 12 rows are shown, one per month, each with day-resolution dots.
2. **Given** the selected year has 60 Good, 20 Bad, and 10 Off entries, **When** viewing the Yearly screen, **Then** % good = 75% (60 ÷ 80) and total counts are displayed.
5. **Given** the user taps the back arrow on the Yearly screen, **When** the current view is 2026, **Then** the screen updates to show 2025 data with its own % good and totals.
3. **Given** a dot for a specific day, **When** it is Good, **Then** it uses the "good-light" token colour; Bad uses "bad-light"; Off uses "off" token.
4. **Given** a day with no entry, **When** viewing the heatmap, **Then** the dot is empty/neutral.

---

### User Story 5 - Insights Dashboard (Priority: P2)

A user who has logged at least 5 days wants to understand trends. The Insights screen shows a % good hero stat, a delta badge vs the prior equivalent period, an 8-week trend line, and a day-of-week breakdown chart. A time range picker lets them switch between last 30 days, last 90 days, and this year.

**Why this priority**: Requires at minimum 5 logged days and is most valuable after weeks of data. Depends on P1 screens for data collection.

**Independent Test**: Can be tested by seeding ≥5 days of data and verifying all chart elements, the minimum-data gate, and the time range switcher.

**Acceptance Scenarios**:

1. **Given** fewer than 5 logged days, **When** the Insights screen opens, **Then** charts are not rendered and a message explains that more data is needed.
2. **Given** ≥5 logged days, **When** the Insights screen opens, **Then** the % good hero stat, delta badge, trend line, and day-of-week chart all render.
3. **Given** the user switches the time range to "Last 90 days", **When** the selection is made, **Then** the % good hero stat and the delta badge update to reflect only entries in that range. The 8-week trend line always shows the 8 most recent complete ISO weeks and is not filtered by the time-range picker.
4. **Given** the delta badge shows ↑ 8pp, **When** the prior period had 60% good and the current period has 68%, **Then** the badge reads "+ 8 pp" in a positive colour.
5. **Given** the day-of-week chart, **When** rendered, **Then** the best day (highest % good) and worst day are visually highlighted.
6. **Given** the 8-week trend line, **When** rendered, **Then** it shows one data point per ISO week for the 8 most recent complete weeks.

---

### User Story 6 - Daily Reminder (Priority: P2)

A user wants to be reminded to log their mood each day. They enable the optional reminder, choose a time (defaulting to 6 PM weekdays), and receive a browser/device notification at that time.

**Why this priority**: Enhances retention but is not required for the core loop. Can be disabled by default with zero impact on other features.

**Independent Test**: Can be tested by enabling the reminder, setting a time, granting notification permission, and verifying the notification fires at the correct time.

**Acceptance Scenarios**:

1. **Given** reminders are off by default, **When** the user opens settings, **Then** the reminder toggle is in the off state.
2. **Given** the user enables the reminder and grants notification permission, **When** the set time arrives on a weekday, **Then** a notification is fired.
5. **Given** reminders are enabled and Saturday has been marked workable for the current week, **When** the configured reminder time arrives on that Saturday, **Then** a notification is fired.
6. **Given** reminders are enabled and Saturday has NOT been marked workable, **When** the configured time arrives on Saturday, **Then** no notification fires.
3. **Given** the user denies notification permission, **When** they attempt to enable the reminder, **Then** the app informs them that permission is required and the toggle remains off.
4. **Given** reminders are enabled, **When** the user has already logged today's mood, **Then** the reminder does not fire (or fires with a "you've already logged" message).

---

### Edge Cases

- What happens when the user clears all browser storage? App resets to an empty state with no error.
- How does the app handle a day that spans midnight (user logs just after midnight)? The entry is attributed to the calendar day matching the device clock.
- What if the user opens the app on a Saturday or Sunday that has not been marked workable? Mood logging is blocked for that day on all screens; the user must first mark it workable via the Weekly screen before an entry can be logged.
- What happens when the Insights screen is opened with exactly 5 logged days? Charts render with minimal data and no delta badge if there is no prior period to compare.
- What if % good would be NaN (0 good + 0 bad, all Off)? Display "—" rather than a number.
- What if the user marks Saturday as workable but never logs a mood for it? The day appears as an active but empty slot in the weekly list; it does not affect % good since no entry exists.
- What if a weekend day marked workable is within the 7-day edit window? It follows the same edit/delete rules as any other logged day.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Users MUST be able to log one of three mood states — Good, Bad, or Off — for any given calendar day. Monday through Friday are always available for logging. Saturday and Sunday MUST NOT accept mood entries unless that specific day has been marked workable by the user; this restriction applies across all screens (Today, Weekly, etc.).
- **FR-002**: Users MUST be able to attach an optional text note of up to 280 characters to any logged day.
- **FR-003**: Users MUST be able to re-log, edit, or delete a mood entry for any day within the past 7 calendar days; entries older than 7 days MUST be read-only and cannot be deleted.
- **FR-004**: All logged data MUST be persisted exclusively in the user's browser local storage — no data is transmitted to any server.
- **FR-005**: The app MUST expose five screens: Today, Weekly, Monthly, Yearly, and Insights, accessible via bottom-tab navigation on mobile.
- **FR-006**: The Today screen MUST show a week strip displaying the current week (Mon–Sun) with mood indicators for days that have entries.
- **FR-007**: The Weekly screen MUST display all seven days (Mon–Sun) for the selected week; Monday MUST be the first day of the week. Monday through Friday are workdays by default and accept mood entries. Saturday and Sunday are non-workdays by default and MUST be visually distinguished (e.g., greyed out) and not accept mood entries unless explicitly marked workable.
- **FR-007a**: The Weekly screen MUST provide back and forward navigation controls allowing users to browse any prior or future week without restriction.
- **FR-007b**: Users MUST be able to toggle Saturday or Sunday of any specific week to "workable," enabling mood logging for that day and including it in that week's % good calculation. This toggle MUST apply per-week only (not globally); each week defaults to Sat/Sun as non-workday independently.
- **FR-008**: The week-quality label MUST follow these rules: ≥ 80% good → "Good week"; 50–79% → "Mixed week"; < 50% → "Tough week". Off days are excluded from the denominator.
- **FR-009**: The Monthly screen MUST show a calendar grid with colour-filled cells per logged day and count chips for Good, Bad, and Off totals.
- **FR-009a**: The Monthly screen MUST provide back and forward navigation controls allowing users to browse any prior or future month without restriction.
- **FR-010**: The Yearly screen MUST show a month-per-row dot heatmap with a % good stat and total good/bad day counts for the selected year.
- **FR-010a**: The Yearly screen MUST provide back and forward navigation controls allowing users to browse any prior or future calendar year without restriction.
- **FR-011**: The Insights screen MUST NOT render any chart when fewer than 5 days have been logged.
- **FR-012**: The Insights screen MUST offer a time-range picker with options: last 30 days, last 90 days, this year.
- **FR-013**: The Insights screen MUST show an 8-week % good trend line (one point per ISO week) and a day-of-week bar chart highlighting best and worst days.
- **FR-014**: The Insights screen MUST show a delta badge indicating the change in % good vs the prior equivalent period. The prior equivalent period is defined per time range: "last 30 days" → the 30 days immediately before the current window (days 31–60 ago); "last 90 days" → days 91–180 ago; "this year" → January 1 through today's date of the prior calendar year. If no entries exist in the prior period, the delta badge MUST display "—".
- **FR-015**: % good MUST be calculated as `good ÷ (good + bad) × 100`; Off days MUST be excluded from the denominator.
- **FR-016**: When % good cannot be calculated (zero good + zero bad days), the app MUST display "—" rather than a numeric value.
- **FR-017**: The optional daily reminder MUST use the device-local Web Notifications API; it MUST be off by default and configurable by the user (time + on/off toggle).
- **FR-018**: The reminder MUST default to 6 PM on weekdays when first enabled. When a Saturday or Sunday has been marked workable for the current week, the reminder MUST also fire on that day at the configured time.

### Key Entities

- **MoodEntry**: Represents one logged day. Key attributes: `date` (ISO date string, e.g. `2026-04-19`), `mood` (enum: `good` | `bad` | `off`), `note` (string, max 280 chars, optional).
- **ReminderSettings**: Stores user reminder preferences. Key attributes: `enabled` (boolean), `time` (HH:MM string, default `"18:00"`).
- **WorkableDay**: Records a user-overridden weekend day. Key attributes: `date` (ISO date string for the specific Saturday or Sunday), `workable` (boolean, true = user marked this day as workable for its week).
- **AppState**: Root state object. Contains: `entries` (map of date → MoodEntry), `reminder` (ReminderSettings), `workableDays` (set of ISO date strings for weekend days the user has marked workable).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A new user can log their first mood entry in under 10 seconds from opening the app.
- **SC-002**: All P1 screens (Today, Weekly, Monthly) display accurate mood data immediately after an entry is saved, with no manual refresh required.
- **SC-003**: The app remains fully functional with zero network connectivity (no data loads, no features degrade).
- **SC-004**: % good calculations are accurate to one decimal place across all screens for any combination of Good, Bad, and Off entries.
- **SC-005**: The app loads and is interactive in under 3 seconds on a mid-range mobile device on a 4G connection.
- **SC-006**: All five screens are accessible via navigation without more than one tap from any other screen.
- **SC-007**: The Insights screen correctly gates chart rendering and shows no charts when fewer than 5 days have been logged.
- **SC-008**: Clearing browser storage returns the app to a clean empty state with no visible errors.

## Clarifications

### Session 2026-04-19

- Q: Can users navigate to previous/next weeks on the Weekly screen and previous/next months on the Monthly screen? → A: Full navigation — back/forward arrows to browse any prior or future week or month without restriction.
- Q: Can users delete a mood entry to return a day to an unlogged state? → A: Yes — users can delete any entry within the 7-day edit window (same constraint as editing).
- Q: Is personal data export (download as file) in scope for v1? → A: Out of scope for v1 — explicitly deferred to a future version.
- Amendment: Workday definition confirmed — Mon–Fri by default, Monday is the first day of the week. Saturday and Sunday are non-workdays by default but can be marked workable on a per-week basis to accept mood entries and contribute to weekly stats.
- Q: Does the weekend workable-day restriction apply everywhere (all screens) or only on the Weekly screen? → A: Applies everywhere — a weekend day cannot accept any mood entry on any screen until marked workable; this resolves the conflict between FR-001 and FR-007b.
- Q: Should the reminder fire on a Saturday or Sunday that the user has marked workable for the current week? → A: Yes — reminder fires on workable weekend days in addition to the regular Mon–Fri schedule.
- Q: Can users navigate to previous/future calendar years on the Yearly screen? → A: Full navigation — back/forward controls to browse any calendar year without restriction.

## Assumptions

- Users are on modern mobile browsers (iOS Safari 15.4+, Android Chrome 90+); legacy browser polyfills are out of scope.
- The standard workweek runs Monday–Friday; Monday is the first day of the week. Saturday and Sunday are non-workdays by default. Users can override this per week by marking a specific weekend day as workable, but there is no global "always work weekends" setting.
- The app does not integrate with any calendar or HR system to determine actual working days.
- The 7-day edit window is measured in calendar days from the current device date, not working days.
- No multi-device sync is needed; data lives only in the single browser where the app is used.
- The app is a SPA served as static files; no server-side rendering or API is required.
- The reminder feature uses the standard Web Notifications API; in-app fallback (e.g., visual banner) for denied permissions is informational only.
- Navigation between screens uses a persistent bottom tab bar on mobile and may use a sidebar on wider screens.
- There is no onboarding flow for v1; the Today screen is the default landing screen.
- Personal data export (CSV/JSON download) is explicitly out of scope for v1 and deferred to a future version.
