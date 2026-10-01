/**
 * @jest-environment node
 */
import { POST } from './route';
import { createClient } from '@/lib/supabase-server';
import { resetRateLimitsForTests } from '@/lib/api/in-memory-rate-limiter';
import { createSupabaseMock, jsonRequest } from '@/test-utils/supabase-mock';
import { FEEDBACK_MESSAGE_MAX_LENGTH, validateFeedback } from './feedback-schema';

jest.mock('@/lib/supabase-server', () => ({ createClient: jest.fn() }));

const URL = 'http://localhost:3000/api/feedback';
const VALID = { type: 'bug', message: 'Timer froze', rating: 4 };

const post = (body: unknown, ip = '203.0.113.1') =>
  POST(jsonRequest(URL, body, { headers: { 'x-forwarded-for': ip } }));

describe('validateFeedback', () => {
  it.each([
    [{ ...VALID, message: '' }, 'Message is required'],
    [{ ...VALID, message: 42 }, 'Message is required'],
    [{ ...VALID, message: 'x'.repeat(FEEDBACK_MESSAGE_MAX_LENGTH + 1) }, 'Message must be at most'],
    [{ ...VALID, type: 'spam' }, 'Invalid feedback type'],
    [{ ...VALID, rating: 4.5 }, 'Rating must be between 1 and 5'],
    [{ ...VALID, rating: '5' }, 'Rating must be between 1 and 5'],
    [{ ...VALID, email: 'not-an-email' }, 'Email is invalid'],
    [{ ...VALID, name: 'n'.repeat(101) }, 'Name must be at most'],
  ])('rejects %p', (body, message) => {
    const result = validateFeedback(body);
    expect(result.success).toBe(false);
    expect(!result.success && result.error).toContain(message);
  });

  it('normalizes optional fields', () => {
    expect(validateFeedback({ ...VALID, name: '  ', email: ' a@b.co ' })).toEqual({
      success: true,
      data: { type: 'bug', message: 'Timer froze', rating: 4, name: null, email: 'a@b.co' },
    });
  });
});

describe('POST /api/feedback', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetRateLimitsForTests();
  });

  it('stores validated feedback with the caller as owner', async () => {
    const mock = createSupabaseMock({ user: { id: 'user-1' } });
    (createClient as jest.Mock).mockResolvedValue(mock.client);

    const res = await post({ ...VALID, user_id: 'someone-else' });

    expect(res.status).toBe(200);
    const insert = mock.callsFor('feedbacks').find((c) => c.method === 'insert');
    expect(insert?.args[0]).toEqual({
      user_id: 'user-1',
      type: 'bug',
      message: 'Timer froze',
      rating: 4,
      name: null,
      email: null,
    });
  });

  it('returns 400 for invalid input', async () => {
    const mock = createSupabaseMock();
    (createClient as jest.Mock).mockResolvedValue(mock.client);
    const res = await post({ ...VALID, rating: 9 });
    expect(res.status).toBe(400);
  });

  it('throttles repeated submissions from one IP', async () => {
    const mock = createSupabaseMock();
    (createClient as jest.Mock).mockResolvedValue(mock.client);

    for (let i = 0; i < 5; i++) {
      expect((await post(VALID)).status).toBe(200);
    }
    const blocked = await post(VALID);
    expect(blocked.status).toBe(429);
    expect(blocked.headers.get('Retry-After')).toBeTruthy();

    // Another client is unaffected
    expect((await post(VALID, '198.51.100.9')).status).toBe(200);
  });
});
