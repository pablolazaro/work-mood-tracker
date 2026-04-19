import { useState } from 'react'
import { format, addMonths, subMonths } from 'date-fns'
import { useNavigate } from 'react-router-dom'
import { useMoodContext } from '../context/MoodContext'
import { useMoodData } from '../hooks/useMoodData'
import { getMonthGrid, formatISODate } from '../utils/dateHelpers'

const WEEKDAY_HEADERS = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

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

function cellStyle(mood, isWeekend, isOut, isToday) {
  if (isOut) return { background: 'transparent', boxShadow: 'none' }
  if (isWeekend) return { background: '#ece3d3', boxShadow: 'none' }
  const base = '0 0 0 1px #e2d8c5'
  const todayOutline = '0 0 0 1.5px #2a241c'
  if (mood === 'good') return { background: '#dce8dc', boxShadow: isToday ? todayOutline : 'none' }
  if (mood === 'bad')  return { background: '#f1dcdb', boxShadow: isToday ? todayOutline : 'none' }
  if (mood === 'off')  return { background: '#ece3cb', boxShadow: isToday ? todayOutline : 'none' }
  return { background: '#fffaf2', boxShadow: isToday ? todayOutline : base }
}

function numColor(mood, isWeekend, isOut) {
  if (isOut)     return '#9a8e79'
  if (isWeekend) return '#9a8e79'
  if (mood === 'good') return '#3f7d58'
  if (mood === 'bad')  return '#b94a4a'
  if (mood === 'off')  return '#8a7a55'
  return '#2a241c'
}

const DOT_COLOR = { good: '#3f7d58', bad: '#b94a4a', off: '#c9b892' }

