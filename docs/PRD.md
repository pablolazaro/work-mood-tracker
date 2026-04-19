# Work Mood Tracker — PRD

---

## 1. Problem

People lack an objective record of how their workdays feel over time. Without data, it's hard to spot burnout signals, compare roles, or understand what's systematically making work better or worse.

---

## 2. Solution

A mobile-first app for logging daily work mood — good, bad, or off — with an optional short note. Users can review patterns across weekly, monthly, and yearly views, and surface insights like day-of-week trends and momentum over time.

> **Core loop:** one tap per day → patterns emerge over weeks → insights surface over months.

---

## 3. Goals & Non-Goals

**Goals**
- Log today's mood in under 10 seconds
- Show meaningful weekly, monthly, and yearly summaries
- Surface actionable insights (day-of-week trends, period-over-period deltas)
- Private by default — no sharing, no team views

**Non-goals**
- Team dashboards or manager visibility
- AI coaching or prescriptive recommendations
- Rich journaling (notes are capped at 280 chars)
- Calendar or HR system integrations (v1)

---

## 4. Target Users

Individual knowledge workers who want personal clarity on how their work life is trending — not accountability to anyone else. Key personas: reflective ICs, new joiners tracking onboarding, career-pivoters comparing roles.

---

## 5. Screens

| Screen | Summary | Priority |
|---|---|---|
| **Today** | Mood selector (Good / Bad / Off) + optional note + this-week strip | P1 |
| **Weekly** | Mon–Fri list with note previews, % good headline, week-quality label | P1 |
| **Monthly** | Calendar grid with colour-filled cells + Good / Bad / Off count chips | P1 |
| **Yearly** | Month-per-row dot heatmap + YTD % good + total good/bad days | P2 |
| **Insights** | % good hero, delta vs prior period, 8-week trend, day-of-week breakdown | P2 |

---

## 6. Core Feature Specs

### Mood logging
- **Three states:** Good · Bad · Off (Off covers PTO, sick days, non-work days)
- **Edit window:** Re-log up to 7 days back; within-day changes replace the entry
- **Note field:** Optional, max 280 characters
- **Reminder:** Optional push notification, user-set time (default 6 PM weekdays, off by default)

### Calculations
- **% good** = `good ÷ (good + bad) × 100` — Off days excluded from denominator
- **Week label:** ≥ 80% → "Good week" · 50–79% → "Mixed week" · < 50% → "Tough week"
- **Insights minimum:** 5 logged days required to render any chart

### Insights
- Time range picker: last 30 days · last 90 days · this year
- Delta badge: ↑ / ↓ percentage points vs prior equivalent period
- Day-of-week bar chart highlighting best and worst days
- 8-week % good trend line (one point per ISO week)