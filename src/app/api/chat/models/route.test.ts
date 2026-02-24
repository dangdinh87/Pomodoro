/**
 * @jest-environment node
 */
import { GET } from './route';
import { createClient } from '@/lib/supabase-server';

// Mock dependencies
jest.mock('@/lib/supabase-server', () => ({
  createClient: jest.fn(),
}));

// Mock NextResponse
jest.mock('next/server', () => {
    const actual = jest.requireActual('next/server');
    return {
        ...actual,
        NextResponse: {
            ...actual.NextResponse,
            json: jest.fn((body, init) => {
                return {
                    status: init?.status || 200,
                    json: async () => body,
                };
            }),
        },
    };
});

// Mock global fetch
global.fetch = jest.fn();

describe('Chat Models API Security', () => {
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

    const res = await GET();
    // Currently, the implementation does not check auth, so this is expected to FAIL until fixed.
    // It will likely return 200 (if fetch mock works) or 500 (if api key missing/fetch fails).
    // But we WANT it to be 401.
    expect(res.status).toBe(401);
  });

  it('should return 200 if user is authenticated', async () => {
      // Mock authorized user
      (createClient as jest.Mock).mockResolvedValue({
          auth: {
              getUser: jest.fn().mockResolvedValue({
                  data: { user: { id: 'test-user' } },
                  error: null,
              }),
          },
      });

      // Mock successful upstream API response
      (global.fetch as jest.Mock).mockResolvedValue({
          ok: true,
          json: async () => ({
              data: [
                  { id: 'gpt-4', object: 'model', owned_by: 'openai' }
              ]
          }),
      });

      const res = await GET();
      expect(res.status).toBe(200);
  });
});
