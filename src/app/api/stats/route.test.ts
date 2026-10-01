/** @vitest-environment node */
import { createTestDb, createTestUser, resetTestDb, type TestDb } from '@/test-utils/test-db';
import { getSessionUser } from '@/lib/auth/session-user';
import { focusSessions, tasks } from '@/db/schema';
import { GET as STATS } from './route';
import { GET as HISTORY } from '../history/route';

let mockDb: TestDb;
vi.mock('@/db', () => ({ get db() { return mockDb; } }));
vi.mock('@/lib/auth/session-user', () => ({ getSessionUser: vi.fn() }));

const DAY = 24 * 60 * 60 * 1000;
const daysAgo = (n: number) => new Date(Date.now() - n * DAY);

beforeAll(async () => {
  mockDb = await createTestDb();
});

beforeEach(async () => {
  await resetTestDb(mockDb);
  vi.mocked(getSessionUser).mockResolvedValue(await createTestUser(mockDb, 'u1'));
  await createTestUser(mockDb, 'u2');
  const [{ id: taskId }] = await mockDb.insert(tasks).values({ userId: 'u1', title: 'Essay' }).returning({ id: tasks.id });
  await mockDb.insert(focusSessions).values([
    { userId: 'u1', taskId, mode: 'work', durationSec: 1500, createdAt: daysAgo(0) },
    { userId: 'u1', mode: 'shortBreak', durationSec: 300, createdAt: daysAgo(0) },
    { userId: 'u1', mode: 'work', durationSec: 1500, createdAt: daysAgo(1) },
    { userId: 'u1', mode: 'work', durationSec: 600, createdAt: daysAgo(5) },
    { userId: 'u2', mode: 'work', durationSec: 9999, createdAt: daysAgo(0) },
  ]);
});

describe('GET /api/stats', () => {
  it('summarises own focus time, sessions and the streak', async () => {
    const body = await (await STATS(new Request('http://localhost/api/stats'))).json();
    expect(body.summary).toEqual({
      totalFocusTime: 3600,
      completedSessions: 3,
      streak: { current: 2, longest: 2 },
    });
    expect(body.dailyFocus).toHaveLength(7);
    expect(body.dailyFocus.at(-1).duration).toBe(1500);
    expect(body.distribution).toContainEqual({ name: 'shortBreak', value: 300 });
  });

  it('rejects requests without a session', async () => {
    vi.mocked(getSessionUser).mockResolvedValue(null);
    expect((await STATS(new Request('http://localhost/api/stats'))).status).toBe(401);
  });
});

describe('GET /api/history', () => {
  it('lists own sessions newest first with the task title', async () => {
    const { sessions } = await (await HISTORY(new Request('http://localhost/api/history'))).json();
    expect(sessions).toHaveLength(4);
    expect(sessions[0]).toMatchObject({ mode: 'work', duration: 1500, tasks: { title: 'Essay' } });
    expect(sessions.at(-1).tasks).toBeNull();
  });
});
