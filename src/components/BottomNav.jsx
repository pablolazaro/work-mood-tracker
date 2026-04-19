import { NavLink, useLocation } from 'react-router-dom'

const LogIcon = () => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 20l2-7 10-10 3 3-10 10-5 2"/>
    <path d="M13 6l3 3"/>
  </svg>
)

const CalendarIcon = () => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="5" width="16" height="16" rx="2"/>
    <path d="M4 10h16M9 3v4M15 3v4"/>
  </svg>
)

const StatsIcon = () => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 19V10M10 19V4M16 19v-8M22 19H2"/>
  </svg>
)

const CALENDAR_PATHS = ['/weekly', '/monthly', '/yearly']

export default function BottomNav() {
  const { pathname } = useLocation()
  const isCalendarActive = CALENDAR_PATHS.includes(pathname)

  const tabClass = (active) =>
    [
      'flex flex-col items-center justify-center gap-1 font-sans text-[11px] font-medium tracking-[0.04em] cursor-default relative transition-colors',
      active ? 'text-ink' : 'text-muted',
    ].join(' ')

  const iconStroke = (active) => active ? '#2a241c' : '#9a8e79'

  return (
    <nav
      className="fixed bottom-4 left-4 right-4 z-10 bg-card rounded-[28px] grid"
      style={{
        gridTemplateColumns: 'repeat(3, 1fr)',
        height: '68px',
        boxShadow: '0 8px 24px -8px rgba(70,50,20,.15), 0 0 0 1px rgba(0,0,0,.04)',
      }}
    >
      <NavLink
        to="/today"
        className={({ isActive }) => tabClass(isActive)}
      >
        {({ isActive }) => (
          <>
            <span style={{ stroke: iconStroke(isActive) }}><LogIcon /></span>
            <span>Log</span>
            {isActive && <span className="absolute bottom-2.5 w-1.5 h-1.5 rounded-full bg-accent" />}
          </>
        )}
      </NavLink>

      <NavLink
        to="/weekly"
        className={() => tabClass(isCalendarActive)}
      >
        <span style={{ stroke: iconStroke(isCalendarActive) }}><CalendarIcon /></span>
        <span>Calendar</span>
        {isCalendarActive && <span className="absolute bottom-2.5 w-1.5 h-1.5 rounded-full bg-accent" />}
      </NavLink>

      <NavLink
        to="/insights"
        className={({ isActive }) => tabClass(isActive)}
      >
        {({ isActive }) => (
          <>
            <span style={{ stroke: iconStroke(isActive) }}><StatsIcon /></span>
            <span>Stats</span>
            {isActive && <span className="absolute bottom-2.5 w-1.5 h-1.5 rounded-full bg-accent" />}
          </>
        )}
      </NavLink>
    </nav>
  )
}
