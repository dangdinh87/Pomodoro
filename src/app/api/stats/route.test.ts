/**
 * @jest-environment node
 */
import { GET } from './route';
import { createClient } from '@/lib/supabase-server';

// Mock dependencies
jest.mock('@/lib/supabase-server');

describe('GET /api/stats', () => {
  const mockUser = { id: 'user-123' };
  let mockSupabase: any;

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup Supabase mock
    mockSupabase = {
      auth: {
        getUser: jest.fn().mockResolvedValue({ data: { user: mockUser }, error: null }),
      },
      from: jest.fn(),
    };

    (createClient as jest.Mock).mockResolvedValue(mockSupabase);
  });

  it('should return stats correctly and in parallel', async () => {
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    // Mock sessions query
    const mockSessions = [
      { duration: 1500, mode: 'work', created_at: '2024-01-01T10:00:00Z' },
      { duration: 300, mode: 'shortBreak', created_at: '2024-01-01T10:25:00Z' },
    ];

    // Chain for sessions: from -> select -> eq -> gte? -> lt? -> (await)
    const mockSessionChain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        gte: jest.fn().mockReturnThis(),
        lt: jest.fn().mockReturnThis(),
        then: jest.fn(async (callback) => {
            await delay(50); // Simulate DB latency
            return callback({ data: mockSessions, error: null });
        })
    };

    // Mock streaks query
    const mockStreak = { current: 5, longest: 10 };
    // Chain for streaks: from -> select -> eq -> single -> (await)
    const mockStreakChain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockReturnThis(),
        then: jest.fn(async (callback) => {
            await delay(50); // Simulate DB latency
            return callback({ data: mockStreak, error: null });
        })
    };

    mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'sessions') return mockSessionChain;
        if (table === 'streaks') return mockStreakChain;
        return { select: jest.fn().mockReturnThis() };
    });

    const req = new Request('http://localhost:3000/api/stats');

    const startTime = Date.now();
    const response = await GET(req);
    const endTime = Date.now();
    const duration = endTime - startTime;

    // Verify response
    const json = await response.json();
    expect(json.summary.totalFocusTime).toBe(1500);
    expect(json.summary.completedSessions).toBe(1);
    expect(json.summary.streak.current).toBe(5);

    // Parallel execution: max(sessions (50ms), streak (50ms)) approx 50ms.
    // Sequential would be approx 100ms.
    expect(duration).toBeLessThan(90);
  });
});
