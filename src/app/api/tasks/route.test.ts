/** @vitest-environment node */
import { createTestDb, createTestUser, jsonRequest, resetTestDb, type TestDb } from '@/test-utils/test-db';
import { getSessionUser } from '@/lib/auth/session-user';
import { tasks } from '@/db/schema';
import { GET, POST } from './route';

let mockDb: TestDb;
vi.mock('@/db', () => ({ get db() { return mockDb; } }));
vi.mock('@/lib/auth/session-user', () => ({ getSessionUser: vi.fn() }));
const signIn = (user: Awaited<ReturnType<typeof createTestUser>> | null) =>
  vi.mocked(getSessionUser).mockResolvedValue(user);

const URL_BASE = 'http://localhost/api/tasks';
const list = async (query = '') => (await GET(new Request(`${URL_BASE}${query}`))).json();

beforeAll(async () => {
  mockDb = await createTestDb();
});

beforeEach(async () => {
  await resetTestDb(mockDb);
  signIn(await createTestUser(mockDb, 'u1'));
});

describe('/api/tasks', () => {
  it('rejects requests without a session', async () => {
    signIn(null);
    expect((await GET(new Request(URL_BASE))).status).toBe(401);
    expect((await POST(jsonRequest(URL_BASE, { title: 'x' }))).status).toBe(401);
  });

  it('creates a task and returns the snake_case wire format', async () => {
    const res = await POST(
      jsonRequest(URL_BASE, { title: '  Read ch.3 ', priority: 'high', estimate_pomodoros: 3, tags: ['math', 'math'] }),
    );
    expect(res.status).toBe(201);
    const { task } = await res.json();
    expect(task).toMatchObject({
      title: 'Read ch.3',
      priority: 'HIGH',
      status: 'TODO',
      estimate_pomodoros: 3,
      actual_pomodoros: 0,
      time_spent: 0,
      tags: ['math'],
      is_template: false,
      is_deleted: false,
      user_id: 'u1',
    });
  });

  it('validates the body', async () => {
    expect((await POST(jsonRequest(URL_BASE, '{bad'))).status).toBe(400);
    const res = await POST(jsonRequest(URL_BASE, { title: '   ' }));
    expect(res.status).toBe(400);
    expect((await res.json()).details.title).toBeDefined();
  });

  it('rejects a tag that is too long or more than 10 tags with 400', async () => {
    const tooLong = await POST(jsonRequest(URL_BASE, { title: 'x', tags: ['a'.repeat(33)] }));
    expect(tooLong.status).toBe(400);
    expect((await tooLong.json()).details.tags).toBeDefined();
    const tooMany = await POST(jsonRequest(URL_BASE, { title: 'x', tags: Array.from({ length: 11 }, (_, i) => `t${i}`) }));
    expect(tooMany.status).toBe(400);
  });

  it('answers 409 with a code at the 2000 task limit; deleted tasks do not count', async () => {
    await mockDb.insert(tasks).values([
      ...Array.from({ length: 1999 }, (_, i) => ({ userId: 'u1', title: `t${i}` })),
      ...Array.from({ length: 5 }, (_, i) => ({ userId: 'u1', title: `gone${i}`, isDeleted: true })),
    ]);
    expect((await POST(jsonRequest(URL_BASE, { title: 'the 2000th' }))).status).toBe(201);

    const full = await POST(jsonRequest(URL_BASE, { title: 'one too many' }));
    expect(full.status).toBe(409);
    expect(await full.json()).toMatchObject({ code: 'TASK_LIMIT_REACHED', max: 2000 });
  });

  it("lists only the user's own, non-deleted tasks with a total", async () => {
    await createTestUser(mockDb, 'u2');
    await mockDb.insert(tasks).values([
      { userId: 'u1', title: 'mine' },
      { userId: 'u1', title: 'deleted', isDeleted: true },
      { userId: 'u2', title: 'theirs' },
    ]);
    const body = await list();
    expect(body.tasks.map((t: { title: string }) => t.title)).toEqual(['mine']);
    expect(body.total).toBe(1);
  });

  it('filters by status, tag and a case-insensitive search', async () => {
    await mockDb.insert(tasks).values([
      { userId: 'u1', title: 'Essay draft', status: 'DOING', tags: ['writing'] },
      { userId: 'u1', title: 'Flashcards', status: 'TODO', tags: ['english'] },
    ]);
    expect((await list('?status=doing')).tasks.map((t: { title: string }) => t.title)).toEqual(['Essay draft']);
    expect((await list('?tag=english')).tasks.map((t: { title: string }) => t.title)).toEqual(['Flashcards']);
    expect((await list('?q=ESSAY')).tasks.map((t: { title: string }) => t.title)).toEqual(['Essay draft']);
  });

  it('paginates and caps the page size', async () => {
    await mockDb.insert(tasks).values(Array.from({ length: 5 }, (_, i) => ({ userId: 'u1', title: `t${i}` })));
    const page = await list('?limit=2&page=2');
    expect(page.tasks).toHaveLength(2);
    expect(page.total).toBe(5);
    expect((await list('?limit=9999')).limit).toBe(100);
  });

  it('rejects a malformed tag filter', async () => {
    expect((await GET(new Request(`${URL_BASE}?tag=${encodeURIComponent('a,b')}`))).status).toBe(400);
  });
});
