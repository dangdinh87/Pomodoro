import React from 'react'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import StreakTracker from './streak-tracker'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'

// Mock fetch
global.fetch = jest.fn()

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
})

const renderWithClient = (ui: React.ReactElement) => {
  return render(
    <QueryClientProvider client={queryClient}>
      {ui}
      <Toaster />
    </QueryClientProvider>
  )
}

describe('StreakTracker', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    queryClient.clear()
  })

  it('renders loading state initially', () => {
    (global.fetch as jest.Mock).mockImplementationOnce(() => new Promise(() => {})) // Never resolves
    renderWithClient(<StreakTracker />)
    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  it('renders streak data after fetch', async () => {
    const mockStats = {
      summary: {
        streak: {
          current: 5,
          longest: 10,
          last_session: new Date().toISOString() // Today
        }
      },
      dailyFocus: [
        { date: new Date().toISOString().split('T')[0], duration: 60 }
      ]
    }

    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockStats
    })

    renderWithClient(<StreakTracker />)

    await waitFor(() => {
      expect(screen.getByText('Streak Calendar')).toBeInTheDocument()
    })

    expect(screen.getByText('5 ngày')).toBeInTheDocument()
    // Button should be disabled because last_session is today
    const button = screen.getByText('+ Đánh dấu hôm nay')
    expect(button).toBeDisabled()
    expect(screen.getByText('Đã đánh dấu hôm nay')).toBeInTheDocument()
  })

  it('allows marking today if not marked', async () => {
     const yesterday = new Date()
     yesterday.setDate(yesterday.getDate() - 1)
     const yesterdayISO = yesterday.toISOString()

    const mockStats = {
      summary: {
        streak: {
          current: 5,
          longest: 10,
          last_session: yesterdayISO
        }
      },
      dailyFocus: []
    }

    // Mock GET stats
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockStats
    })

    renderWithClient(<StreakTracker />)

    await waitFor(() => {
      expect(screen.getByText('Streak Calendar')).toBeInTheDocument()
    })

    const button = screen.getByText('+ Đánh dấu hôm nay')
    expect(button).not.toBeDisabled()
    expect(screen.getByText('Đánh dấu một ngày tập trung')).toBeInTheDocument()

    // Mock POST session-complete
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ session: { id: '123' } })
    })

    // Mock GET stats refetch after mutation
    const mockStatsAfter = {
        ...mockStats,
        summary: {
            ...mockStats.summary,
            streak: {
                ...mockStats.summary.streak,
                current: 6,
                last_session: new Date().toISOString()
            }
        }
    }
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockStatsAfter
    })

    fireEvent.click(button)

    await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/tasks/session-complete', expect.objectContaining({
            method: 'POST'
        }))
    })

    // Should eventually show updated state (disabled button)
    // Note: React Query might not refetch immediately in test environment without waiting,
    // but the button state depends on fetched data.
    // We mocked the second fetch response.

    await waitFor(() => {
         // We expect the button to become disabled or text to change
         expect(screen.getByText('Đã đánh dấu hôm nay')).toBeInTheDocument()
    })
  })
})
