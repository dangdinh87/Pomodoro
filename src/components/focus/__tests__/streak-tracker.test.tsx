
import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import StreakTracker from '../streak-tracker'
import { toast } from 'sonner'
import { format, subDays } from 'date-fns'

// Mock sonner
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    info: jest.fn(),
  },
}))

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value.toString()
    }),
    clear: () => {
      store = {}
    },
  }
})()

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})

describe('StreakTracker', () => {
  beforeEach(() => {
    localStorageMock.clear()
    jest.clearAllMocks()
  })

  it('renders correctly and initializes empty state', async () => {
    render(<StreakTracker />)
    expect(screen.getByText('Streak Calendar')).toBeInTheDocument()
    // Wait for loading to finish
    await waitFor(() => expect(screen.queryByText('Loading...')).not.toBeInTheDocument())
    expect(screen.getByText(/Chuỗi hiện tại:/)).toHaveTextContent('0 ngày')
  })

  it('calculates streak correctly from localStorage', async () => {
    const today = format(new Date(), 'yyyy-MM-dd')
    const yesterday = format(subDays(new Date(), 1), 'yyyy-MM-dd')
    const data = {
      streak: 1,
      lastDateISO: yesterday,
      history: [yesterday, today]
    }

    localStorageMock.getItem.mockReturnValue(JSON.stringify(data))

    render(<StreakTracker />)

    await waitFor(() => {
      expect(screen.getByText(/Chuỗi hiện tại:/)).toHaveTextContent('2 ngày')
    })
  })

  it('handles marking today', async () => {
    render(<StreakTracker />)

    // Wait for component to load
    await waitFor(() => expect(screen.queryByText('Loading...')).not.toBeInTheDocument())

    const markButton = screen.getByText('+ Đánh dấu hôm nay')
    expect(markButton).toBeEnabled()

    fireEvent.click(markButton)

    await waitFor(() => {
      // Check if either success or info was called to debug
      const successCalled = (toast.success as jest.Mock).mock.calls.length > 0
      const infoCalled = (toast.info as jest.Mock).mock.calls.length > 0

      if (!successCalled && !infoCalled) {
        throw new Error('Neither toast.success nor toast.info was called')
      }

      expect(toast.success).toHaveBeenCalled()
    })

    expect(screen.getByText(/Chuỗi hiện tại:/)).toHaveTextContent('1 ngày')
    expect(localStorageMock.setItem).toHaveBeenCalled()
  })
})
