/**
 * @jest-environment node
 */
import { GET } from './route';
import { createClient } from '@/lib/supabase-server';

// Mock dependencies
jest.mock('@/lib/supabase-server', () => ({
  createClient: jest.fn(),
}));

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

    const res = await GET();
    expect(res.status).toBe(401);

    const json = await res.json();
    expect(json).toEqual({ error: 'Unauthorized' });
  });

  it('should proceed if user is authenticated (mocking fetch to prevent actual call)', async () => {
    // Mock authorized user
    (createClient as jest.Mock).mockResolvedValue({
      auth: {
        getUser: jest.fn().mockResolvedValue({
          data: { user: { id: 'test-user' } },
          error: null,
        }),
      },
    });

    // Mock global fetch to return a dummy response
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({
        object: "list",
        data: [
          {
            id: "gpt-4",
            object: "model",
            owned_by: "openai"
          }
        ]
      })
    });

    const res = await GET();
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json).toHaveProperty('models');
    expect(json.models.length).toBe(1);
    expect(json.models[0].id).toBe('gpt-4');
  });
});
