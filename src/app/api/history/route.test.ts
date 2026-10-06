/** @vitest-environment node */
import { createTestDb, createTestUser, resetTestDb, type TestDb } from '@/test-utils/test-db';
import { getSessionUser } from '@/lib/auth/session-user';
import { GET } from './route';

let mockDb: TestDb;
vi.mock('@/db', () => ({ get db() { return mockDb; } }));
vi.mock('@/lib/auth/session-user', () => ({ getSessionUser: vi.fn() }));
const signIn = (user: Awaited<ReturnType<typeof createTestUser>> | null) =>
  vi.mocked(getSessionUser).mockResolvedValue(user);

const URL_BASE = 'http://localhost/api/history';

beforeAll(async () => {
  mockDb = await createTestDb();
});

beforeEach(async () => {
  await resetTestDb(mockDb);
  signIn(await createTestUser(mockDb, 'u1'));
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('/api/history', () => {
  it('rejects requests without a session', async () => {
    signIn(null);
    expect((await GET(new Request(URL_BASE))).status).toBe(401);
  });

  it('returns sessions for a signed-in user', async () => {
    const res = await GET(new Request(URL_BASE));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body.sessions)).toBe(true);
  });

  it('404s when NEXT_PUBLIC_FEATURE_HISTORY is turned off, even for a signed-in user', async () => {
    vi.stubEnv('NEXT_PUBLIC_FEATURE_HISTORY', 'false');
    const res = await GET(new Request(URL_BASE));
    expect(res.status).toBe(404);
  });
});
