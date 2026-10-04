/** @vitest-environment node */
import { createTestDb, createTestUser, jsonRequest, resetTestDb, type TestDb } from '@/test-utils/test-db';
import { getSessionUser } from '@/lib/auth/session-user';
import { eq, sql } from 'drizzle-orm';
import { focusSessions, tasks } from '@/db/schema';
import { SESSION_LIMIT_CODE, SESSION_MAX_TOTAL_SEC_PER_DAY } from '@/config/constants';
import { POST } from './route';

let mockDb: TestDb;
vi.mock('@/db', () => ({ get db() { return mockDb; } }));
vi.mock('@/lib/auth/session-user', () => ({ getSessionUser: vi.fn() }));

const record = (body: unknown) => POST(jsonRequest('http://localhost/api/tasks/session-complete', body));
let taskId: string;
let foreignTaskId: string;

beforeAll(async () => {
  mockDb = await createTestDb();
});

beforeEach(async () => {
  await resetTestDb(mockDb);
  vi.mocked(getSessionUser).mockResolvedValue(await createTestUser(mockDb, 'u1'));
  await createTestUser(mockDb, 'u2');
  [{ id: taskId }, { id: foreignTaskId }] = await mockDb
    .insert(tasks)
    .values([{ userId: 'u1', title: 'mine' }, { userId: 'u2', title: 'theirs' }])
    .returning({ id: tasks.id });
});

