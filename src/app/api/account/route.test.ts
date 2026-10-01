/** @vitest-environment node */
import { createTestDb, createTestUser, resetTestDb, type TestDb } from '@/test-utils/test-db';
import { getSessionUser } from '@/lib/auth/session-user';
import { feedbacks, focusSessions, tasks, user } from '@/db/schema';
import { DELETE } from './route';

let mockDb: TestDb;
vi.mock('@/db', () => ({ get db() { return mockDb; } }));
vi.mock('@/lib/auth/session-user', () => ({ getSessionUser: vi.fn() }));

const del = (body: unknown, headers: Record<string, string> = {}) =>
  DELETE(
    new Request('http://localhost/api/account', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json', ...headers },
      body: JSON.stringify(body),
    }),
  );

beforeAll(async () => {
  mockDb = await createTestDb();
});

beforeEach(async () => {
  await resetTestDb(mockDb);
  vi.mocked(getSessionUser).mockResolvedValue(await createTestUser(mockDb, 'u1'));
  await createTestUser(mockDb, 'u2');
  await mockDb.insert(tasks).values([{ userId: 'u1', title: 'mine' }, { userId: 'u2', title: 'theirs' }]);
  await mockDb.insert(focusSessions).values({ userId: 'u1', mode: 'work', durationSec: 60 });
  await mockDb.insert(feedbacks).values({ userId: 'u1', type: 'bug', message: 'hi' });
});

describe('DELETE /api/account', () => {
  it('deletes the account and everything it owns, keeping feedback detached', async () => {
    const res = await del({ confirm: 'U1@example.com' });
    expect(res.status).toBe(200);
    expect((await mockDb.select().from(user)).map((u) => u.id)).toEqual(['u2']);
    expect((await mockDb.select().from(tasks)).map((t) => t.title)).toEqual(['theirs']);
    expect(await mockDb.select().from(focusSessions)).toHaveLength(0);
    expect((await mockDb.select().from(feedbacks))[0].userId).toBeNull();
  });

  it('requires the email as confirmation', async () => {
    expect((await del({ confirm: 'nope' })).status).toBe(400);
    expect(await mockDb.select().from(user)).toHaveLength(2);
  });

  it('uses DELETE as the confirmation for a guest session', async () => {
    vi.mocked(getSessionUser).mockResolvedValue({ id: 'u1', email: 'temp@anon', isAnonymous: true });
    expect((await del({ confirm: 'delete' })).status).toBe(200);
  });

  it('blocks cross-origin requests and missing sessions', async () => {
    expect((await del({ confirm: 'u1@example.com' }, { Origin: 'https://evil.example' })).status).toBe(403);
    vi.mocked(getSessionUser).mockResolvedValue(null);
    expect((await del({ confirm: 'u1@example.com' })).status).toBe(401);
  });
});
