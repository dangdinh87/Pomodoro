/** @vitest-environment node */
import { createTestDb, createTestUser, jsonRequest, resetTestDb, type TestDb } from '@/test-utils/test-db';
import { getSessionUser } from '@/lib/auth/session-user';
import { focusSessions, tasks } from '@/db/schema';
import { SESSION_MAX_TOTAL_SEC_PER_DAY } from '@/config/constants';
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

  it('records a work session and credits the linked task', async () => {
    const res = await record({ taskId, mode: 'work', durationSec: 1500 });
    expect(res.status).toBe(200);
    const task = (await mockDb.select().from(tasks)).find((t) => t.id === taskId);
    expect(task).toMatchObject({ actualPomodoros: 1, timeSpentMs: 1_500_000 });
  });

  it('does not credit a task for breaks', async () => {
    await record({ taskId, mode: 'shortBreak', durationSec: 300 });
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
    expect((await record({ mode: 'work', durationSec: 101 })).status).toBe(429);
    expect((await record({ mode: 'work', durationSec: 100 })).status).toBe(200);
  });

  it('validates the payload', async () => {
    expect((await record({ mode: 'nap', durationSec: 60 })).status).toBe(400);
    expect((await record('{bad')).status).toBe(400);
  });
});
