import { useMemo } from 'react'
import { useMoodContext } from '../context/MoodContext'
import { percentGood, weekLabel, deltaVsPrior } from '../utils/calculations'
import {
  getWeekDays,
  getMonthGrid,
  getYearMonths,
  formatISODate,
  isWithin7Days,
  getLast8ISOWeeks,
  getWeekLabel,
} from '../utils/dateHelpers'
import { getDay, subDays, startOfYear, endOfYear } from 'date-fns'

export function useMoodData() {
  const { state } = useMoodContext()
  const { entries, workableDays, reminder } = state

  return useMemo(() => {
    function getEntry(date) {
      return entries[date]
    }

    function canLog(date) {
      const d = new Date(date + 'T00:00:00')
      const dow = getDay(d) // 0=Sun,1=Mon,...,6=Sat
      if (dow !== 0 && dow !== 6) return true // weekday
      return workableDays.has(date)
    }

    function isEditable(date) {
      return isWithin7Days(date)
    }

    function isWorkableDay(date) {
      return workableDays.has(date)
    }

    function weekEntries(isoWeekStart) {
      const days = getWeekDays(isoWeekStart)
      return days
        .map(d => entries[formatISODate(d)])
        .filter(Boolean)
    }

    function weekStats(isoWeekStart) {
      const e = weekEntries(isoWeekStart)
      const pctGood = percentGood(e)
      return { pctGood, label: weekLabel(pctGood) }
    }

    function monthEntries(year, month) {
      const { days } = getMonthGrid(year, month)
      return days
        .map(d => entries[formatISODate(d)])
        .filter(Boolean)
    }

    function monthCounts(year, month) {
      const e = monthEntries(year, month)
      return {
        good: e.filter(x => x.mood === 'good').length,
        bad:  e.filter(x => x.mood === 'bad').length,
        off:  e.filter(x => x.mood === 'off').length,
      }
    }

    function yearEntries(year) {
      const months = getYearMonths(year)
      return months.flatMap(({ days }) =>
        days.map(d => entries[formatISODate(d)]).filter(Boolean)
      )
    }

    function yearStats(year) {
      const e = yearEntries(year)
      return {
        pctGood: percentGood(e),
        good: e.filter(x => x.mood === 'good').length,
        bad:  e.filter(x => x.mood === 'bad').length,
        off:  e.filter(x => x.mood === 'off').length,
      }
    }

    function trendData(endDate) {
      const weeks = getLast8ISOWeeks(endDate)
      return weeks.map(weekStart => {
        const e = weekEntries(weekStart)
        return {
          week: getWeekLabel(weekStart),
          pctGood: percentGood(e),
        }
      })
    }

    function dowData(rangeEntries) {
      const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']
      // 1=Mon…5=Fri
      const stats = dayNames.map((day, i) => {
        const dow = i + 1
        const dayEntries = rangeEntries.filter(e => {
          const d = new Date(e.date + 'T00:00:00')
          return getDay(d) === dow
        })
        return { day, pctGood: percentGood(dayEntries), isBest: false, isWorst: false }
      })

      const valid = stats.filter(s => s.pctGood !== null)
      if (valid.length > 0) {
        const max = Math.max(...valid.map(s => s.pctGood))
        const min = Math.min(...valid.map(s => s.pctGood))
        stats.forEach(s => {
          if (s.pctGood === max) s.isBest = true
          if (s.pctGood === min) s.isWorst = true
        })
      }
      return stats
    }

    function insightsStats(range) {
      const today = new Date()
      let start
      let priorStart
      let priorEnd

      if (range === '30d') {
        start = subDays(today, 30)
        priorStart = subDays(today, 60)
        priorEnd = subDays(today, 31)
      } else if (range === '90d') {
        start = subDays(today, 90)
        priorStart = subDays(today, 180)
        priorEnd = subDays(today, 91)
      } else {
        start = startOfYear(today)
        priorStart = startOfYear(new Date(today.getFullYear() - 1, 0, 1))
        priorEnd = endOfYear(new Date(today.getFullYear() - 1, 0, 1))
      }

      const allEntries = Object.values(entries)

      function inRange(entry, s, e) {
        const d = new Date(entry.date + 'T00:00:00')
        return d >= s && d <= e
      }

      const current = allEntries.filter(e => inRange(e, start, today))
      const prior = allEntries.filter(e => inRange(e, priorStart, priorEnd))

      const pctGoodCurrent = percentGood(current)
      const pctGoodPrior = percentGood(prior)

      return {
        pctGood: pctGoodCurrent,
        delta: deltaVsPrior(pctGoodCurrent, pctGoodPrior),
        entries: current,
      }
    }

    return {
      getEntry,
      canLog,
      isEditable,
      isWorkableDay,
      weekEntries,
      weekStats,
      monthEntries,
      monthCounts,
      yearEntries,
      yearStats,
      trendData,
      dowData,
      insightsStats,
      reminderSettings: reminder,
    }
  }, [entries, workableDays, reminder])
}
