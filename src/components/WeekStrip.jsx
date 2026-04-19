import { formatISODate } from '../utils/dateHelpers'

const DAY_ABBR = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

const MOOD_BG = {
  good: 'bg-good',
  bad:  'bg-bad',
  off:  'bg-off',
}

export default function WeekStrip({ weekDays, entries, workableDays, selectedDate, onSelectDate }) {
  const todayISO = formatISODate(new Date())

  return (
    <div className="flex gap-1 justify-between">
      {weekDays.map((day, i) => {
        const iso = formatISODate(day)
        const entry = entries[iso]
        const isToday = iso === todayISO
        const isSelected = iso === selectedDate
        const isWeekend = i >= 5
        const isWorkable = !isWeekend || (workableDays && workableDays.has(iso))

        return (
          <button
            key={iso}
            type="button"
            onClick={() => onSelectDate && onSelectDate(iso)}
            className={[
              'flex flex-col items-center gap-1 flex-1 py-1 rounded-lg transition-colors',
              isSelected ? 'bg-accent/10' : '',
              isToday ? 'font-bold' : '',
            ].join(' ')}
          >
            <span className="font-sans text-xs text-muted">{DAY_ABBR[i]}</span>
            <div className={[
              'w-7 h-7 rounded-full flex items-center justify-center',
              entry ? MOOD_BG[entry.mood] : (isWorkable ? 'border border-muted/30 bg-paper' : 'bg-muted/10'),
              isToday ? 'ring-1 ring-accent' : '',
            ].join(' ')}>
              <span className={[
                'font-sans text-xs',
                entry ? 'text-white' : 'text-ink',
                !isWorkable ? 'opacity-40' : '',
              ].join(' ')}>
                {day.getDate()}
              </span>
            </div>
          </button>
        )
      })}
    </div>
  )
}
