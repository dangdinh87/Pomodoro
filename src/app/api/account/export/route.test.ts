/**
 * @jest-environment node
 */
import { GET as rawGet } from './route';
import { createClient } from '@/lib/supabase-server';
import { resetRateLimitsForTests } from '@/lib/api/in-memory-rate-limiter';
import { createSupabaseMock } from '@/test-utils/supabase-mock';

jest.mock('@/lib/supabase-server', () => ({ createClient: jest.fn() }));

const GET = (headers: Record<string, string> = {}) =>
  rawGet(new Request('http://localhost/api/account/export', { headers }));

const USER = { id: 'user-1', email: 'a@b.co' };

function setup(user: typeof USER | null = USER) {
  const mock = createSupabaseMock({
    user,
    tables: {
      profiles: { data: [{ id: 'user-1', name: 'A' }] },
      tasks: { data: [{ id: 't1', user_id: 'user-1' }] },
      sessions: { data: [] },
      streaks: { data: [{ user_id: 'user-1' }] },
      user_tags: { data: [] },
      conversations: { data: [{ id: 'c1', user_id: 'user-1' }] },
      messages: { data: [{ id: 'm1', conversation_id: 'c1' }] },
    },
  });
  (createClient as jest.Mock).mockResolvedValue(mock.client);
  return mock;
}

describe('GET /api/account/export', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetRateLimitsForTests();
  });

  it('rejects cross-site requests with 403', async () => {
    setup();
    expect((await GET({ origin: 'https://evil.test' })).status).toBe(403);
  });

  it('returns 401 when unauthenticated', async () => {
    setup(null);
    expect((await GET()).status).toBe(401);
  });

  it('exports only the caller data as an attachment', async () => {
    const mock = setup();
    const res = await GET();
    expect(res.status).toBe(200);
    expect(res.headers.get('Content-Disposition')).toMatch(
      /^attachment; filename="studybro-data-\d{4}-\d{2}-\d{2}\.json"$/,
    );
    const body = JSON.parse(await res.text());
    expect(body.account).toEqual({ id: 'user-1', email: 'a@b.co' });
    expect(body.tasks).toHaveLength(1);
    expect(body.conversations).toHaveLength(1);
    expect(body.messages).toHaveLength(1);

    for (const table of ['tasks', 'sessions', 'streaks', 'user_tags', 'conversations']) {
      expect(mock.callsFor(table)).toContainEqual({ method: 'eq', args: ['user_id', 'user-1'] });
    }
    expect(mock.callsFor('profiles')).toContainEqual({ method: 'eq', args: ['id', 'user-1'] });
    expect(mock.callsFor('messages')).toContainEqual({ method: 'in', args: ['conversation_id', ['c1']] });
  });

  it('rate limits to 3 exports per hour per user', async () => {
    setup();
    for (let i = 0; i < 3; i++) expect((await GET()).status).toBe(200);
    const res = await GET();
    expect(res.status).toBe(429);
    expect(res.headers.get('Retry-After')).toBeTruthy();
  });
});
