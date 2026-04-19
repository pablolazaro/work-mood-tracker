import { useState } from 'react'
import { format, addWeeks, subWeeks, getDay } from 'date-fns'
import { useNavigate } from 'react-router-dom'
import { useMoodContext } from '../context/MoodContext'
import { useMoodData } from '../hooks/useMoodData'
import { getWeekDays, formatISODate, getWeekLabel } from '../utils/dateHelpers'

const MOOD_DOT = {
  good: { bg: '#3f7d58' },
  bad:  { bg: '#b94a4a' },
  off:  { bg: '#c9b892' },
}

const DAY_ABBR = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

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

export default function Weekly() {
  const { dispatch, state } = useMoodContext()
  const { weekStats } = useMoodData()
  const [weekStart, setWeekStart] = useState(() => {
    const today = new Date()
    const days = getWeekDays(today)
    return days[0]
  })

  const todayISO = formatISODate(new Date())
  const weekDays = getWeekDays(weekStart)
  const stats = weekStats(weekStart)

  function goBack() { setWeekStart(d => subWeeks(d, 1)) }
  function goForward() { setWeekStart(d => addWeeks(d, 1)) }

  function toggleWorkable(iso) {
    dispatch({ type: 'TOGGLE_WORKABLE_DAY', payload: { date: iso } })
  }

  const weekLabel = getWeekLabel(weekStart)
  const dateRange = `${format(weekDays[0], 'MMM d')} – ${format(weekDays[6], 'MMM d, yyyy')}`

  const totalLogged = weekDays.filter(d => state.entries[formatISODate(d)]).length
  const workdayCount = weekDays.filter(d => {
    const dow = getDay(d)
    const isWeekend = dow === 0 || dow === 6
    return !isWeekend || state.workableDays.has(formatISODate(d))
  }).length

  const weekends = weekDays.filter(d => { const dow = getDay(d); return dow === 0 || dow === 6 })

  return (
    <div className="max-w-sm mx-auto px-4 pt-5">
      {/* Header */}
      <div className="flex items-start justify-between px-1.5 pb-5">
        <div>
          <h1 className="font-serif text-[28px] font-medium leading-none tracking-[-0.02em] text-ink">
            {weekLabel}
          </h1>
          <p className="font-sans text-[13px] text-muted mt-1 tracking-[0.01em]">{dateRange}</p>
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

      <CalendarViewSwitcher active="/weekly" />

      {/* % hero */}
      <div className="flex items-center justify-between px-1 pb-5">
        <div className="font-serif text-[44px] font-medium leading-none tracking-[-0.03em]" style={{ color: '#3f7d58' }}>
          {stats.pctGood !== null ? Math.round(stats.pctGood) : '—'}
          <span className="text-[20px] text-muted">%</span>
        </div>
        <div className="font-sans text-[13px] text-right leading-[1.4]" style={{ color: '#5a4f41' }}>
          <strong className="block font-semibold text-ink">
            {stats.pctGood === null
              ? 'No entries yet.'
              : stats.pctGood >= 60
              ? 'Good week.'
              : 'Tough week.'}
          </strong>
          {totalLogged} of {workdayCount} workdays<br />went well.
        </div>
      </div>

      {/* Day list */}
      <div className="flex flex-col gap-2.5">
        {weekDays.map((day, i) => {
          const iso = formatISODate(day)
          const entryData = state.entries[iso]
          const dow = getDay(day)
          const isWeekend = dow === 0 || dow === 6
          const isWorkable = !isWeekend || state.workableDays.has(iso)
          const isToday = iso === todayISO

          return (
            <div
              key={iso}
              className="grid items-center gap-3.5 rounded-[18px] px-4 py-3.5"
              style={{
                gridTemplateColumns: '46px 1fr 20px',
                background: isToday ? '#ece3d3' : '#fffaf2',
                boxShadow: isToday ? '0 0 0 1.5px #2a241c' : '0 0 0 1px #e2d8c5',
              }}
            >
              <div className="text-center">
                <div className="font-sans text-[10px] font-semibold uppercase tracking-[0.14em] text-muted mb-0.5">
                  {DAY_ABBR[i]}
                </div>
                <div className="font-serif text-[22px] font-medium leading-none tracking-[-0.01em] text-ink">
                  {format(day, 'd')}
                </div>
              </div>

              <div className="min-w-0">
                {entryData ? (
                  <p
                    className="font-serif font-normal text-[15px] leading-[1.4] tracking-[-0.005em] truncate"
                    style={{ color: '#5a4f41' }}
                  >
                    {entryData.note || <em className="italic text-muted">{entryData.mood}</em>}
                  </p>
                ) : (
                  <span className="font-sans text-[13px] italic text-muted">
                    {isWorkable ? 'Not logged' : 'Non-workday'}
                  </span>
                )}
              </div>

              {entryData ? (
                <span
                  className="w-5 h-5 rounded-full flex-shrink-0"
                  style={{ background: MOOD_DOT[entryData.mood].bg }}
                />
              ) : (
                <span
                  className="w-5 h-5 rounded-full flex-shrink-0"
                  style={{ border: '1.5px dashed #9a8e79' }}
                />
              )}
            </div>
          )
        })}
      </div>

      {/* Workable day toggles for weekends */}
      {weekends.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {weekends.map(day => {
            const iso = formatISODate(day)
            const isWorkable = state.workableDays.has(iso)
            return (
              <button
                key={iso}
                type="button"
                onClick={() => toggleWorkable(iso)}
                className="px-3 py-1.5 rounded-full font-sans text-xs transition-colors"
                style={{
                  background: isWorkable ? '#dce8dc' : '#ece3d3',
                  color: isWorkable ? '#3f7d58' : '#5a4f41',
                }}
              >
                {format(day, 'EEE')} · {isWorkable ? 'Workable' : 'Set workable'}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
