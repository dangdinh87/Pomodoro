/** @vitest-environment node */
import { createTestDb, createTestUser, jsonRequest, resetTestDb, type TestDb } from '@/test-utils/test-db';
import { getSessionUser } from '@/lib/auth/session-user';
import { MAX_USER_TAGS } from '@/lib/tasks/tag-limits';
import { DELETE, GET, POST } from './route';

let mockDb: TestDb;
vi.mock('@/db', () => ({ get db() { return mockDb; } }));
vi.mock('@/lib/auth/session-user', () => ({ getSessionUser: vi.fn() }));

const add = (tag: unknown) => POST(jsonRequest('http://localhost/api/tags', { tag }));

beforeAll(async () => {
  mockDb = await createTestDb();
});

beforeEach(async () => {
  await resetTestDb(mockDb);
  vi.mocked(getSessionUser).mockResolvedValue(await createTestUser(mockDb, 'u1'));
});

describe('/api/tags', () => {
  it('adds, lists and removes tags (normalised to lower case)', async () => {
    expect((await (await add('  Math ')).json()).tags).toEqual(['math']);
    expect((await add('math')).status).toBe(400);
    await add('english');
    expect((await (await GET()).json()).tags).toEqual(['math', 'english']);
    const res = await DELETE(new Request('http://localhost/api/tags?tag=MATH', { method: 'DELETE' }));
    expect((await res.json()).tags).toEqual(['english']);
  });

  it('caps the number of tags', async () => {
    for (let i = 0; i < MAX_USER_TAGS; i++) await add(`t${i}`);
    expect((await add('one-more')).status).toBe(400);
  });

  it('rejects requests without a session', async () => {
    vi.mocked(getSessionUser).mockResolvedValue(null);
    expect((await GET()).status).toBe(401);
  });
});
