import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import StreakTracker from './streak-tracker'
import '@testing-library/jest-dom'

// Mock localStorage
const localStorageMock = (function() {
  let store: Record<string, string> = {}
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value.toString()
    }),
    clear: jest.fn(() => {
      store = {}
    })
  }
})()

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
})

// Mock sonner toast
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    info: jest.fn()
  }
}))

describe('StreakTracker', () => {
  beforeEach(() => {
    localStorageMock.clear()
    jest.clearAllMocks()
  })

  it('renders correctly', async () => {
    render(<StreakTracker />)

    // It should show loading initially or content if fast enough
    // In test environment, useEffect might run immediately or we wait
    await waitFor(() => {
        expect(screen.getByText('Streak Calendar')).toBeInTheDocument()
    })
  })

  it('can mark today as focused', async () => {
    render(<StreakTracker />)

    await waitFor(() => {
        expect(screen.getByText('Streak Calendar')).toBeInTheDocument()
    })

    const button = screen.getByText('+ Đánh dấu hôm nay')
    fireEvent.click(button)

    await waitFor(() => {
        expect(screen.getByText('Đã đánh dấu hôm nay')).toBeInTheDocument()
    })

    // Verify localStorage was updated
    expect(localStorageMock.setItem).toHaveBeenCalled()
  })

  it('calculates streak correctly', async () => {
    // Pre-populate localStorage with yesterday
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(today.getDate() - 1)
    const yesterdayISO = yesterday.toISOString().split('T')[0]

    const initialData = {
        streak: 1,
        lastDateISO: yesterdayISO,
        history: [yesterdayISO]
    }

    localStorageMock.getItem.mockReturnValue(JSON.stringify(initialData))

    render(<StreakTracker />)

    await waitFor(() => {
        expect(screen.getByText('Streak Calendar')).toBeInTheDocument()
    })

    // Should show 0 day streak initially (because today is not marked yet)
    expect(screen.getByText('0 ngày')).toBeInTheDocument()

    // Mark today
    const button = screen.getByText('+ Đánh dấu hôm nay')
    fireEvent.click(button)

    // Should update to 2 days
    await waitFor(() => {
        expect(screen.getByText('2 ngày')).toBeInTheDocument()
    })
  })
})
