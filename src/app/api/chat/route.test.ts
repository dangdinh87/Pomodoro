/**
 * @jest-environment node
 */
import { POST } from './route';
import { createClient } from '@/lib/supabase-server';
import { createUIMessageStream } from 'ai';
import { DEFAULT_CHAT_AI_MODEL, MAX_CHAT_MESSAGE_LENGTH } from '@/config/constants';

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
    global.fetch = jest.fn();
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

  it('should fallback to default model if invalid model is provided', async () => {
    // Mock authorized user
    (createClient as jest.Mock).mockResolvedValue({
        auth: {
            getUser: jest.fn().mockResolvedValue({
                data: { user: { id: 'test-user' } },
                error: null,
            }),
        },
        from: jest.fn().mockReturnValue({ // Mock Supabase queries if needed
            insert: jest.fn().mockReturnValue({ select: jest.fn().mockReturnValue({ single: jest.fn().mockResolvedValue({}) }) })
        })
    });

    let capturedExecute: any;
    (createUIMessageStream as jest.Mock).mockImplementation(({ execute }) => {
        capturedExecute = execute;
        return {};
    });

    global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        body: { getReader: () => ({ read: jest.fn().mockResolvedValue({ done: true }) }) }
    });

    const req = new Request('http://localhost:3000/api/chat', {
        method: 'POST',
        body: JSON.stringify({ messages: [], model: 'evil-model-v666' }),
    });

    await POST(req);

    // Run the captured execute function
    const writerMock = { write: jest.fn() };
    await capturedExecute({ writer: writerMock });

    // Verify fetch was called with default model
    expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('megallm.io'),
        expect.objectContaining({
            body: expect.stringContaining(DEFAULT_CHAT_AI_MODEL)
        })
    );
  });

  it('should truncate long user messages', async () => {
    // Mock authorized user
    (createClient as jest.Mock).mockResolvedValue({
        auth: {
            getUser: jest.fn().mockResolvedValue({
                data: { user: { id: 'test-user' } },
                error: null,
            }),
        },
        from: jest.fn().mockReturnValue({
            insert: jest.fn().mockReturnValue({ select: jest.fn().mockReturnValue({ single: jest.fn().mockResolvedValue({}) }) })
        })
    });

    let capturedExecute: any;
    (createUIMessageStream as jest.Mock).mockImplementation(({ execute }) => {
        capturedExecute = execute;
        return {};
    });

    global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        body: { getReader: () => ({ read: jest.fn().mockResolvedValue({ done: true }) }) }
    });

    const longMessage = 'a'.repeat(MAX_CHAT_MESSAGE_LENGTH + 100);
    const req = new Request('http://localhost:3000/api/chat', {
        method: 'POST',
        body: JSON.stringify({
            messages: [{ role: 'user', content: longMessage }]
        }),
    });

    await POST(req);

    // Run the captured execute function
    const writerMock = { write: jest.fn() };
    await capturedExecute({ writer: writerMock });

    // Verify fetch was called with truncated message
    // We expect multiple calls (one for title, one for chat).
    // We want the one where messages array has the system prompt (BRO_AI_SYSTEM_PROMPT, or just check length).
    const calls = (global.fetch as jest.Mock).mock.calls;

    // Find the call that is NOT for title generation (title gen has specific prompt structure)
    // Title gen: messages[0].content includes "Generate a short..."
    // Chat completion: messages[0] is system prompt.
    const chatCall = calls.find((args: any) => {
        const body = JSON.parse(args[1].body);
        return body.messages[0].role === 'system';
    });

    if (!chatCall) {
        throw new Error('Chat completion fetch call not found among ' + calls.length + ' calls');
    }

    const body = JSON.parse(chatCall[1].body);
    const userMsg = body.messages.find((m: any) => m.role === 'user');

    expect(userMsg.content.length).toBe(MAX_CHAT_MESSAGE_LENGTH);
    expect(userMsg.content).toBe('a'.repeat(MAX_CHAT_MESSAGE_LENGTH));
  });
});
