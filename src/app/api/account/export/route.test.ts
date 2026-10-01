/** @vitest-environment node */
import { createTestDb, createTestUser, resetTestDb, type TestDb } from '@/test-utils/test-db';
import { getSessionUser } from '@/lib/auth/session-user';
import { focusSessions, tasks, userTags } from '@/db/schema';
import { GET } from './route';

let mockDb: TestDb;
vi.mock('@/db', () => ({ get db() { return mockDb; } }));
vi.mock('@/lib/auth/session-user', () => ({ getSessionUser: vi.fn() }));

const exportData = () => GET(new Request('http://localhost/api/account/export'));

beforeAll(async () => {
  mockDb = await createTestDb();
});

beforeEach(async () => {
  await resetTestDb(mockDb);
  await createTestUser(mockDb, 'u2');
});

describe('GET /api/account/export', () => {
  it("exports only the user's own data as a download", async () => {
    vi.mocked(getSessionUser).mockResolvedValue(await createTestUser(mockDb, 'export-1'));
    await mockDb.insert(tasks).values([{ userId: 'export-1', title: 'mine' }, { userId: 'u2', title: 'theirs' }]);
    await mockDb.insert(focusSessions).values({ userId: 'export-1', mode: 'work', durationSec: 60 });
    await mockDb.insert(userTags).values({ userId: 'export-1', tags: ['math'] });

    const res = await exportData();
    expect(res.status).toBe(200);
    expect(res.headers.get('Content-Disposition')).toMatch(/attachment; filename="studybro-data-/);
    const body = JSON.parse(await res.text());
    expect(body.account).toMatchObject({ id: 'export-1', email: 'export-1@example.com' });
    expect(body.tasks.map((t: { title: string }) => t.title)).toEqual(['mine']);
    expect(body.sessions).toHaveLength(1);
    expect(body.tags).toEqual(['math']);
  });

  it('is rate limited per user', async () => {
    vi.mocked(getSessionUser).mockResolvedValue(await createTestUser(mockDb, 'export-2'));
    for (let i = 0; i < 3; i++) expect((await exportData()).status).toBe(200);
    expect((await exportData()).status).toBe(429);
  });

  it('rejects requests without a session', async () => {
    vi.mocked(getSessionUser).mockResolvedValue(null);
    expect((await exportData()).status).toBe(401);
  });
});