describe('POST /api/tasks/session-complete', () => {
  it('rejects requests without a session', async () => {
    vi.mocked(getSessionUser).mockResolvedValue(null);
    expect((await record({ mode: 'work', durationSec: 60 })).status).toBe(401);
  });

  const taskRow = async () => (await mockDb.select().from(tasks)).find((t) => t.id === taskId)!;

  it('records a full work session: +1 pomodoro and the time', async () => {
    const res = await record({ taskId, mode: 'work', durationSec: 1500, completedFullSession: true });
    expect(res.status).toBe(200);
    expect(await taskRow()).toMatchObject({ actualPomodoros: 1, timeSpentMs: 1_500_000 });
  });

  it('adds the time but no pomodoro for a partial segment', async () => {
    await record({ taskId, mode: 'work', durationSec: 70, completedFullSession: false });
    await record({ taskId, mode: 'work', durationSec: 30 }); // flag omitted = partial
    expect(await taskRow()).toMatchObject({ actualPomodoros: 0, timeSpentMs: 100_000 });
    expect(await mockDb.select().from(focusSessions)).toHaveLength(2);
  });

  it('rejects a non-boolean completedFullSession', async () => {
    expect((await record({ taskId, mode: 'work', durationSec: 60, completedFullSession: 'yes' })).status).toBe(400);
  });

  it('does not credit a task for breaks', async () => {
    await record({ taskId, mode: 'shortBreak', durationSec: 300, completedFullSession: true });
    const rows = await mockDb.select().from(tasks);
    expect(rows.find((t) => t.id === taskId)?.actualPomodoros).toBe(0);
  });

  it("keeps the session but drops a task id that isn't the user's", async () => {
    await record({ taskId: foreignTaskId, mode: 'work', durationSec: 600 });
    const [session] = await mockDb.select().from(focusSessions);
    expect(session.taskId).toBeNull();
    const rows = await mockDb.select().from(tasks);
    expect(rows.find((t) => t.id === foreignTaskId)?.actualPomodoros).toBe(0);
  });

  it('refuses time beyond 24 hours in a rolling day', async () => {
    await mockDb.insert(focusSessions).values({ userId: 'u1', mode: 'work', durationSec: SESSION_MAX_TOTAL_SEC_PER_DAY - 100 });
    const refused = await record({ mode: 'work', durationSec: 101 });
    expect(refused.status).toBe(429);
    // typed, so the client can tell it from a 429 of the platform firewall (which is worth retrying)
    expect(await refused.json()).toMatchObject({ code: SESSION_LIMIT_CODE });
    expect((await record({ mode: 'work', durationSec: 100 })).status).toBe(200);
  });

  it('validates the payload', async () => {
    expect((await record({ mode: 'nap', durationSec: 60 })).status).toBe(400);
    expect((await record('{bad')).status).toBe(400);
  });

  describe('idempotency (clientSessionId)', () => {
    const id = '7d6f9a3e-2c1b-4e55-9a10-0b1f6a3c8d21';
    const full = { taskId: undefined as string | undefined, mode: 'work', durationSec: 1500, completedFullSession: true, clientSessionId: id };

    it('stores a retried session once and credits the task once', async () => {
      const first = await record({ ...full, taskId });
      expect(first.status).toBe(200);
      expect(await first.json()).toHaveProperty('session');

      const retry = await record({ ...full, taskId });
      expect(retry.status).toBe(200);
      expect(await retry.json()).toEqual({ duplicate: true });

      expect(await mockDb.select().from(focusSessions)).toHaveLength(1);
      expect(await taskRow()).toMatchObject({ actualPomodoros: 1, timeSpentMs: 1_500_000 });
    });

    it('handles two tabs finishing the same session at the same time', async () => {
      const results = await Promise.all([record({ ...full, taskId }), record({ ...full, taskId })]);
      expect(results.map((r) => r.status)).toEqual([200, 200]);
      expect(await mockDb.select().from(focusSessions)).toHaveLength(1);
      expect(await taskRow()).toMatchObject({ actualPomodoros: 1 });
    });

    it('acknowledges a duplicate even when the day is already full', async () => {
      await mockDb.insert(focusSessions).values({ userId: 'u1', mode: 'work', durationSec: SESSION_MAX_TOTAL_SEC_PER_DAY - 100, clientSessionId: id });
      // a new 200 s session would exceed the cap, but this one is already stored
      const res = await record({ ...full, durationSec: 200 });
      expect(res.status).toBe(200);
      expect(await res.json()).toEqual({ duplicate: true });
    });

    it('scopes ids per user', async () => {
      await record({ ...full });
      vi.mocked(getSessionUser).mockResolvedValue({ id: 'u2', email: 'u2@example.com', isAnonymous: false });
      const res = await record({ ...full });
      expect(await res.json()).toHaveProperty('session');
      expect(await mockDb.select().from(focusSessions)).toHaveLength(2);
    });

    it('still accepts sessions without an id (older clients), each stored', async () => {
      await record({ mode: 'work', durationSec: 60 });
      await record({ mode: 'work', durationSec: 60 });
      expect(await mockDb.select().from(focusSessions)).toHaveLength(2);
    });

    it('ignores a malformed id instead of dropping the session', async () => {
      const res = await record({ mode: 'work', durationSec: 60, clientSessionId: 'not a valid id!' });
      expect(res.status).toBe(200);
      const [row] = await mockDb.select().from(focusSessions);
      expect(row.clientSessionId).toBeNull();
    });
  });

  describe('endedAt', () => {
    const stored = async () => (await mockDb.select().from(focusSessions))[0].createdAt.getTime();
    const near = (ms: number, target: number) => Math.abs(ms - target) < 5_000;
    const HOUR = 3_600_000;

    it('uses the reported end time of an offline session', async () => {
      const endedAt = new Date(Date.now() - 2 * HOUR);
      await record({ mode: 'work', durationSec: 600, endedAt: endedAt.toISOString() });
      expect(await stored()).toBe(endedAt.getTime());
    });

    it('allows a few minutes of clock skew into the future', async () => {
      const endedAt = new Date(Date.now() + 2 * 60_000);
      await record({ mode: 'work', durationSec: 600, endedAt: endedAt.toISOString() });
      expect(await stored()).toBe(endedAt.getTime());
    });

    it('falls back to now for a far-future end time', async () => {
      await record({ mode: 'work', durationSec: 600, endedAt: new Date(Date.now() + 3 * 24 * HOUR).toISOString() });
      expect(near(await stored(), Date.now())).toBe(true);
    });

    it('falls back to now for an end time older than 7 days', async () => {
      await record({ mode: 'work', durationSec: 600, endedAt: new Date(Date.now() - 8 * 24 * HOUR).toISOString() });
      expect(near(await stored(), Date.now())).toBe(true);
    });

    it('falls back to now for garbage', async () => {
      await record({ mode: 'work', durationSec: 600, endedAt: 'yesterday-ish' });
      expect(near(await stored(), Date.now())).toBe(true);
    });

    it('counts a backdated session in its own 24 hour window, not in the upload window', async () => {
      await mockDb.insert(focusSessions).values({ userId: 'u1', mode: 'work', durationSec: SESSION_MAX_TOTAL_SEC_PER_DAY - 100 });
      const threeDaysAgo = new Date(Date.now() - 3 * 24 * HOUR).toISOString();
      expect((await record({ mode: 'work', durationSec: 101, endedAt: threeDaysAgo })).status).toBe(200);
      expect((await record({ mode: 'work', durationSec: 101 })).status).toBe(429);
    });
  });

  describe('daily cap under concurrency', () => {
    it('lets parallel requests through only up to the cap', async () => {
      const chunk = 4 * 60 * 60;
      const results = await Promise.all(
        Array.from({ length: 8 }, (_, i) => record({ mode: 'work', durationSec: chunk, clientSessionId: `parallel-${i}-xxxx` })),
      );
      const ok = results.filter((r) => r.status === 200).length;
      expect(ok).toBe(SESSION_MAX_TOTAL_SEC_PER_DAY / chunk);
      expect(results.filter((r) => r.status === 429)).toHaveLength(8 - ok);
      const total = (await mockDb.select().from(focusSessions)).reduce((n, r) => n + r.durationSec, 0);
      expect(total).toBeLessThanOrEqual(SESSION_MAX_TOTAL_SEC_PER_DAY);
    });

    it('PGlite supports the per-user advisory lock the route relies on', async () => {
      const rows = await mockDb.transaction(async (tx) => {
        await tx.execute(sql`select pg_advisory_xact_lock(hashtext(${'u1'}))`);
        return tx.select().from(focusSessions).where(eq(focusSessions.userId, 'u1'));
      });
      expect(rows).toEqual([]);
    });
  });
});
