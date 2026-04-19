import {
  eachDayOfInterval,
  startOfISOWeek,
  endOfISOWeek,
  startOfMonth,
  endOfMonth,
  getDay,
  format,
  differenceInCalendarDays,
  getISOWeek,
  getYear,
  eachMonthOfInterval,
  startOfYear,
  endOfYear,
  subWeeks,
} from 'date-fns'

export function getWeekDays(date) {
  return eachDayOfInterval({
    start: startOfISOWeek(date),
    end: endOfISOWeek(date),
  })
}

export function getMonthGrid(year, month) {
  const first = new Date(year, month - 1, 1)
  const days = eachDayOfInterval({ start: startOfMonth(first), end: endOfMonth(first) })
  // ISO: Mon=1…Sun=7; getDay returns Sun=0…Sat=6; convert to Mon-first offset
  const rawOffset = getDay(days[0]) // 0=Sun,1=Mon,...,6=Sat
  const offset = rawOffset === 0 ? 6 : rawOffset - 1
  return { days, offset }
}

export function getYearMonths(year) {
  const months = eachMonthOfInterval({
    start: startOfYear(new Date(year, 0, 1)),
    end: endOfYear(new Date(year, 0, 1)),
  })
  return months.map(m => ({
    month: m,
    days: eachDayOfInterval({ start: startOfMonth(m), end: endOfMonth(m) }),
  }))
}

export function formatISODate(date) {
  return format(date, 'yyyy-MM-dd')
}

export function isWithin7Days(isoDate) {
  const today = new Date()
  const entry = new Date(isoDate + 'T00:00:00')
  return differenceInCalendarDays(today, entry) <= 7
}

export function getWeekLabel(date) {
  const week = getISOWeek(date)
  const year = getYear(date)
  return `Week ${week}, ${year}`
}

export function getLast8ISOWeeks(today) {
  const thisWeekStart = startOfISOWeek(today)
  return Array.from({ length: 8 }, (_, i) => subWeeks(thisWeekStart, 8 - i))
}
