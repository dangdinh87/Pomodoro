/**
 * @jest-environment node
 */
import { POST } from './route';
import { createClient } from '@/lib/supabase-server';
import { DEFAULT_CHAT_AI_MODEL } from '@/config/constants';

// Mock dependencies
jest.mock('@/lib/supabase-server', () => ({
  createClient: jest.fn(),
}));

// Mock ai package
jest.mock('ai', () => ({
  createUIMessageStream: jest.fn((config) => {
    // Execute the callback immediately to test fetch call if it exists
    if (config && config.execute) {
        config.execute({
            writer: {
                write: jest.fn(),
            },
        });
    }
    return {};
  }),
  createUIMessageStreamResponse: jest.fn(() => new Response('Stream started', { status: 200 })),
}));

// Mock global fetch
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: jest.fn().mockResolvedValue({ choices: [{ message: { content: 'Test Title' } }] }),
    body: {
      getReader: () => ({
        read: jest.fn().mockResolvedValue({ done: true, value: new Uint8Array() }),
      }),
    },
  })
) as jest.Mock;

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

  describe('Model Validation', () => {
    beforeEach(() => {
        // Mock authorized user for model tests
        (createClient as jest.Mock).mockResolvedValue({
            auth: {
              getUser: jest.fn().mockResolvedValue({
                data: { user: { id: 'test-user' } },
                error: null,
              }),
            },
            from: jest.fn(() => ({
              insert: jest.fn().mockReturnValue({ select: jest.fn().mockReturnValue({ single: jest.fn().mockResolvedValue({ data: { id: 'conv-id' }, error: null }) }) }),
              select: jest.fn().mockReturnValue({ single: jest.fn().mockResolvedValue({ data: { id: 'conv-id' }, error: null }) }),
              update: jest.fn().mockReturnValue({ eq: jest.fn().mockResolvedValue({ error: null }) }),
            })),
        });
    });

    it('should use default model when invalid model is provided', async () => {
        const req = new Request('http://localhost:3000/api/chat', {
          method: 'POST',
          body: JSON.stringify({
            messages: [{ role: 'user', content: 'Hello' }],
            model: 'invalid-model-v1',
          }),
        });

        await POST(req);

        // Verify fetch was called with the correct model
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('megallm.io'),
          expect.objectContaining({
            body: expect.stringContaining(DEFAULT_CHAT_AI_MODEL),
          })
        );

        // Verify it was NOT called with the invalid model
        expect(global.fetch).not.toHaveBeenCalledWith(
          expect.any(String),
          expect.objectContaining({
            body: expect.stringContaining('invalid-model-v1'),
          })
        );
      });

      it('should accept valid model', async () => {
        const req = new Request('http://localhost:3000/api/chat', {
          method: 'POST',
          body: JSON.stringify({
            messages: [{ role: 'user', content: 'Hello' }],
            model: DEFAULT_CHAT_AI_MODEL,
          }),
        });

        await POST(req);

        // Verify fetch was called with the correct model
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('megallm.io'),
          expect.objectContaining({
            body: expect.stringContaining(DEFAULT_CHAT_AI_MODEL),
          })
        );
      });
  });
});
