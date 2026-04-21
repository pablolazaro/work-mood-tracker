import { useState, useEffect } from 'react'
import { format, getISOWeek, addWeeks, subWeeks } from 'date-fns'
import { useMoodContext } from '../context/MoodContext'
import { useMoodData } from '../hooks/useMoodData'
import MoodButton from '../components/MoodButton'
import { formatISODate, getWeekDays, getWeekLabel } from '../utils/dateHelpers'

const MAX_NOTE = 280

const MOOD_DOT = {
  good: { bg: '#3f7d58' },
  bad:  { bg: '#b94a4a' },
  off:  { bg: '#c9b892' },
}

export default function Today() {
  const { dispatch } = useMoodContext()
  const { getEntry, canLog, isEditable, isWorkableDay } = useMoodData()
  const { state } = useMoodContext()

  const [weekStart, setWeekStart] = useState(() => getWeekDays(new Date())[0])
  const [selectedDate, setSelectedDate] = useState(() => formatISODate(new Date()))
  const [selectedMood, setSelectedMood] = useState(null)
  const [noteText, setNoteText] = useState('')
  const [showSettings, setShowSettings] = useState(false)
  const [reminderEnabled, setReminderEnabled] = useState(state.reminder.enabled)
  const [reminderTime, setReminderTime] = useState(state.reminder.time)

  const todayISO = formatISODate(new Date())
  const todayDate = new Date()
  const weekNum = getISOWeek(todayDate)

  const currentWeekStart = getWeekDays(new Date())[0]
  const isCurrentWeek = formatISODate(weekStart) === formatISODate(currentWeekStart)

  const weekDays = getWeekDays(weekStart)
  const workdayStrip = weekDays.slice(0, 5)

  useEffect(() => {
    const entry = getEntry(selectedDate)
    setSelectedMood(entry?.mood ?? null)
    setNoteText(entry?.note ?? '')
  }, [selectedDate, state.entries])

  const entry = getEntry(selectedDate)
  const canEditSelected = isEditable(selectedDate)
  const canLogSelected = canLog(selectedDate)
  const isWeekend = (() => {
    const d = new Date(selectedDate + 'T00:00:00')
    const dow = d.getDay()
    return dow === 0 || dow === 6
  })()
  const isBlockedWeekend = isWeekend && !isWorkableDay(selectedDate)

  function goBack() {
    const newStart = subWeeks(weekStart, 1)
    setWeekStart(newStart)
    setSelectedDate(formatISODate(newStart))
  }

  function goForward() {
    if (isCurrentWeek) return
    const newStart = addWeeks(weekStart, 1)
    const newIsCurrentWeek = formatISODate(newStart) === formatISODate(currentWeekStart)
    setWeekStart(newStart)
    setSelectedDate(newIsCurrentWeek ? todayISO : formatISODate(newStart))
  }

  function handleSave() {
    if (!selectedMood || !canLogSelected || !canEditSelected) return
    dispatch({
      type: 'LOG_MOOD',
      payload: { date: selectedDate, mood: selectedMood, note: noteText || undefined },
    })
  }

  function handleDelete() {
    if (!canEditSelected) return
    dispatch({ type: 'DELETE_ENTRY', payload: { date: selectedDate } })
  }

  function handleReminderToggle(e) {
    const enabled = e.target.checked
    if (enabled && Notification.permission !== 'granted') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          setReminderEnabled(true)
          dispatch({ type: 'SET_REMINDER', payload: { enabled: true, time: reminderTime } })
        } else {
          setReminderEnabled(false)
          dispatch({ type: 'SET_REMINDER', payload: { enabled: false } })
        }
      })
    } else {
      setReminderEnabled(enabled)
      dispatch({ type: 'SET_REMINDER', payload: { enabled, time: reminderTime } })
    }
  }

  function handleReminderTimeChange(e) {
    setReminderTime(e.target.value)
    dispatch({ type: 'SET_REMINDER', payload: { enabled: reminderEnabled, time: e.target.value } })
  }

  const loggedCount = workdayStrip.filter(d => state.entries[formatISODate(d)]).length

  const headerTitle = isCurrentWeek ? 'Today' : getWeekLabel(weekStart).replace(/, \d{4}$/, '')
  const headerSub = isCurrentWeek
    ? `${format(todayDate, 'EEE, MMM d')} · Week ${weekNum}`
    : `${format(weekStart, 'MMM d')} – ${format(workdayStrip[4], 'MMM d, yyyy')}`

  return (
    <div className="max-w-sm mx-auto px-4 pt-5 pb-4">
      {/* Header */}
      <div className="flex items-start justify-between px-1.5 pb-5">
        <div>
          <h1 className="font-serif text-[32px] font-medium leading-none tracking-[-0.025em] text-ink">{headerTitle}</h1>
          <p className="font-sans text-[13px] text-muted mt-1 tracking-[0.01em]">{headerSub}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={goBack}
            className="w-9 h-9 rounded-full flex items-center justify-center text-[18px] text-ink bg-paper-2 hover:bg-hair transition-colors"
          >‹</button>
          <button
            type="button"
            onClick={goForward}
            disabled={isCurrentWeek}
            className="w-9 h-9 rounded-full flex items-center justify-center text-[18px] text-ink bg-paper-2 hover:bg-hair transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >›</button>
          <button
            type="button"
            onClick={() => setShowSettings(s => !s)}
            className="w-9 h-9 rounded-full flex items-center justify-center text-[13px] text-muted bg-paper-2 hover:text-ink transition-colors"
            aria-label="Settings"
          >⚙</button>
        </div>
      </div>

      {/* Settings panel */}
      {showSettings && (
        <div className="mb-5 p-4 bg-card rounded-[20px] border border-hair space-y-3">
          <h2 className="font-sans font-semibold text-xs uppercase tracking-[0.14em] text-muted">Daily Reminder</h2>
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="reminder-toggle"
              checked={reminderEnabled}
              onChange={handleReminderToggle}
              className="w-4 h-4 accent-accent"
            />
            <label htmlFor="reminder-toggle" className="font-sans text-sm text-ink">
              Enable reminder
            </label>
          </div>
          {reminderEnabled && (
            <div className="flex items-center gap-3">
              <label className="font-sans text-sm text-muted">Time</label>
              <input
                type="time"
                value={reminderTime}
                onChange={handleReminderTimeChange}
                className="font-sans text-sm border border-hair rounded px-2 py-1"
              />
            </div>
          )}
        </div>
      )}

      {/* Greeting */}
      <p className="font-serif font-normal text-[28px] leading-[1.2] tracking-[-0.02em] text-ink px-1 pb-1">
        {isCurrentWeek
          ? <>How did work go <em className="italic" style={{ color: '#b05a35' }}>today</em>?</>
          : <>How did work go on <em className="italic" style={{ color: '#b05a35' }}>{format(new Date(selectedDate + 'T00:00:00'), 'EEEE')}</em>?</>
        }
      </p>
      <p className="font-sans text-[13px] text-muted uppercase tracking-[0.04em] px-1 pb-6">
        Tap one · you can change it later
      </p>

      {/* Blocked weekend */}
      {isBlockedWeekend && (
        <div className="mb-4 p-3 bg-paper-2 rounded-[18px]">
          <p className="font-sans text-sm text-muted text-center">
            Mark this day workable in the Weekly view to log your mood
          </p>
        </div>
      )}

      {/* Too old to edit */}
      {!canEditSelected && (
        <div className="mb-4 p-3 bg-paper-2 rounded-[18px]">
          <p className="font-sans text-sm text-muted text-center">
            This entry is more than 7 days old and can no longer be edited
          </p>
        </div>
      )}

      {/* Mood selector */}
      <div className="grid grid-cols-3 gap-2.5 mb-[22px]">
        {['good', 'bad', 'off'].map(mood => (
          <MoodButton
            key={mood}
            mood={mood}
            selected={selectedMood === mood}
            disabled={isBlockedWeekend || !canEditSelected}
            onClick={() => setSelectedMood(mood)}
          />
        ))}
      </div>

      {/* Note */}
      <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.14em] text-muted px-1 mb-2">
        A short note
      </p>
      <div
        className="mb-[22px] rounded-[18px] px-4 py-3.5"
        style={{ background: '#fffaf2', boxShadow: '0 0 0 1px #e2d8c5' }}
      >
        <textarea
          value={noteText}
          onChange={e => setNoteText(e.target.value.slice(0, MAX_NOTE))}
          disabled={isBlockedWeekend || !canEditSelected}
          placeholder="What made today what it was?"
          rows={3}
          className="w-full border-none bg-transparent outline-none resize-none font-serif font-normal text-[18px] leading-[1.5] tracking-[-0.005em] text-ink placeholder:text-muted placeholder:italic disabled:opacity-40 disabled:cursor-not-allowed"
        />
        <p className="font-sans text-xs text-muted text-right mt-1">
          {noteText.length}/{MAX_NOTE}
        </p>
      </div>

      {/* Action buttons */}
      {canEditSelected && !isBlockedWeekend && (
        <div className="flex gap-2 mb-6">
          <button
            type="button"
            onClick={handleSave}
            disabled={!selectedMood}
            className="flex-1 py-3 font-sans font-semibold text-sm rounded-[18px] transition-opacity disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90"
            style={{ background: '#b05a35', color: 'white' }}
          >
            {entry ? 'Update' : 'Save'}
          </button>
          {entry && (
            <button
              type="button"
              onClick={handleDelete}
              className="px-4 py-3 font-sans font-semibold text-sm rounded-[18px] transition-colors"
              style={{ background: '#f1dcdb', color: '#b94a4a' }}
            >
              Delete
            </button>
          )}
        </div>
      )}

      {/* Week strip */}
      <div>
        <div className="flex justify-between items-center px-1 mb-2.5">
          <span className="font-sans text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
            {isCurrentWeek ? 'This week' : getWeekLabel(weekStart).replace(/, \d{4}$/, '')}
          </span>
          <span className="font-sans text-[12px] font-medium text-ink-2">
            {loggedCount} of 5 logged
          </span>
        </div>
        <div className="grid grid-cols-5 gap-2">
          {workdayStrip.map(day => {
            const iso = formatISODate(day)
            const dayEntry = state.entries[iso]
            const isToday = iso === todayISO
            const isSelected = iso === selectedDate
            return (
              <button
                key={iso}
                type="button"
                onClick={() => setSelectedDate(iso)}
                className="flex flex-col items-center gap-2 py-2.5 rounded-[14px] transition-colors"
                style={{
                  background: isToday ? '#ece3d3' : '#fffaf2',
                  boxShadow: isSelected
                    ? '0 0 0 1.5px #2a241c'
                    : isToday
                    ? '0 0 0 1.5px #2a241c'
                    : '0 0 0 1px #e2d8c5',
                }}
              >
                <span className="font-sans text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">
                  {format(day, 'EEE')}
                </span>
                <span className="font-serif text-[18px] font-medium leading-none tracking-[-0.01em] text-ink">
                  {format(day, 'd')}
                </span>
                {dayEntry ? (
                  <span
                    className="w-3.5 h-3.5 rounded-full"
                    style={{ background: MOOD_DOT[dayEntry.mood].bg }}
                  />
                ) : (
                  <span
                    className="w-3.5 h-3.5 rounded-full"
                    style={{ border: '1.5px dashed #9a8e79' }}
                  />
                )}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
