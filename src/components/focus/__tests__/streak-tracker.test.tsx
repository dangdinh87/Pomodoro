import React from 'react'
import { render, screen, act } from '@testing-library/react'
import StreakTracker from '../streak-tracker'
import { startOfMonth, subDays, format } from 'date-fns'

// Mock sonner
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    info: jest.fn(),
  },
}))

// Mock localStorage
const localStorageMock = (function () {
  let store: Record<string, string> = {}
  return {
    getItem(key: string) {
      return store[key] || null
    },
    setItem(key: string, value: string) {
      store[key] = value.toString()
    },
    clear() {
      store = {}
    },
  }
})()

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})

describe('StreakTracker Performance/Correctness', () => {
  beforeEach(() => {
    window.localStorage.clear()
    jest.clearAllMocks()
  })

  it('renders correctly with empty history', () => {
    render(<StreakTracker />)
    expect(screen.getByText('Streak Calendar')).toBeInTheDocument()
    expect(screen.getByText('Chuỗi hiện tại:')).toBeInTheDocument()
  })

  it('correctly calculates streak with large history', async () => {
    const today = new Date()
    const history: string[] = []

    // Create a 100-day streak ending yesterday
    for (let i = 1; i <= 100; i++) {
        history.push(format(subDays(today, i), 'yyyy-MM-dd'))
    }

    // Add today to make it 101
    history.push(format(today, 'yyyy-MM-dd'))

    // Add some random dates in the past to make the array larger (simulate 1 year usage)
    for (let i = 200; i < 500; i++) {
        history.push(format(subDays(today, i), 'yyyy-MM-dd'))
    }

    const initialData = {
      streak: 101,
      lastDateISO: format(today, 'yyyy-MM-dd'),
      history: history
    }

    window.localStorage.setItem('pomodoro-streak', JSON.stringify(initialData))

    await act(async () => {
      render(<StreakTracker />)
    })

    // The streak should be 101
    expect(screen.getByText('101 ngày')).toBeInTheDocument()

    // Verify month focused count (this month)
    // Roughly calculate how many days in current month are in history
    // Since we filled every day for last 100 days, all days in current month up to today should be focused.
    // This part is just to ensure grid renders correctly.
  })
})
