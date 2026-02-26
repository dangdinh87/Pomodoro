/// <reference types="jest" />
/**
 * @jest-environment node
 */
import { POST } from './route';
import { createClient } from '@/lib/supabase-server';

// Mock dependencies
jest.mock('@/lib/supabase-server', () => ({
  createClient: jest.fn(),
}));

jest.mock('ai', () => ({
  createUIMessageStream: jest.fn(),
  createUIMessageStreamResponse: jest.fn(() => new Response('Stream started', { status: 200 })),
}));

describe('Chat API Security (Prompt Injection)', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.MEGALLM_API_KEY = 'test-key';

    // Mock global fetch for MegaLLM API calls
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          choices: [{ message: { content: 'Generated Title' } }]
        }),
        body: {
          getReader: () => ({
            read: () => Promise.resolve({ done: true, value: new Uint8Array() }),
          }),
        },
      })
    ) as jest.Mock;
  });

  afterAll(() => {
    global.fetch = originalFetch;
  });

  it('should use structured messages for title generation to prevent prompt injection', async () => {
    // Mock authorized user and database interactions
    (createClient as jest.Mock).mockResolvedValue({
      auth: {
        getUser: jest.fn().mockResolvedValue({
          data: { user: { id: 'test-user' } },
          error: null,
        }),
      },
      from: jest.fn(() => ({
        insert: jest.fn(() => ({
          select: jest.fn(() => ({
            single: jest.fn().mockResolvedValue({
              data: { id: 'new-conv-id' },
              error: null
            })
          }))
        })),
        update: jest.fn(() => ({
          eq: jest.fn().mockResolvedValue({ error: null })
        }))
      }))
    });

    const req = new Request('http://localhost:3000/api/chat', {
      method: 'POST',
      body: JSON.stringify({
        messages: [{ role: 'user', content: 'test message' }],
        conversationId: null // Trigger new conversation logic -> generateTitle
      }),
    });

    await POST(req);

    // Verify fetch calls
    const fetchCalls = (global.fetch as jest.Mock).mock.calls;

    // Find the title generation call (the one with max_tokens: 20)
    // generateTitle uses max_tokens: 20 in the body
    const titleCall = fetchCalls.find(call => {
      try {
        const body = JSON.parse(call[1].body);
        return body.max_tokens === 20;
      } catch (e) {
        return false;
      }
    });

    expect(titleCall).toBeDefined();

    const requestBody = JSON.parse(titleCall[1].body);
    const messages = requestBody.messages;

    // Assert that we are using structured messages (system + user)
    // The vulnerable code uses 1 message (user role with interpolated content)
    // The secure code uses 2 messages (system role + user role)

    // Fails if vulnerability exists (length is 1)
    expect(messages.length).toBe(2);
    expect(messages[0].role).toBe('system');
    expect(messages[1].role).toBe('user');
    expect(messages[1].content).toContain('test message');
    // Instruction should be in system message
    expect(messages[0].content).toContain('Generate a short, concise title');
  });
});
