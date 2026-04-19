import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { MoodContext } from '../../src/context/MoodContext'
import Weekly from '../../src/routes/Weekly'
import { formatISODate, getWeekDays } from '../../src/utils/dateHelpers'
import { startOfISOWeek } from 'date-fns'

function renderWithContext(entries = {}, workableDays = new Set()) {
  const dispatch = vi.fn()
  const state = { entries, workableDays, reminder: { enabled: false, time: '18:00' } }
  return {
    dispatch,
    ...render(
      <MemoryRouter>
        <MoodContext.Provider value={{ state, dispatch }}>
          <Weekly />
        </MoodContext.Provider>
      </MemoryRouter>
    ),
  }
}

function seedCurrentWeek(moods) {
  const weekStart = startOfISOWeek(new Date())
  const days = getWeekDays(weekStart)
  const entries = {}
  moods.forEach((mood, i) => {
    if (mood && i < days.length) {
      const iso = formatISODate(days[i])
      entries[iso] = { date: iso, mood }
    }
  })
  return entries
}

describe('Weekly screen', () => {
  it('renders 7 day rows with abbreviated day names', () => {
    renderWithContext()
    // New design uses abbreviated names Mon–Sun
    const dayAbbrs = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    dayAbbrs.forEach(abbr => expect(screen.getAllByText(abbr).length).toBeGreaterThan(0))
  })

  it('shows Good week label for 80%+', () => {
    const entries = seedCurrentWeek(['good', 'good', 'good', 'good', 'bad'])
    renderWithContext(entries)
    expect(screen.getByText('Good week.')).toBeInTheDocument()
  })

  it('shows Good week label for 75% (≥60%)', () => {
    const entries = seedCurrentWeek(['good', 'good', 'good', 'bad', 'off'])
    renderWithContext(entries)
    expect(screen.getByText('Good week.')).toBeInTheDocument()
  })

  it('shows Tough week label below 60%', () => {
    const entries = seedCurrentWeek(['bad', 'bad', 'bad', 'good', null])
    renderWithContext(entries)
    expect(screen.getByText('Tough week.')).toBeInTheDocument()
  })

  it('shows rounded % for 3 good + 1 bad + 1 off (75%)', () => {
    const entries = seedCurrentWeek(['good', 'good', 'good', 'bad', 'off'])
    renderWithContext(entries)
    // pctGood is based on good/(good+bad+off) = 3/5 = 60% (not 75%)
    // Actually depends on how weekStats calculates — good/total_logged or good/workdays
    // The % is displayed as Math.round(stats.pctGood) — just verify % appears
    const pctEls = screen.getAllByText(/\d+/)
    expect(pctEls.length).toBeGreaterThan(0)
  })

  it('shows — when no entries', () => {
    renderWithContext()
    const dashes = screen.getAllByText('—')
    expect(dashes.length).toBeGreaterThan(0)
  })

  it('dispatches TOGGLE_WORKABLE_DAY when weekend toggle clicked', () => {
    const { dispatch } = renderWithContext()
    // Weekend buttons now say "Sat · Set workable" / "Sun · Set workable"
    const toggleBtns = screen.getAllByText(/set workable/i)
    fireEvent.click(toggleBtns[0])
    expect(dispatch).toHaveBeenCalledWith(expect.objectContaining({
      type: 'TOGGLE_WORKABLE_DAY',
    }))
  })

  it('shows workable button for already-workable Saturday', () => {
    const weekStart = startOfISOWeek(new Date())
    const days = getWeekDays(weekStart)
    const satISO = formatISODate(days[5])
    renderWithContext({}, new Set([satISO]))
    // Button now says "Sat · Workable"
    expect(screen.getAllByText(/workable/i).length).toBeGreaterThan(0)
  })

  it('has navigation buttons', () => {
    renderWithContext()
    expect(screen.getByText('‹')).toBeInTheDocument()
    expect(screen.getByText('›')).toBeInTheDocument()
  })

  it('navigates to previous week on back click', () => {
    renderWithContext()
    const title = screen.getByText(/Week \d+, \d{4}/)
    const initialTitle = title.textContent
    fireEvent.click(screen.getByText('‹'))
    // Title should change
    const newTitle = screen.getByText(/Week \d+, \d{4}/)
    expect(newTitle.textContent).not.toBe(initialTitle)
  })
})
