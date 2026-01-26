import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import StreakTracker from './streak-tracker'
import { toast } from 'sonner'
import { format, subDays } from 'date-fns'

// Mock sonner
jest.mock('sonner', () => ({
  toast: {
    info: jest.fn(),
    success: jest.fn(),
  },
}))

// Mock localStorage
const localStorageMock = (function () {
  let store: Record<string, string> = {}
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value.toString()
    }),
    clear: jest.fn(() => {
      store = {}
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key]
    }),
  }
})()

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})

describe('StreakTracker', () => {
  const today = new Date()
  const todayISO = format(today, 'yyyy-MM-dd')

  beforeEach(() => {
    jest.clearAllMocks()
    localStorageMock.clear()
  })

  it('renders correctly with empty state', async () => {
    render(<StreakTracker />)

    // Wait for hydration
    await waitFor(() => {
      expect(screen.getByText('Streak Calendar')).toBeInTheDocument()
    })

    // Initial streak should be 0
    // We look for the text containing "0 ngày" within the streak display
    const streakDisplay = screen.getByText((content, element) => {
      return element?.textContent === '0 ngày' && element?.tagName === 'SPAN'
    })
    expect(streakDisplay).toBeInTheDocument()
  })

  it('loads history from localStorage', async () => {
    const yesterday = subDays(today, 1)
    const yesterdayISO = format(yesterday, 'yyyy-MM-dd')

    // Setup existing data
    const initialData = {
      streak: 1,
      lastDateISO: yesterdayISO,
      history: [yesterdayISO] // Only yesterday marked
    }

    localStorageMock.setItem('pomodoro-streak', JSON.stringify(initialData))

    render(<StreakTracker />)

    await waitFor(() => {
      expect(screen.getByText('Streak Calendar')).toBeInTheDocument()
    })

    // Since today is NOT marked, streak should be 0 based on current implementation
    const streakDisplay = screen.getByText((content, element) => {
      return element?.textContent === '0 ngày' && element?.tagName === 'SPAN'
    })
    expect(streakDisplay).toBeInTheDocument()
  })

  it('calculates streak correctly when today is marked', async () => {
    const yesterday = subDays(today, 1)
    const yesterdayISO = format(yesterday, 'yyyy-MM-dd')

    // Setup existing data including today and yesterday
    const initialData = {
      streak: 0, // Will be recalculated
      lastDateISO: todayISO,
      history: [yesterdayISO, todayISO]
    }

    localStorageMock.setItem('pomodoro-streak', JSON.stringify(initialData))

    render(<StreakTracker />)

    await waitFor(() => {
      expect(screen.getByText('Streak Calendar')).toBeInTheDocument()
    })

    // Streak should be 2
    const streakDisplay = screen.getByText((content, element) => {
      return element?.textContent === '2 ngày' && element?.tagName === 'SPAN'
    })
    expect(streakDisplay).toBeInTheDocument()
  })

  it('updates streak when marking today', async () => {
    render(<StreakTracker />)

    await waitFor(() => {
      expect(screen.getByText('Streak Calendar')).toBeInTheDocument()
    })

    const button = screen.getByRole('button', { name: /\+ Đánh dấu hôm nay/i })
    fireEvent.click(button)

    expect(toast.success).toHaveBeenCalled()

    // Streak should become 1
    const streakDisplay = await screen.findByText((content, element) => {
      return element?.textContent === '1 ngày' && element?.tagName === 'SPAN'
    })
    expect(streakDisplay).toBeInTheDocument()

    // Button should be disabled
    expect(button).toBeDisabled()
    expect(screen.getByText('Đã đánh dấu hôm nay')).toBeInTheDocument()

    // LocalStorage should be updated
    expect(localStorageMock.setItem).toHaveBeenCalled()
    // Get the last call
    const lastCall = localStorageMock.setItem.mock.calls[localStorageMock.setItem.mock.calls.length - 1]
    const storedData = JSON.parse(lastCall[1])
    expect(storedData.history).toContain(todayISO)
  })
})
