# Work Mood Tracker — Technical Requirements Document
---

## 1. Overview

A mobile-first Single Page Application (SPA) with no backend, no server, and no external database. All data lives in the user's browser. The application is built with React 18+, React Router, and Tailwind CSS.

| Property | Value |
|---|---|
| App type | Single Page Application (SPA) |
| Framework | React 18 + Vite |
| Styling | Tailwind CSS v3 |
| Routing | React Router v6 |
| State management | React Context + `useReducer` |
| Date handling | date-fns |
| Charts | Recharts |
| Target platforms | Mobile browsers (iOS Safari, Android Chrome), responsive desktop |

---

## 2. Technology Stack

### 2.1 Core Dependencies

| Package | Version | Purpose |
|---|---|---|
| `react` | ^18.3 | UI library |
| `react-dom` | ^18.3 | DOM rendering |
| `react-router-dom` | ^6.x | Client-side routing (5 screens) |
| `tailwindcss` | ^3.x | Utility-first CSS |
| `date-fns` | ^3.x | Date arithmetic, ISO week numbers, formatting |
| `recharts` | ^2.x | Trend line + day-of-week bar chart |
| `vite` | ^5.x | Build tool and dev server |

### 2.2 No-server Constraints

The following are explicitly out of scope for v1 and must not be introduced:

- No REST or GraphQL API calls
- No authentication or user accounts
- No push notification server (reminder handled via Web Notifications API, device-local only)
- No analytics or telemetry
- No third-party SDKs that phone home

---

## 3. Project Structure

```
src/
  main.jsx              — Vite entry point, wraps app in providers
  App.jsx               — Router, global layout shell
  routes/
    Today.jsx           — P1: mood selector + note + week strip
    Weekly.jsx          — P1: Mon–Fri list with notes
    Monthly.jsx         — P1: calendar grid + count chips
    Yearly.jsx          — P2: month-per-row heatmap
    Insights.jsx        — P2: % good hero, trend, day-of-week
  context/
    MoodContext.jsx     — Global state + dispatch + localStorage sync
  hooks/
    useMoodData.js      — Selectors: weekEntries, monthEntries, stats
    useReminder.js      — Web Notifications API wrapper
  utils/
    calculations.js     — percentGood(), weekLabel(), deltaVsPrior()
    storage.js          — localStorage read/write helpers
    dateHelpers.js      — ISO week, month grid generation
  components/           — Shared UI atoms (MoodButton, DotCell, etc.)
```


## 4. Design Tokens & Tailwind Config

Extend `tailwind.config.js` to codify the hi-fi palette:

```js
// tailwind.config.js
theme: {
  extend: {
    colors: {
      paper:        '#F5F0E8',  // warm background
      good:         '#2D6A4F',  // dark green
      'good-light': '#B7E4C7',
      bad:          '#C0392B',  // dark red
      'bad-light':  '#F5B7B1',
      off:          '#B8A99A',  // sand / muted
      accent:       '#C97B3F',  // warm amber (name highlight)
      ink:          '#1A1A1A',  // primary text
      muted:        '#888888',  // secondary text
    },
    fontFamily: {
      serif: ['Georgia', 'serif'],
      sans:  ['Inter', 'system-ui', 'sans-serif'],
    },
  },
},
```

### 4.1 Typography Scale

| Role | Tailwind class | Usage |
|---|---|---|
| Display / % hero | `font-serif text-5xl font-bold` | Large stat numbers (68%) |
| Screen title | `font-serif text-3xl font-bold` | Today, Week 16, April 2026 |
| Section label | `font-sans text-xs font-semibold tracking-widest uppercase text-muted` | THIS WEEK, A SHORT NOTE |
| Body | `font-sans text-sm` | Notes, list items |
| Caption | `font-sans text-xs text-muted` | Date numbers, subtitles |

### 4.2 Mobile-first Breakpoints

All screens are designed for a 390px base viewport (iPhone 14). Tailwind responsive prefixes are used only to improve layout on wider screens — default styles must be fully functional on mobile.

- **Base (mobile):** single-column full-bleed layout
- **`sm:` (640px+):** increase horizontal padding, `max-w-sm` centered card
- **`md:` (768px+):** optional sidebar navigation instead of bottom tabs

---


## 5. Browser Support

| Browser | Min version | Notes |
|---|---|---|
| iOS Safari | 15.4+ | |
| Android Chrome | 90+ | Full feature support |
| Chrome (desktop) | 90+ | Secondary target |
| Firefox (desktop) | 90+ | Secondary target |
| Samsung Internet | 14+ | |

