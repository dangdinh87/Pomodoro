import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import StreakTracker from './streak-tracker'
import { format, subDays } from 'date-fns'
import { toast } from 'sonner'

// Mock sonner
jest.mock('sonner', () => ({
  toast: {
    info: jest.fn(),
    success: jest.fn(),
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
    }
  }
})()

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})

describe('StreakTracker', () => {
  beforeEach(() => {
    localStorage.clear()
    jest.clearAllMocks()
  })

  it('renders correctly', () => {
    render(<StreakTracker />)
    expect(screen.getByText(/Streak Calendar/i)).toBeInTheDocument()
    expect(screen.getByText(/Chuỗi hiện tại:/i)).toBeInTheDocument()
  })

  it('calculates streak correctly', () => {
    const today = format(new Date(), 'yyyy-MM-dd')
    const yesterday = format(subDays(new Date(), 1), 'yyyy-MM-dd')
    const dayBeforeYesterday = format(subDays(new Date(), 2), 'yyyy-MM-dd')

    // Setup localStorage with a 2-day streak ending yesterday
    // Current logic requires today to be marked to show streak > 0
    const initialData = {
      streak: 0, // value in store doesn't strictly matter as it's recalculated
      lastDateISO: yesterday,
      history: [yesterday, dayBeforeYesterday]
    }
    localStorage.setItem('pomodoro-streak', JSON.stringify(initialData))

    render(<StreakTracker />)

    // Should show 0 because today is not marked
    // The component calculates currentStreak based on history + today
    // If today is not in history, it returns 0.
    const streakElement = screen.getByText((content, element) => {
      return element?.tagName.toLowerCase() === 'span' && content.includes('0 ngày')
    })
    expect(streakElement).toBeInTheDocument()

    // Mark today
    const button = screen.getByText(/\+ Đánh dấu hôm nay/i)
    fireEvent.click(button)

    // Should now show 3 days (today + yesterday + dayBefore)
    // Using regex to be more flexible
    expect(screen.getByText(/3 ngày/i)).toBeInTheDocument()

    // Check if toast was called
    expect(toast.success).toHaveBeenCalled()
  })

  it('handles broken streak correctly', () => {
    const today = format(new Date(), 'yyyy-MM-dd')
    // Gap of one day
    const threeDaysAgo = format(subDays(new Date(), 3), 'yyyy-MM-dd')

    const initialData = {
      streak: 0,
      lastDateISO: threeDaysAgo,
      history: [threeDaysAgo]
    }
    localStorage.setItem('pomodoro-streak', JSON.stringify(initialData))

    render(<StreakTracker />)

    // Mark today
    const button = screen.getByText(/\+ Đánh dấu hôm nay/i)
    fireEvent.click(button)

    // Should only be 1 day streak because of the gap
    expect(screen.getByText(/1 ngày/i)).toBeInTheDocument()
  })
})
