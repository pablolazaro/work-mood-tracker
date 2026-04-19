import { useEffect, useRef } from 'react'
import { useMoodData } from './useMoodData'
import { formatISODate } from '../utils/dateHelpers'
import { getDay, addDays } from 'date-fns'

function getNextFireMs(timeStr, today, isWorkableDay) {
  const [hours, minutes] = timeStr.split(':').map(Number)
  const now = new Date()

  function isEligible(d) {
    const dow = getDay(d)
    if (dow === 0 || dow === 6) return isWorkableDay(formatISODate(d))
    return true
  }

  // Try today first
  const todayFire = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes, 0, 0)
  if (todayFire > now && isEligible(today)) {
    return todayFire.getTime() - now.getTime()
  }

  // Find next eligible day
  let candidate = addDays(today, 1)
  for (let i = 0; i < 14; i++) {
    if (isEligible(candidate)) {
      const fire = new Date(candidate.getFullYear(), candidate.getMonth(), candidate.getDate(), hours, minutes, 0, 0)
      return fire.getTime() - now.getTime()
    }
    candidate = addDays(candidate, 1)
  }
  return null
}

export function useReminder() {
  const { reminderSettings, getEntry, isWorkableDay } = useMoodData()
  const timeoutRef = useRef(null)

  function schedule() {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }

    if (!reminderSettings.enabled) return
    if (typeof Notification === 'undefined') return
    if (Notification.permission !== 'granted') return

    const today = new Date()
    const ms = getNextFireMs(reminderSettings.time, today, isWorkableDay)
    if (ms === null) return

    timeoutRef.current = setTimeout(() => {
      const todayISO = formatISODate(new Date())
      if (!getEntry(todayISO)) {
        new Notification('Work Mood Tracker', {
          body: "Don't forget to log your mood for today!",
        })
      }
      // Reschedule for next day
      schedule()
    }, ms)
  }

  useEffect(() => {
    schedule()

    function handleVisibilityChange() {
      if (document.visibilityState === 'visible') schedule()
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [reminderSettings.enabled, reminderSettings.time])
}
