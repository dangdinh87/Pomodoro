/**
 * @jest-environment node
 */
import { GET } from './route';
import { createClient } from '@/lib/supabase-server';
import { NextResponse } from 'next/server';

// Mock dependencies
jest.mock('@/lib/supabase-server', () => ({
  createClient: jest.fn(),
}));

// Mock fetch
global.fetch = jest.fn();

describe('Chat Models API Route Security', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.MEGALLM_API_KEY = 'test-key';
  });

  it('should return 401 if user is not authenticated', async () => {
    // Mock unauthorized user
    (createClient as jest.Mock).mockResolvedValue({
      auth: {
        getUser: jest.fn().mockResolvedValue({
          data: { user: null },
          error: new Error('No session'),
        }),
      },
    });

    // Mock fetch to return success (so we know failure is due to our check, not upstream)
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ data: [] }),
    });

    const res = await GET();

    expect(res.status).toBe(401);

    // Ensure fetch was NOT called
    expect(global.fetch).not.toHaveBeenCalled();
  });
});
