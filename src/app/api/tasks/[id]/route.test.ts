/** @vitest-environment node */
import { eq } from 'drizzle-orm';
import { createTestDb, createTestUser, jsonRequest, resetTestDb, type TestDb } from '@/test-utils/test-db';
import { getSessionUser } from '@/lib/auth/session-user';
import { tasks } from '@/db/schema';
import { DELETE, PATCH } from './route';
import { POST as CLONE } from './clone/route';
import { POST as REORDER } from '../reorder/route';

let mockDb: TestDb;
vi.mock('@/db', () => ({ get db() { return mockDb; } }));
vi.mock('@/lib/auth/session-user', () => ({ getSessionUser: vi.fn() }));

const params = (id: string) => ({ params: Promise.resolve({ id }) });
const patch = (id: string, body: unknown) =>
  PATCH(jsonRequest(`http://localhost/api/tasks/${id}`, body, { method: 'PATCH' }), params(id));
const remove = (id: string, query = '') =>
  DELETE(new Request(`http://localhost/api/tasks/${id}${query}`, { method: 'DELETE' }), params(id));

let mine: string;
let theirs: string;

beforeAll(async () => {
  mockDb = await createTestDb();
});

beforeEach(async () => {
  await resetTestDb(mockDb);
  vi.mocked(getSessionUser).mockResolvedValue(await createTestUser(mockDb, 'u1'));
  await createTestUser(mockDb, 'u2');
  [{ id: mine }, { id: theirs }] = await mockDb
    .insert(tasks)
    .values([
      { userId: 'u1', title: 'mine', actualPomodoros: 2, timeSpentMs: 3000, status: 'DOING', displayOrder: 4 },
      { userId: 'u2', title: 'theirs' },
    ])
    .returning({ id: tasks.id });
});

describe('PATCH /api/tasks/[id]', () => {
  it('updates the own task', async () => {
    const res = await patch(mine, { status: 'done', title: 'Renamed', due_date: '2026-10-05' });
    expect(res.status).toBe(200);
    expect((await res.json()).task).toMatchObject({ status: 'DONE', title: 'Renamed' });
  });

  it("answers 404 for someone else's task or a malformed id", async () => {
    expect((await patch(theirs, { title: 'hijack' })).status).toBe(404);
    expect((await patch('not-a-uuid', { title: 'x' })).status).toBe(404);
    const [row] = await mockDb.select().from(tasks).where(eq(tasks.id, theirs));
    expect(row.title).toBe('theirs');
  });

  it('rejects an invalid body', async () => {
    expect((await patch(mine, { title: '' })).status).toBe(400);
  });

  it('answers 400, not 500, for a display_order that does not fit the column', async () => {
    expect((await patch(mine, { display_order: 2147483648 })).status).toBe(400);
    expect((await patch(mine, { display_order: -3 })).status).toBe(400);
    expect((await patch(mine, { display_order: 2147483647 })).status).toBe(200);
  });
});

describe('DELETE /api/tasks/[id]', () => {
  it('soft-deletes by default and hard-deletes on request', async () => {
    expect((await (await remove(mine)).json()).task.is_deleted).toBe(true);
    expect((await remove(mine, '?hard=true')).status).toBe(200);
    expect(await mockDb.select().from(tasks).where(eq(tasks.id, mine))).toHaveLength(0);
  });

  it("never touches someone else's task", async () => {
    expect((await remove(theirs)).status).toBe(404);
    await remove(theirs, '?hard=true');
    expect(await mockDb.select().from(tasks).where(eq(tasks.id, theirs))).toHaveLength(1);
  });
});

describe('POST /api/tasks/[id]/clone', () => {
  it('copies the task with progress reset', async () => {
    const res = await CLONE(new Request('http://localhost'), params(mine));
    expect(res.status).toBe(201);
    expect((await res.json()).task).toMatchObject({
      title: 'mine (Copy)',
      status: 'TODO',
      actual_pomodoros: 0,
      time_spent: 0,
      display_order: 5,
    });
    expect((await CLONE(new Request('http://localhost'), params(theirs))).status).toBe(404);
  });

  it('keeps the copy inside the int4 range of display_order', async () => {
    await mockDb.update(tasks).set({ displayOrder: 2147483647 }).where(eq(tasks.id, mine));
    const res = await CLONE(new Request('http://localhost'), params(mine));
    expect(res.status).toBe(201);
    expect((await res.json()).task.display_order).toBe(2147483647);
  });

  it('answers 409 with a code once the user is at the task limit', async () => {
    await mockDb.insert(tasks).values(Array.from({ length: 1999 }, (_, i) => ({ userId: 'u1', title: `t${i}` })));
    expect((await CLONE(new Request('http://localhost'), params(mine))).status).toBe(409);
  });
});

describe('POST /api/tasks/reorder', () => {
  const reorder = (body: unknown) => REORDER(jsonRequest('http://localhost/api/tasks/reorder', body));

  it('reorders own tasks only', async () => {
    const res = await reorder({ tasks: [{ id: mine, displayOrder: 9 }, { id: theirs, displayOrder: 9 }] });
    expect(res.status).toBe(200);
    const rows = await mockDb.select().from(tasks);
    expect(rows.find((t) => t.id === mine)?.displayOrder).toBe(9);
    expect(rows.find((t) => t.id === theirs)?.displayOrder).toBe(0);
  });

  it('validates the payload', async () => {
    expect((await reorder({ tasks: [] })).status).toBe(400);
    expect((await reorder({ tasks: [{ id: mine, displayOrder: 'x' }] })).status).toBe(400);
  });

  it('answers 400, not 500, for a displayOrder outside 0..2147483647', async () => {
    expect((await reorder({ tasks: [{ id: mine, displayOrder: 2147483648 }] })).status).toBe(400);
    expect((await reorder({ tasks: [{ id: mine, displayOrder: -1 }] })).status).toBe(400);
    expect((await reorder({ tasks: [{ id: mine, displayOrder: 2147483647 }] })).status).toBe(200);
  });
});
