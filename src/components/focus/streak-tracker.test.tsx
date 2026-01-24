import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import StreakTracker, { calculateCurrentStreak } from './streak-tracker'
import { format, subDays, addDays } from 'date-fns'

// Mock sonner
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    info: jest.fn(),
    error: jest.fn(),
  },
}))

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString()
    },
    clear: () => {
      store = {}
    },
    removeItem: (key: string) => {
      delete store[key]
    },
  }
})()

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})

describe('calculateCurrentStreak', () => {
  const today = '2024-01-01'

  it('returns 0 if today is not in history', () => {
    const history = ['2023-12-31']
    expect(calculateCurrentStreak(history, today)).toBe(0)
  })

  it('returns 1 if only today is in history', () => {
    const history = ['2024-01-01']
    expect(calculateCurrentStreak(history, today)).toBe(1)
  })

  it('calculates streak correctly for consecutive days', () => {
    const history = ['2023-12-30', '2023-12-31', '2024-01-01']
    expect(calculateCurrentStreak(history, today)).toBe(3)
  })

  it('breaks streak on missing day', () => {
    const history = ['2023-12-28', '2023-12-30', '2023-12-31', '2024-01-01']
    expect(calculateCurrentStreak(history, today)).toBe(3)
  })

  it('handles unordered history', () => {
    const history = ['2024-01-01', '2023-12-30', '2023-12-31']
    expect(calculateCurrentStreak(history, today)).toBe(3)
  })
})

describe('StreakTracker Component', () => {
  beforeEach(() => {
    localStorage.clear()
    jest.clearAllMocks()
  })

  it('renders correctly with empty state', () => {
    render(<StreakTracker />)
    expect(screen.getByText(/Streak Calendar/i)).toBeInTheDocument()
    expect(screen.getByText('0 ngày')).toBeInTheDocument()
  })

  it('loads data from localStorage', async () => {
    const history = ['2024-01-01']
    localStorage.setItem('pomodoro-streak', JSON.stringify({
      streak: 1,
      lastDateISO: '2024-01-01',
      history
    }))

    // Mock today to match stored data
    // Since we can't easily mock the internal "todayISO" util without more changes,
    // we assume the test runs in an environment where we can't control system time easily
    // without using jest.useFakeTimers.
    // However, the component calls todayISO() which uses new Date().

    // Let's use real dates for the test to be robust
    const realToday = format(new Date(), 'yyyy-MM-dd')
    const realHistory = [realToday]
    localStorage.setItem('pomodoro-streak', JSON.stringify({
      streak: 1,
      lastDateISO: realToday,
      history: realHistory
    }))

    render(<StreakTracker />)

    await waitFor(() => {
        expect(screen.getByText('1 ngày')).toBeInTheDocument()
    })
  })
})
