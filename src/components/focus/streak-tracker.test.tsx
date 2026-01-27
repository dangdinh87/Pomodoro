import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import StreakTracker from './streak-tracker'
import { format } from 'date-fns'

// Mock toast
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

describe('StreakTracker', () => {
  beforeEach(() => {
    localStorage.clear()
    jest.clearAllMocks()
  })

  it('renders correctly with empty state', () => {
    render(<StreakTracker />)
    expect(screen.getByText(/Streak Calendar/)).toBeInTheDocument()
    // Check for parts of the text since it's split by spans
    expect(screen.getByText(/Chuỗi hiện tại:/)).toBeInTheDocument()
    expect(screen.getByText('0 ngày')).toBeInTheDocument()
    // "Đánh dấu hôm nay" button
    expect(screen.getByText('+ Đánh dấu hôm nay')).toBeInTheDocument()
  })

  it('loads state from localStorage', () => {
    const today = format(new Date(), 'yyyy-MM-dd')
    // Safe way to get yesterday
    const d = new Date()
    d.setDate(d.getDate() - 1)
    const yesterday = format(d, 'yyyy-MM-dd')

    const initialData = {
      streak: 2,
      lastDateISO: today,
      history: [yesterday, today],
    }
    localStorage.setItem('pomodoro-streak', JSON.stringify(initialData))

    render(<StreakTracker />)

    // Using regex because of the bold tag
    expect(screen.getByText('2 ngày')).toBeInTheDocument()

    // Button should be disabled/marked
    expect(screen.getByText('+ Đánh dấu hôm nay')).toBeDisabled()
  })

  it('handles "Mark Today" click', () => {
    render(<StreakTracker />)

    const button = screen.getByText('+ Đánh dấu hôm nay')
    expect(button).toBeEnabled()

    fireEvent.click(button)

    expect(screen.getByText('1 ngày')).toBeInTheDocument()
    expect(button).toBeDisabled()

    // Check if saved to localStorage
    const saved = JSON.parse(localStorage.getItem('pomodoro-streak') || '{}')
    const today = format(new Date(), 'yyyy-MM-dd')
    expect(saved.history).toContain(today)
    expect(saved.streak).toBe(1)
  })
})
