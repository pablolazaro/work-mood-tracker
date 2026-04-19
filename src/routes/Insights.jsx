import { useState } from 'react'
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  Tooltip as RechartsTooltip,
} from 'recharts'
import { format, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns'
import { useMoodData } from '../hooks/useMoodData'
import { useMoodContext } from '../context/MoodContext'
import { formatISODate } from '../utils/dateHelpers'

const RANGES = [
  { value: '30d',  label: 'Last 30 days' },
  { value: '90d',  label: 'Last 90 days' },
  { value: 'year', label: 'This year' },
]

const RANGE_LABELS = { '30d': 'Last 30 days', '90d': 'Last 90 days', year: 'This year' }

const DOW = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']

export default function Insights() {
  const { insightsStats, trendData, dowData } = useMoodData()
  const { state } = useMoodContext()
  const [range, setRange] = useState('30d')

  const stats = insightsStats(range)
  const totalLogged = Object.keys(stats.entries).length
  const trendPoints = trendData(new Date())
  const dowPoints = dowData(stats.entries)

  if (totalLogged < 5) {
    return (
      <div className="max-w-sm mx-auto px-4 pt-5">
        <div className="flex items-start justify-between px-1.5 pb-5">
          <div>
            <h1 className="font-serif text-[32px] font-medium leading-none tracking-[-0.025em] text-ink">Insights</h1>
            <p className="font-sans text-[13px] text-muted mt-1">{format(new Date(), 'MMMM yyyy')}</p>
          </div>
        </div>
        <div
          className="p-6 rounded-[20px] text-center"
          style={{ background: '#fffaf2', boxShadow: '0 0 0 1px #e2d8c5' }}
        >
          <p className="font-serif italic text-[17px] leading-[1.4]" style={{ color: '#5a4f41' }}>
            Log at least 5 days to see insights
          </p>
        </div>
      </div>
    )
  }

  const deltaVal = stats.delta
  const deltaPositive = deltaVal !== null && deltaVal >= 0
  const deltaDisplay = deltaVal === null
    ? null
    : deltaVal >= 0
      ? `↑ ${Math.abs(Math.round(deltaVal))}% vs. prior`
      : `↓ ${Math.abs(Math.round(deltaVal))}% vs. prior`

  const pctDisplay = stats.pctGood !== null ? Math.round(stats.pctGood) : '—'

  // Build "this month" day-by-day stripe
  const todayDate = new Date()
  const todayISO = formatISODate(todayDate)
  const monthStart = startOfMonth(todayDate)
  const monthEnd = endOfMonth(todayDate)
  const allMonthDays = eachDayOfInterval({ start: monthStart, end: monthEnd })
  const workMonthDays = allMonthDays.filter(d => {
    const dow = d.getDay()
    return dow !== 0 && dow !== 6
  })
  const stripeColors = {
    good: '#3f7d58', bad: '#b94a4a', off: '#c9b892', empty: '#e2d8c5',
  }

  const bestDow = dowPoints.reduce((best, p) => p.pctGood !== null && (best === null || p.pctGood > best.pctGood) ? p : best, null)
  const worstDow = dowPoints.reduce((worst, p) => p.pctGood !== null && (worst === null || p.pctGood < worst.pctGood) ? p : worst, null)

  return (
    <div className="max-w-sm mx-auto px-4 pt-5 space-y-0">
      {/* Header */}
      <div className="flex items-start justify-between px-1.5 pb-5">
        <div>
          <h1 className="font-serif text-[32px] font-medium leading-none tracking-[-0.025em] text-ink">Insights</h1>
          <p className="font-sans text-[13px] text-muted mt-1">{format(todayDate, 'MMMM yyyy')}</p>
        </div>
        <div className="relative">
          <select
            value={range}
            onChange={e => setRange(e.target.value)}
            className="appearance-none font-sans text-[12px] font-medium rounded-full px-3 py-1.5 pr-6 cursor-pointer"
            style={{ background: '#ece3d3', color: '#5a4f41', border: 'none', outline: 'none' }}
          >
            {RANGES.map(r => (
              <option key={r.value} value={r.value}>{r.label}</option>
            ))}
          </select>
          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] pointer-events-none" style={{ color: '#5a4f41' }}>▾</span>
        </div>
      </div>

      {/* % good hero */}
      <div className="px-1 pb-5">
        <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.14em] text-muted mb-1.5">
          Percent good
        </p>
        <div
          className="font-serif font-medium leading-[0.9] tracking-[-0.04em]"
          style={{ fontSize: '80px', color: '#3f7d58' }}
        >
          {pctDisplay}{stats.pctGood !== null && '%'}
        </div>
        {deltaDisplay && (
          <div
            className="inline-flex items-center gap-1 mt-2.5 px-2.5 py-1 rounded-full font-sans text-[13px] font-semibold"
            style={{
              background: deltaPositive ? '#dce8dc' : '#f1dcdb',
              color: deltaPositive ? '#3f7d58' : '#b94a4a',
            }}
          >
            {deltaDisplay}
          </div>
        )}
      </div>

      {/* This month stripe */}
      <div
        className="rounded-[20px] px-[18px] py-4 mb-3"
        style={{ background: '#fffaf2', boxShadow: '0 0 0 1px #e2d8c5' }}
      >
        <h4 className="font-sans text-[11px] font-semibold uppercase tracking-[0.14em] text-muted mb-3">
          This month, day by day
        </h4>
        <div className="flex gap-[3px]">
          {workMonthDays.map(d => {
            const iso = formatISODate(d)
            const e = state.entries[iso]
            const isFuture = iso > todayISO
            return (
              <div
                key={iso}
                className="flex-1 h-7 rounded-[4px]"
                style={{
                  background: isFuture ? stripeColors.empty : e ? stripeColors[e.mood] : stripeColors.empty,
                  opacity: isFuture ? 0.35 : 1,
                }}
              />
            )
          })}
        </div>
        <div className="flex justify-between font-sans text-[11px] text-muted mt-2 tracking-[0.04em]">
          <span>{format(monthStart, 'MMM d')}</span>
          <span>today →</span>
        </div>
      </div>

      {/* 8-week trend */}
      <div
        className="rounded-[20px] px-[18px] py-4 mb-3"
        style={{ background: '#fffaf2', boxShadow: '0 0 0 1px #e2d8c5' }}
      >
        <h4 className="font-sans text-[11px] font-semibold uppercase tracking-[0.14em] text-muted mb-3">
          Last 8 weeks · % good
        </h4>
        <ResponsiveContainer width="100%" height={120}>
          <LineChart data={trendPoints} margin={{ top: 8, right: 8, bottom: 0, left: -20 }}>
            <defs>
              <linearGradient id="trendArea" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3f7d58" stopOpacity={0.15} />
                <stop offset="100%" stopColor="#3f7d58" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="week"
              tick={{ fontSize: 10, fill: '#9a8e79', fontFamily: 'Inter, system-ui, sans-serif' }}
              tickFormatter={w => w.replace(/Week (\d+), \d+/, 'w$1')}
              axisLine={false}
              tickLine={false}
            />
            <RechartsTooltip
              contentStyle={{ fontFamily: 'Inter', fontSize: 12, borderRadius: 8, border: '1px solid #e2d8c5', background: '#fffaf2' }}
              formatter={v => v === null ? '—' : `${v.toFixed(1)}%`}
              labelFormatter={l => l}
            />
            <Line
              type="monotoneX"
              dataKey="pctGood"
              stroke="#3f7d58"
              strokeWidth={2.5}
              strokeLinecap="round"
              dot={(props) => {
                const { cx, cy, index } = props
                const isLast = index === trendPoints.length - 1
                return (
                  <circle
                    key={index}
                    cx={cx}
                    cy={cy}
                    r={isLast ? 5 : 3.5}
                    fill={isLast ? '#3f7d58' : '#fffaf2'}
                    stroke="#3f7d58"
                    strokeWidth={2}
                  />
                )
              }}
              connectNulls={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Day of week */}
      <div
        className="rounded-[20px] px-[18px] py-4"
        style={{ background: '#fffaf2', boxShadow: '0 0 0 1px #e2d8c5' }}
      >
        <h4 className="font-sans text-[11px] font-semibold uppercase tracking-[0.14em] text-muted mb-3">
          By day of week
        </h4>
        <div className="flex flex-col gap-2.5">
          {dowPoints.map((p) => {
            const isHi = bestDow && p.day === bestDow.day && p.pctGood !== null
            const isLo = worstDow && p.day === worstDow.day && p.pctGood !== null && (!bestDow || p.day !== bestDow.day)
            const barColor = isHi ? '#3f7d58' : isLo ? '#b94a4a' : '#dce8dc'
            const valColor = isHi ? '#3f7d58' : isLo ? '#b94a4a' : '#2a241c'
            const pct = p.pctGood !== null ? Math.round(p.pctGood) : null

            return (
              <div
                key={p.day}
                className="grid items-center gap-2.5"
                style={{ gridTemplateColumns: '32px 1fr 36px' }}
              >
                <span className="font-sans text-[12px] font-semibold uppercase tracking-[0.08em]" style={{ color: '#5a4f41' }}>
                  {p.day}
                </span>
                <div className="h-2.5 rounded-full overflow-hidden" style={{ background: '#e2d8c5' }}>
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: pct !== null ? `${pct}%` : '0%',
                      background: barColor,
                    }}
                  />
                </div>
                <span
                  className="font-serif text-[15px] font-medium text-right tracking-[-0.01em]"
                  style={{ color: valColor, textTransform: 'none' }}
                >
                  {pct !== null ? `${pct}%` : '—'}
                </span>
              </div>
            )
          })}
        </div>

        {bestDow && worstDow && bestDow.day !== worstDow.day && (
          <p
            className="font-serif italic font-normal text-[17px] leading-[1.4] tracking-[-0.005em] mt-4 pt-4"
            style={{ color: '#5a4f41', borderTop: '1px solid #e2d8c5' }}
          >
            Your <em className="italic" style={{ color: '#b05a35' }}>{worstDow.day}s</em> are hard.
            Your <em className="italic" style={{ color: '#b05a35' }}>{bestDow.day}s</em> are your best day of the week.
          </p>
        )}
      </div>
    </div>
  )
}
