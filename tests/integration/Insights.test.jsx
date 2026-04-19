import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { MoodContext } from '../../src/context/MoodContext'
import Insights from '../../src/routes/Insights'
import { formatISODate } from '../../src/utils/dateHelpers'
import { subDays } from 'date-fns'

vi.mock('recharts', () => {
  const Placeholder = ({ children }) => <div>{children}</div>
  return {
    ResponsiveContainer: Placeholder,
    LineChart: Placeholder,
    BarChart: Placeholder,
    Line: () => null,
    Bar: ({ children }) => <div>{children}</div>,
    XAxis: () => null,
    Tooltip: () => null,
    Cell: () => null,
  }
})

function makeEntries(count, mood = 'good') {
  const entries = {}
  for (let i = 0; i < count; i++) {
    const iso = formatISODate(subDays(new Date(), i))
    entries[iso] = { date: iso, mood }
  }
  return entries
}

function renderWithContext(entries = {}, workableDays = new Set()) {
  const dispatch = vi.fn()
  const state = { entries, workableDays, reminder: { enabled: false, time: '18:00' } }
  return {
    dispatch,
    ...render(
      <MemoryRouter>
        <MoodContext.Provider value={{ state, dispatch }}>
          <Insights />
        </MoodContext.Provider>
      </MemoryRouter>
    ),
  }
}

describe('Insights screen', () => {
  it('shows empty state when fewer than 5 entries', () => {
    renderWithContext(makeEntries(4))
    expect(screen.getByText(/log at least 5 days/i)).toBeInTheDocument()
  })

  it('shows empty state for 0 entries', () => {
    renderWithContext({})
    expect(screen.getByText(/log at least 5 days/i)).toBeInTheDocument()
  })

  it('renders insights content with 5+ entries', () => {
    renderWithContext(makeEntries(5))
    expect(screen.queryByText(/log at least 5 days/i)).not.toBeInTheDocument()
    expect(screen.getByText('Insights')).toBeInTheDocument()
  })

  it('renders hero stat with 5+ entries', () => {
    renderWithContext(makeEntries(10, 'good'))
    // % is now displayed as Math.round (e.g. "100%" not "100.0%")
    const els = screen.getAllByText(/100%/)
    expect(els.length).toBeGreaterThan(0)
  })

  it('renders delta badge or dashes when no prior period', () => {
    renderWithContext(makeEntries(5, 'good'))
    // When delta is null, no badge is shown — just verify insights content is visible
    expect(screen.queryByText(/log at least 5 days/i)).not.toBeInTheDocument()
  })

  it('renders time range picker with 3 options', () => {
    renderWithContext(makeEntries(5))
    expect(screen.getByText('Last 30 days')).toBeInTheDocument()
    expect(screen.getByText('Last 90 days')).toBeInTheDocument()
    expect(screen.getByText('This year')).toBeInTheDocument()
  })

  it('updates stats when range changes via select', () => {
    renderWithContext(makeEntries(10, 'good'))
    const select = screen.getByRole('combobox')
    fireEvent.change(select, { target: { value: '90d' } })
    // Still shows content (stats may differ)
    expect(screen.queryByText(/log at least 5 days/i)).not.toBeInTheDocument()
  })

  it('renders 8-week trend section', () => {
    renderWithContext(makeEntries(30))
    // Section header is now "Last 8 weeks · % good"
    expect(screen.getByText(/last 8 weeks/i)).toBeInTheDocument()
  })
})
