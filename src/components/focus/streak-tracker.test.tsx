import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import StreakTracker from './streak-tracker'
import { toast } from 'sonner'
import { format } from 'date-fns'

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
  beforeEach(() => {
    window.localStorage.clear()
    jest.clearAllMocks()
  })

  it('renders correctly with empty state', async () => {
    render(<StreakTracker />)

    expect(await screen.findByText('Streak Calendar')).toBeInTheDocument()
    expect(screen.getByText('Chuỗi hiện tại:')).toBeInTheDocument()
    expect(screen.getByText('0 ngày')).toBeInTheDocument()
  })

  it('loads data from localStorage', async () => {
    const today = format(new Date(), 'yyyy-MM-dd')
    const history = [today]
    window.localStorage.setItem('pomodoro-streak', JSON.stringify({
      streak: 1,
      lastDateISO: today,
      history
    }))

    render(<StreakTracker />)

    expect(await screen.findByText('1 ngày')).toBeInTheDocument()
    expect(screen.getByText('Đã đánh dấu hôm nay')).toBeInTheDocument()
  })

  it('allows marking today', async () => {
    render(<StreakTracker />)

    expect(await screen.findByText('Streak Calendar')).toBeInTheDocument()

    const markButton = screen.getByRole('button', { name: /\+ Đánh dấu hôm nay/i })
    fireEvent.click(markButton)

    expect(toast.success).toHaveBeenCalled()
    expect(await screen.findByText('1 ngày')).toBeInTheDocument()
    expect(window.localStorage.setItem).toHaveBeenCalled()
  })
})
