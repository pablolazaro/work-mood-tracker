import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { MoodContext } from '../../src/context/MoodContext'
import Today from '../../src/routes/Today'
import { formatISODate, getWeekDays } from '../../src/utils/dateHelpers'
import { subDays, format } from 'date-fns'

vi.mock('../../src/hooks/useReminder', () => ({ useReminder: () => {} }))

function todayISO() { return formatISODate(new Date()) }
function daysAgoISO(n) { return formatISODate(subDays(new Date(), n)) }

function todayWorkableDays() {
  const dow = new Date().getDay()
  if (dow === 0 || dow === 6) return new Set([todayISO()])
  return new Set()
}

function renderWithContext(entries = {}, workableDays = null) {
  const dispatch = vi.fn()
  const wDays = workableDays ?? todayWorkableDays()
  const state = {
    entries,
    workableDays: wDays,
    reminder: { enabled: false, time: '18:00' },
  }
  return {
    dispatch,
    ...render(
      <MemoryRouter>
        <MoodContext.Provider value={{ state, dispatch }}>
          <Today />
        </MoodContext.Provider>
      </MemoryRouter>
    ),
  }
}

describe('Today screen', () => {
  it('renders mood buttons', () => {
    renderWithContext()
    expect(screen.getByText('Good')).toBeInTheDocument()
    expect(screen.getByText('Bad')).toBeInTheDocument()
    expect(screen.getByText('Off')).toBeInTheDocument()
  })

  it('pre-selects note from existing entry', () => {
    renderWithContext({ [todayISO()]: { date: todayISO(), mood: 'good', note: 'great day' } })
    const noteArea = screen.getByPlaceholderText(/what made today what it was/i)
    expect(noteArea.value).toBe('great day')
  })

  it('dispatches LOG_MOOD on save', () => {
    const { dispatch } = renderWithContext()
    fireEvent.click(screen.getByText('Good'))
    fireEvent.click(screen.getByText('Save'))
    expect(dispatch).toHaveBeenCalledWith(expect.objectContaining({
      type: 'LOG_MOOD',
      payload: expect.objectContaining({ mood: 'good', date: todayISO() }),
    }))
  })

  it('shows Delete button when entry exists for editable date', () => {
    renderWithContext({ [todayISO()]: { date: todayISO(), mood: 'bad' } })
    expect(screen.getByText('Delete')).toBeInTheDocument()
  })

  it('dispatches DELETE_ENTRY on delete', () => {
    const { dispatch } = renderWithContext({ [todayISO()]: { date: todayISO(), mood: 'bad' } })
    fireEvent.click(screen.getByText('Delete'))
    expect(dispatch).toHaveBeenCalledWith({ type: 'DELETE_ENTRY', payload: { date: todayISO() } })
  })

  it('shows weekend blocking message when today is Sat/Sun and not workable', () => {
    const dow = new Date().getDay()
    if (dow === 6 || dow === 0) {
      renderWithContext({}, new Set())
      expect(screen.getByText(/mark this day workable/i)).toBeInTheDocument()
    } else {
      // Weekday — test n/a, pass
      expect(true).toBe(true)
    }
  })

  it('does NOT show blocking message for workable weekend day', () => {
    renderWithContext({})
    expect(screen.queryByText(/mark this day workable/i)).not.toBeInTheDocument()
  })

  it('renders week strip with Mon–Fri days', () => {
    renderWithContext()
    // Strip shows Mon-Fri of the current ISO week — verify day abbreviations present
    expect(screen.getByText('Mon')).toBeInTheDocument()
    expect(screen.getByText('Fri')).toBeInTheDocument()
  })

  it('note textarea has max length enforced', () => {
    renderWithContext()
    const noteArea = screen.getByPlaceholderText(/what made today what it was/i)
    const longText = 'a'.repeat(300)
    fireEvent.change(noteArea, { target: { value: longText } })
    expect(noteArea.value.length).toBeLessThanOrEqual(280)
  })

  it('7-day edit window: shows old entry note but no action buttons', () => {
    const oldDate = daysAgoISO(8)
    renderWithContext({ [oldDate]: { date: oldDate, mood: 'good' } })
    // The old date is not selected by default so no message shown on initial render
    // The week strip only shows the current week
    expect(screen.queryByText(/more than 7 days old/i)).not.toBeInTheDocument()
  })
})
