/**
 * @jest-environment node
 */
import { POST } from './route';
import { createClient } from '@/lib/supabase-server';

// Mock dependencies
jest.mock('@/lib/supabase-server', () => ({
  createClient: jest.fn(),
}));

// Mock ai package
jest.mock('ai', () => ({
  createUIMessageStream: jest.fn(),
  createUIMessageStreamResponse: jest.fn(() => new Response('Stream started', { status: 200 })),
}));

describe('Chat API Route Security', () => {
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

    const req = new Request('http://localhost:3000/api/chat', {
      method: 'POST',
      body: JSON.stringify({ messages: [] }),
    });

    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it('should return 400 if messages is not an array', async () => {
    // Mock authorized user
    (createClient as jest.Mock).mockResolvedValue({
      auth: {
        getUser: jest.fn().mockResolvedValue({
          data: { user: { id: 'test-user' } },
          error: null,
        }),
      },
    });

    const req = new Request('http://localhost:3000/api/chat', {
      method: 'POST',
      body: JSON.stringify({ messages: 'invalid' }),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it('should return 400 if model is invalid', async () => {
    // Mock authorized user
    (createClient as jest.Mock).mockResolvedValue({
      auth: {
        getUser: jest.fn().mockResolvedValue({
          data: { user: { id: 'test-user' } },
          error: null,
        }),
      },
    });

    const req = new Request('http://localhost:3000/api/chat', {
      method: 'POST',
      body: JSON.stringify({ messages: [], model: 'invalid-model' }),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
  });
});
