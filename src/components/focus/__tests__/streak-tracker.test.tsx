import { render, screen, waitFor } from '@testing-library/react'
import StreakTracker from '../streak-tracker'
import { toast } from 'sonner'

// Mock toast
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    info: jest.fn(),
  },
}))

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
    localStorageMock.clear()
    jest.clearAllMocks()
  })

  it('renders correctly', async () => {
    render(<StreakTracker />)
    await waitFor(() => {
      expect(screen.getByText('Streak Calendar')).toBeInTheDocument()
    })
  })

  it('calculates streak correctly', async () => {
    // Setup local storage with some history
    const today = new Date().toISOString().split('T')[0]
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]

    const history = [yesterday, today]
    localStorageMock.getItem.mockReturnValue(JSON.stringify({
        streak: 2,
        lastDateISO: today,
        history: history
    }))

    render(<StreakTracker />)

    await waitFor(() => {
      // Find the element containing "Chuỗi hiện tại:" and check its content
      // The text is split into spans: "Chuỗi hiện tại: " and "2 ngày"
      expect(screen.getByText('2 ngày')).toBeInTheDocument()
    })
  })
})
