<!--
SYNC IMPACT REPORT
==================
Version change: (none) → 1.0.0 (initial ratification)

Modified principles: N/A (first version)

Added sections:
  - Core Principles (I–V)
  - Technology Constraints
  - Development Workflow
  - Governance

Removed sections: N/A

Templates requiring updates:
  - .specify/templates/plan-template.md  ✅ Constitution Check gates align with principles below
  - .specify/templates/spec-template.md  ✅ No mandatory section changes required
  - .specify/templates/tasks-template.md ✅ Task phases align with mobile-first + no-backend constraints

Deferred TODOs: none
-->

# Work Mood Tracker Constitution

## Core Principles

### I. No-Backend / Privacy-First

All application data MUST live exclusively in the user's browser via `localStorage`.
The application MUST NOT make REST or GraphQL API calls, introduce user accounts or
authentication, embed third-party SDKs that phone home, send analytics or telemetry,
or rely on any server-side service for v1.

The reminder feature MUST use the Web Notifications API (device-local only).
Notes are capped at 280 characters; no rich journaling scope creep.

**Rationale**: User trust and privacy are the product. No backend means no data breach
surface, no sign-up friction, and no infrastructure cost.

### II. Mobile-First UI

All screens MUST be designed for a 390 px base viewport (iPhone 14 reference).
Default styles MUST be fully functional on mobile without any responsive prefix.
Tailwind `sm:` / `md:` prefixes MAY only be used to improve wider-screen layouts,
never to fix broken mobile layouts.

The design token palette defined in `tailwind.config.js` (paper, good, bad, off,
accent, ink, muted) MUST be used for all colour decisions; ad-hoc hex values are
prohibited. Typography MUST follow the five-role scale (Display, Screen title,
Section label, Body, Caption) from the TRD §4.1.

**Rationale**: The primary audience is knowledge workers logging moods on their phone
during or after work. A desktop-first approach would degrade the core loop.

### III. Single Responsibility per Route Component

Each route file (`Today.jsx`, `Weekly.jsx`, `Monthly.jsx`, `Yearly.jsx`,
`Insights.jsx`) MUST own exactly one screen's layout and interaction. Business logic
MUST live in `hooks/` or `utils/`; data derivation MUST live in `useMoodData.js`
selectors; route components MUST remain presentational shells.

Shared UI atoms (e.g., `MoodButton`, `DotCell`) MUST live in `src/components/`.
No inline business logic, date arithmetic, or storage calls are permitted inside
route files.

**Rationale**: Keeps screens independently replaceable without cascading refactors and
makes the five screens testable in isolation.

### IV. Declarative State via Context + Reducer

All mood entries MUST flow through `MoodContext` (React Context + `useReducer`).
Components MUST read data through `useMoodData` selectors and dispatch changes via
context actions. Local component state is permitted only for ephemeral UI state
(e.g., textarea focus, animation flags) — never for persisted mood data.

`localStorage` reads/writes MUST be encapsulated in `utils/storage.js`; the context
is the sole caller.

**Rationale**: A single source of truth prevents stale reads across the five screens
and makes the persistence layer swappable without touching components.

### V. Simplicity & YAGNI (v1 Scope Lock)

The following are out of scope for v1 and MUST NOT be introduced:
- Team dashboards or manager visibility
- AI coaching or prescriptive recommendations
- Calendar or HR system integrations
- Server-side rendering or API routes
- Any dependency that requires a network call at runtime

Features not present in the PRD or TRD require explicit written approval before
implementation. The edit window for back-logging is exactly 7 days; no extensions.

**Rationale**: Scope creep in a no-backend SPA is hard to reverse once storage schemas
diverge from user data. A locked v1 scope protects data integrity and delivery pace.

## Technology Constraints

| Concern | Constraint |
|---|---|
| Framework | React 18 + Vite 5. No Next.js, Remix, or SSR frameworks. |
| Styling | Tailwind CSS v3 only. No CSS-in-JS, no Sass. |
| Routing | React Router v6. No file-based or server routing. |
| Date handling | date-fns v3. No moment.js, no Day.js, no native-only solutions. |
| Charts | Recharts v2. No D3 direct usage for chart rendering. |
| Storage | `localStorage` via `utils/storage.js`. No IndexedDB, cookies, or sessionStorage for mood data. |
| Browser support | iOS Safari 15.4+, Android Chrome 90+, Chrome/Firefox desktop 90+, Samsung Internet 14+. |
| Bundle | Vite default splitting. No manual chunking unless a Lighthouse score regression is measured. |

All dependencies MUST be pinned to the major versions listed in TRD §2.1.
Introducing a new runtime dependency requires updating this constitution.

## Development Workflow

- Features MUST be developed on dedicated branches (`###-feature-name` pattern).
- Each screen (route) constitutes a deliverable increment; P1 screens MUST ship before P2.
- The five-screen priority order is: Today → Weekly → Monthly (P1), then Yearly → Insights (P2).
- Calculations (`percentGood`, `weekLabel`, `deltaVsPrior`) MUST have unit tests before
  the dependent screen is considered complete.
- The Insights screen MUST enforce the 5-logged-days minimum before rendering any chart.
- Reminder notification logic MUST be feature-flagged off by default; the user opts in.
- All PRs touching `MoodContext.jsx` or `storage.js` MUST include a migration note if
  the `localStorage` schema changes.

## Governance

This constitution supersedes all other documented practices for the Work Mood Tracker.
Any amendment MUST:
1. Update this file with the revised principle or section.
2. Increment the version number following semantic versioning:
   - **MAJOR**: Principle removal, scope unlock (e.g., adding a backend).
   - **MINOR**: New principle or section, material expansion of existing guidance.
   - **PATCH**: Clarifications, wording fixes, non-semantic refinements.
3. Update `LAST_AMENDED_DATE` to the date of the change.
4. Propagate changes to affected templates under `.specify/templates/`.

All implementation plans MUST include a Constitution Check gate before Phase 0 research.
Complexity violations MUST be justified in the plan's Complexity Tracking table.

**Version**: 1.0.0 | **Ratified**: 2026-04-19 | **Last Amended**: 2026-04-19
