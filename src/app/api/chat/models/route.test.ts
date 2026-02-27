/**
 * @jest-environment node
 */
import { GET } from './route';
import { createClient } from '@/lib/supabase-server';

// Mock dependencies
jest.mock('@/lib/supabase-server', () => ({
  createClient: jest.fn(),
}));

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

    // This expectation should fail currently as the route is unprotected
    expect(res.status).toBe(401);
  });

  it('should return models if user is authenticated', async () => {
    // Mock authorized user
    (createClient as jest.Mock).mockResolvedValue({
      auth: {
        getUser: jest.fn().mockResolvedValue({
          data: { user: { id: 'test-user' } },
          error: null,
        }),
      },
    });

    // Mock successful fetch response from MegaLLM
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({
        data: [
          {
            id: 'gpt-4',
            object: 'model',
            owned_by: 'system',
          }
        ]
      }),
    });

    const res = await GET();
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.models).toHaveLength(1);
    expect(data.models[0].id).toBe('gpt-4');
  });
});
