import { useState } from 'react'
import { format, getDaysInMonth } from 'date-fns'
import { useNavigate } from 'react-router-dom'
import { useMoodContext } from '../context/MoodContext'
import { useMoodData } from '../hooks/useMoodData'
import { formatISODate } from '../utils/dateHelpers'

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
const CELL_COLORS = {
  good: '#3f7d58',
  bad:  '#b94a4a',
  off:  '#c9b892',
  empty:'#e2d8c5',
  future: 'transparent',
}

function CalendarViewSwitcher({ active }) {
  const navigate = useNavigate()
  const views = [
    { label: 'Week',  path: '/weekly' },
    { label: 'Month', path: '/monthly' },
    { label: 'Year',  path: '/yearly' },
  ]
  return (
    <div className="flex gap-1 mb-4">
      {views.map(({ label, path }) => {
        const isActive = path === active
        return (
          <button
            key={path}
            type="button"
            onClick={() => navigate(path)}
            className="flex-1 py-1.5 font-sans text-xs font-medium rounded-full transition-colors"
            style={{
              background: isActive ? '#2a241c' : '#ece3d3',
              color: isActive ? '#fffaf2' : '#5a4f41',
            }}
          >
            {label}
          </button>
        )
      })}
    </div>
  )
}

function getWorkdays(year, month) {
  const days = getDaysInMonth(new Date(year, month - 1, 1))
  const workdays = []
  for (let d = 1; d <= days; d++) {
    const date = new Date(year, month - 1, d)
    const dow = date.getDay()
    if (dow !== 0 && dow !== 6) workdays.push(date)
  }
  return workdays
}

export default function Yearly() {
  const { state } = useMoodContext()
  const { yearStats } = useMoodData()
  const [year, setYear] = useState(() => new Date().getFullYear())

  const stats = yearStats(year)
  const todayISO = formatISODate(new Date())
  const pctDisplay = stats.pctGood !== null ? Math.round(stats.pctGood) : '—'

  return (
    <div className="max-w-sm mx-auto px-4 pt-5">
      {/* Header */}
      <div className="flex items-start justify-between px-1.5 pb-5">
        <div>
          <h1 className="font-serif text-[32px] font-medium leading-none tracking-[-0.025em] text-ink">
            {year}
          </h1>
          <p className="font-sans text-[13px] text-muted mt-1 tracking-[0.01em]">Year at a glance</p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setYear(y => y - 1)}
            className="w-9 h-9 rounded-full flex items-center justify-center text-[18px] text-ink bg-paper-2 hover:bg-hair transition-colors"
          >‹</button>
          <button
            type="button"
            onClick={() => setYear(y => y + 1)}
            className="w-9 h-9 rounded-full flex items-center justify-center text-[18px] text-ink bg-paper-2 hover:bg-hair transition-colors"
          >›</button>
        </div>
      </div>

      <CalendarViewSwitcher active="/yearly" />

      {/* % hero */}
      <div className="flex items-baseline gap-1 px-1 pb-4">
        <span className="font-serif text-[56px] font-medium leading-none tracking-[-0.03em]" style={{ color: '#3f7d58' }}>
          {pctDisplay}
          {stats.pctGood !== null && '%'}
        </span>
        <span className="font-sans text-[13px] font-medium text-muted ml-1.5">
          · good YTD
        </span>
      </div>

      {/* Month rows */}
      <div className="flex flex-col gap-3.5 px-1">
        {MONTHS.map((mLabel, mIdx) => {
          const m = mIdx + 1
          const workdays = getWorkdays(year, m)
          const isCurrent = new Date().getFullYear() === year && new Date().getMonth() + 1 === m
          const isFuture = new Date().getFullYear() === year && m > new Date().getMonth() + 1

          let goodCount = 0
          let totalLogged = 0
          const cells = workdays.map(day => {
            const iso = formatISODate(day)
            const entry = state.entries[iso]
            const isFutureDay = iso > todayISO
            if (entry && !isFutureDay) {
              totalLogged++
              if (entry.mood === 'good') goodCount++
            }
            return { iso, mood: entry?.mood ?? null, isFutureDay }
          })

          const pct = totalLogged > 0 ? Math.round((goodCount / totalLogged) * 100) : null

          return (
            <div
              key={mLabel}
              className="grid items-center gap-2.5"
              style={{ gridTemplateColumns: '34px 1fr auto' }}
            >
              <span
                className="font-serif text-[14px] font-medium tracking-[-0.01em]"
                style={{ color: isCurrent ? '#b05a35' : '#5a4f41' }}
              >
                {mLabel}
              </span>
              <div className="grid gap-[3px]" style={{ gridTemplateColumns: `repeat(${Math.min(workdays.length, 23)}, 1fr)` }}>
                {cells.slice(0, 23).map(({ iso, mood, isFutureDay }) => (
                  <div
                    key={iso}
                    className="aspect-square rounded-[3px]"
                    style={{
                      background: isFuture || isFutureDay
                        ? 'transparent'
                        : mood
                        ? CELL_COLORS[mood]
                        : CELL_COLORS.empty,
                      boxShadow: isFuture || isFutureDay ? 'inset 0 0 0 1px #e2d8c5' : 'none',
                    }}
                  />
                ))}
              </div>
              <span
                className="font-serif text-[13px] font-medium min-w-[36px] text-right"
                style={{ color: '#5a4f41' }}
              >
                {isFuture ? '—' : pct !== null ? `${pct}%` : '—'}
              </span>
            </div>
          )
        })}
      </div>

      {/* Summary tiles */}
      <div className="mt-5 grid grid-cols-2 gap-2.5">
        <div
          className="rounded-[18px] p-4"
          style={{ background: '#fffaf2', boxShadow: '0 0 0 1px #e2d8c5' }}
        >
          <div className="font-serif text-[32px] font-medium leading-none tracking-[-0.02em]" style={{ color: '#3f7d58' }}>
            {stats.good}
          </div>
          <div className="font-sans text-[11px] font-semibold uppercase tracking-[0.14em] text-muted mt-1.5">
            Good days
          </div>
        </div>
        <div
          className="rounded-[18px] p-4"
          style={{ background: '#fffaf2', boxShadow: '0 0 0 1px #e2d8c5' }}
        >
          <div className="font-serif text-[32px] font-medium leading-none tracking-[-0.02em]" style={{ color: '#b94a4a' }}>
            {stats.bad}
          </div>
          <div className="font-sans text-[11px] font-semibold uppercase tracking-[0.14em] text-muted mt-1.5">
            Bad days
          </div>
        </div>
      </div>
    </div>
  )
}