export default function Monthly() {
  const { state } = useMoodContext()
  const { monthCounts } = useMoodData()
  const [current, setCurrent] = useState(() => {
    const now = new Date()
    return { year: now.getFullYear(), month: now.getMonth() + 1 }
  })
  const [selectedDay, setSelectedDay] = useState(null)

  const todayISO = formatISODate(new Date())
  const { year, month } = current
  const { days, offset } = getMonthGrid(year, month)
  const counts = monthCounts(year, month)
  const monthDate = new Date(year, month - 1, 1)

  function goBack() {
    const d = subMonths(new Date(year, month - 1, 1), 1)
    setCurrent({ year: d.getFullYear(), month: d.getMonth() + 1 })
    setSelectedDay(null)
  }
  function goForward() {
    const d = addMonths(new Date(year, month - 1, 1), 1)
    setCurrent({ year: d.getFullYear(), month: d.getMonth() + 1 })
    setSelectedDay(null)
  }

  function handleCellClick(iso) {
    setSelectedDay(prev => prev === iso ? null : iso)
  }

  const selectedEntry = selectedDay ? state.entries[selectedDay] : null
  const totalWorkdays = days.filter(day => {
    const col = (offset + day.getDate() - 1) % 7
    return col < 5
  }).length
  const loggedWorkdays = days.filter(day => {
    const iso = formatISODate(day)
    const col = (offset + day.getDate() - 1) % 7
    return col < 5 && state.entries[iso]
  }).length

  return (
    <div className="max-w-sm mx-auto px-4 pt-5">
      {/* Header */}
      <div className="flex items-start justify-between px-1.5 pb-5">
        <div>
          <h1 className="font-serif text-[32px] font-medium leading-none tracking-[-0.025em] text-ink">
            {format(monthDate, 'MMMM yyyy')}
          </h1>
          <p className="font-sans text-[13px] text-muted mt-1 tracking-[0.01em]">
            {loggedWorkdays} of {totalWorkdays} workdays logged
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={goBack}
            className="w-9 h-9 rounded-full flex items-center justify-center text-[18px] text-ink bg-paper-2 hover:bg-hair transition-colors"
          >‹</button>
          <button
            type="button"
            onClick={goForward}
            className="w-9 h-9 rounded-full flex items-center justify-center text-[18px] text-ink bg-paper-2 hover:bg-hair transition-colors"
          >›</button>
        </div>
      </div>

      <CalendarViewSwitcher active="/monthly" />

      {/* % good + label row */}
      <div className="flex justify-between items-baseline px-1 pb-[18px]">
        <span className="font-sans text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
          This month
        </span>
        <span className="font-serif text-[22px] font-medium tracking-[-0.01em]" style={{ color: '#3f7d58' }}>
          {counts.good + counts.bad + counts.off > 0
            ? `${Math.round((counts.good / (counts.good + counts.bad + counts.off)) * 100)}% good`
            : '—'}
        </span>
      </div>

      {/* Day of week headers */}
      <div className="grid grid-cols-7 gap-1.5 px-0.5 pb-1.5">
        {WEEKDAY_HEADERS.map((h, i) => (
          <div key={i} className="text-center font-sans text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">
            {h}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1.5 px-0.5">
        {Array.from({ length: offset }).map((_, i) => (
          <div key={`pre-${i}`} className="aspect-square" />
        ))}
        {days.map(day => {
          const iso = formatISODate(day)
          const entry = state.entries[iso]
          const mood = entry?.mood ?? null
          const col = (offset + day.getDate() - 1) % 7
          const isWeekend = col >= 5
          const isToday = iso === todayISO
          const isOut = false

          const style = cellStyle(mood, isWeekend, isOut, isToday)
          const nColor = numColor(mood, isWeekend, isOut)

          return (
            <button
              key={iso}
              type="button"
              onClick={() => handleCellClick(iso)}
              className="aspect-square rounded-[12px] flex flex-col justify-between p-1.5 relative cursor-pointer"
              style={style}
            >
              <span
                className="font-serif text-[14px] font-medium leading-none"
                style={{ color: nColor, fontWeight: mood && !isWeekend ? 600 : 500 }}
              >
                {day.getDate()}
              </span>
              {mood && !isWeekend && (
                <span
                  className="w-2 h-2 rounded-full self-end"
                  style={{ background: DOT_COLOR[mood] }}
                />
              )}
            </button>
          )
        })}
      </div>

      {/* Selected day note */}
      {selectedDay && (
        <div
          className="mt-4 rounded-[18px] px-4 py-3.5"
          style={{ background: '#fffaf2', boxShadow: '0 0 0 1px #e2d8c5' }}
        >
          <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.14em] text-muted mb-1">
            {format(new Date(selectedDay + 'T00:00:00'), 'EEEE, MMMM d')}
          </p>
          {selectedEntry ? (
            <>
              <p className="font-serif font-medium text-[15px] capitalize" style={{ color: numColor(selectedEntry.mood, false, false) }}>
                {selectedEntry.mood}
              </p>
              {selectedEntry.note && (
                <p className="font-serif font-normal text-[15px] leading-[1.4] text-ink mt-1">
                  {selectedEntry.note}
                </p>
              )}
            </>
          ) : (
            <p className="font-sans text-sm italic text-muted">No entry for this day</p>
          )}
        </div>
      )}

      {/* Breakdown tiles */}
      <div className="mt-5 grid grid-cols-3 gap-2">
        {[
          { label: 'Good', count: counts.good, color: '#3f7d58' },
          { label: 'Bad',  count: counts.bad,  color: '#b94a4a' },
          { label: 'Off',  count: counts.off,  color: '#8a7a55' },
        ].map(({ label, count, color }) => (
          <div
            key={label}
            className="rounded-[16px] py-3.5 px-3 text-center"
            style={{ background: '#fffaf2', boxShadow: '0 0 0 1px #e2d8c5' }}
          >
            <div className="font-serif text-[26px] font-medium leading-none tracking-[-0.02em]" style={{ color }}>
              {count}
            </div>
            <div className="font-sans text-[10px] font-semibold uppercase tracking-[0.14em] text-muted mt-1">
              {label}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
