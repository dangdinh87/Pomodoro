/** @vitest-environment node */
import { createTestDb, createTestUser, jsonRequest, resetTestDb, type TestDb } from '@/test-utils/test-db';
import { getSessionUser } from '@/lib/auth/session-user';
import { feedbacks } from '@/db/schema';
import { POST } from './route';

let mockDb: TestDb;
vi.mock('@/db', () => ({ get db() { return mockDb; } }));
vi.mock('@/lib/auth/session-user', () => ({ getSessionUser: vi.fn() }));

let ip = 0;
// A fresh client IP per call keeps the per-IP rate limiter out of unrelated tests.
const send = (body: unknown, clientIp = `10.0.0.${++ip}`) =>
  POST(jsonRequest('http://localhost/api/feedback', body, { headers: { 'x-forwarded-for': clientIp } }));
const valid = { type: 'bug', message: 'The timer skipped a beat', rating: 4 };

beforeAll(async () => {
  mockDb = await createTestDb();
});

beforeEach(async () => {
  await resetTestDb(mockDb);
  vi.mocked(getSessionUser).mockResolvedValue(null);
});

describe('POST /api/feedback', () => {
  it('saves anonymous feedback', async () => {
    expect((await send(valid)).status).toBe(200);
    const [row] = await mockDb.select().from(feedbacks);
    expect(row).toMatchObject({ type: 'bug', rating: 4, userId: null });
  });

  it('links feedback to the signed-in user', async () => {
    vi.mocked(getSessionUser).mockResolvedValue(await createTestUser(mockDb, 'u1'));
    await send(valid);
    expect((await mockDb.select().from(feedbacks))[0].userId).toBe('u1');
  });

  it('validates the payload', async () => {
    expect((await send({ type: 'rant', message: 'x' })).status).toBe(400);
    expect((await send('{bad')).status).toBe(400);
  });

  it('rate limits per client IP', async () => {
    for (let i = 0; i < 5; i++) expect((await send(valid, '192.0.2.1')).status).toBe(200);
    expect((await send(valid, '192.0.2.1')).status).toBe(429);
  });
});
