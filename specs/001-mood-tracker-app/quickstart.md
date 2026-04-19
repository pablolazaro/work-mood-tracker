# Quickstart: Work Mood Tracker App

**Phase**: 1 | **Date**: 2026-04-19 | **Plan**: [plan.md](plan.md)

---

## Prerequisites

- Node 20+
- npm 9+

---

## Bootstrap

```bash
# From repo root
npm create vite@latest . -- --template react
npm install react-router-dom date-fns recharts
npm install -D tailwindcss@3 postcss autoprefixer vitest @testing-library/react @testing-library/user-event jsdom

npx tailwindcss init -p
```

---

## Tailwind Config

Replace `tailwind.config.js` content:

```js
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        paper:        '#F5F0E8',
        good:         '#2D6A4F',
        'good-light': '#B7E4C7',
        bad:          '#C0392B',
        'bad-light':  '#F5B7B1',
        off:          '#B8A99A',
        accent:       '#C97B3F',
        ink:          '#1A1A1A',
        muted:        '#888888',
      },
      fontFamily: {
        serif: ['Georgia', 'serif'],
        sans:  ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
```

---

## Vitest Config

Add to `vite.config.js`:

```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './tests/setup.js',
  },
})
```

Create `tests/setup.js`:

```js
import '@testing-library/jest-dom'
```

---

## Dev Commands

```bash
npm run dev      # start Vite dev server (http://localhost:5173)
npm test         # run Vitest in watch mode
npm run build    # production build → dist/
npm run preview  # preview production build locally
```

---

## Build Order (delivery sequence)

Ship P1 screens before P2. Within P1, build in this order:

1. **Foundation** — `utils/storage.js`, `utils/calculations.js`, `utils/dateHelpers.js`, `context/MoodContext.jsx`, `hooks/useMoodData.js` + unit tests for calculations
2. **Shared atoms** — `MoodButton.jsx`, `DotCell.jsx`, `WeekStrip.jsx`, `CountChip.jsx`, `BottomNav.jsx`
3. **Today screen** (`routes/Today.jsx`) — mood selector + note + week strip
4. **Weekly screen** (`routes/Weekly.jsx`) — Mon–Sun list + week nav + workable-day toggle
5. **Monthly screen** (`routes/Monthly.jsx`) — calendar grid + count chips + month nav
6. **Yearly screen** (`routes/Yearly.jsx`) — heatmap + year nav *(P2)*
7. **Insights screen** (`routes/Insights.jsx`) — charts + time-range picker *(P2)*
8. **Reminder** (`hooks/useReminder.js`) — notification scheduling *(P2)*

---

## Key File Roles (quick reference)

| File | Owns |
|---|---|
| `context/MoodContext.jsx` | `useReducer` state, `localStorage` sync on every dispatch, `MoodContext.Provider` |
| `hooks/useMoodData.js` | All derived data selectors (week, month, year, insights stats) |
| `hooks/useReminder.js` | `setTimeout` scheduling, `Notification` API, `visibilitychange` listener |
| `utils/storage.js` | `load()`, `save()`, `clear()`, `DEFAULT_STATE` |
| `utils/calculations.js` | `percentGood()`, `weekLabel()`, `deltaVsPrior()`, `formatPctGood()` |
| `utils/dateHelpers.js` | ISO week grids, month grids, year grids using date-fns |

---

## Anatomy of a Screen Component

Route components are presentational shells. Follow this pattern:

```jsx
// routes/Today.jsx
import { useMoodData } from '../hooks/useMoodData'
import { useMoodContext } from '../context/MoodContext'
import MoodButton from '../components/MoodButton'

export default function Today() {
  const { dispatch } = useMoodContext()
  const { getEntry, canLog, isEditable, weekEntries } = useMoodData()

  // UI state only (no persisted data)
  const [noteText, setNoteText] = useState('')

  function handleMoodSelect(mood) {
    if (!canLog(today)) return
    dispatch({ type: 'LOG_MOOD', payload: { date: today, mood, note: noteText || undefined } })
  }

  return (
    // JSX only — no date-fns calls, no localStorage, no business logic
  )
}
```
