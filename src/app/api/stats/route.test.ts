/** @vitest-environment node */
import { createTestDb, createTestUser, resetTestDb, type TestDb } from '@/test-utils/test-db';
import { getSessionUser } from '@/lib/auth/session-user';
import { focusSessions, tasks } from '@/db/schema';
import { GET as STATS } from './route';
import { GET as HISTORY } from '../history/route';

let mockDb: TestDb;
vi.mock('@/db', () => ({ get db() { return mockDb; } }));
vi.mock('@/lib/auth/session-user', () => ({ getSessionUser: vi.fn() }));

const VN = 'Asia/Ho_Chi_Minh';
// Vietnam is UTC+7 all year: `vn('2026-10-05T00:31')` is 00:31 on the 5th in Ho Chi Minh City.
const vn = (local: string) => new Date(`${local}:00+07:00`);
const at = (local: string) => vi.setSystemTime(vn(local));

const stats = async (query = '') => (await STATS(new Request(`http://localhost/api/stats${query}`))).json();
const history = async (query = '') => (await HISTORY(new Request(`http://localhost/api/history${query}`))).json();
const durations = ({ sessions }: { sessions: { duration: number }[] }) => sessions.map((s) => s.duration).sort((a, b) => a - b);
const work = (local: string, durationSec = 600) => ({ userId: 'u1', mode: 'work' as const, durationSec, createdAt: vn(local) });

beforeAll(async () => {
  mockDb = await createTestDb();
});

beforeEach(async () => {
  vi.useFakeTimers({ toFake: ['Date'] });
  at('2026-10-05T09:00');
  await resetTestDb(mockDb);
  vi.mocked(getSessionUser).mockResolvedValue(await createTestUser(mockDb, 'u1'));
  await createTestUser(mockDb, 'u2');
});

afterEach(() => {
  vi.useRealTimers();
});

describe('GET /api/stats', () => {
  beforeEach(async () => {
    const [{ id: taskId }] = await mockDb.insert(tasks).values({ userId: 'u1', title: 'Essay' }).returning({ id: tasks.id });
    await mockDb.insert(focusSessions).values([
      { ...work('2026-10-05T08:00', 1500), taskId },
      { userId: 'u1', mode: 'shortBreak', durationSec: 300, createdAt: vn('2026-10-05T08:30') },
      work('2026-10-04T09:00', 1500),
      work('2026-09-30T09:00', 600),
      { userId: 'u2', mode: 'work', durationSec: 9999, createdAt: vn('2026-10-05T08:00') },
    ]);
  });

  it('summarises own focus time, sessions and the streak', async () => {
    const body = await stats(`?tz=${VN}`);
    expect(body.summary).toEqual({
      totalFocusTime: 3600,
      completedSessions: 3,
      streak: { current: 2, longest: 2 },
    });
    expect(body.dailyFocus).toHaveLength(7);
    expect(body.dailyFocus.at(0)).toEqual({ date: '2026-09-29', duration: 0 });
    expect(body.dailyFocus.at(-1)).toEqual({ date: '2026-10-05', duration: 1500 });
    expect(body.dailyFocus.find((d: { date: string }) => d.date === '2026-09-30').duration).toBe(600);
    expect(body.distribution).toContainEqual({ name: 'shortBreak', value: 300 });
    expect(body.distribution).toContainEqual({ name: 'work', value: 3600 });
  });

  it('keeps the response shape without tz (UTC)', async () => {
    const body = await stats();
    expect(Object.keys(body).sort()).toEqual(['dailyFocus', 'distribution', 'summary']);
    expect(body.dailyFocus).toHaveLength(7);
  });

  it('filters by a range of study days', async () => {
    const body = await stats(`?tz=${VN}&startDate=2026-10-04&endDate=2026-10-05`);
    expect(body.summary.totalFocusTime).toBe(3000);
    expect(body.summary.completedSessions).toBe(2);
    expect(body.dailyFocus).toEqual([
      { date: '2026-10-04', duration: 1500 },
      { date: '2026-10-05', duration: 1500 },
    ]);
    expect(body.distribution).toContainEqual({ name: 'work', value: 3000 });
  });

  it('computes the streak over all time even when the range is narrow', async () => {
    const body = await stats(`?tz=${VN}&startDate=2026-10-05&endDate=2026-10-05`);
    expect(body.summary.totalFocusTime).toBe(1500);
    expect(body.summary.streak).toEqual({ current: 2, longest: 2 });
  });

  it('caps a very long range', async () => {
    const body = await stats(`?tz=${VN}&startDate=2020-01-01&endDate=2026-10-05`);
    expect(body.dailyFocus).toHaveLength(366);
  });

  it('ignores malformed dates and unknown zones', async () => {
    const body = await stats('?tz=Mars/Olympus&startDate=2026-02-30&endDate=nope');
    expect(body.dailyFocus).toHaveLength(7);
    expect(body.summary.completedSessions).toBe(3);
  });

  it('rejects requests without a session', async () => {
    vi.mocked(getSessionUser).mockResolvedValue(null);
    expect((await STATS(new Request('http://localhost/api/stats'))).status).toBe(401);
  });
});

describe('GET /api/stats by study day (04:00 local)', () => {
  it('counts a 00:31 session for today while the study day is still the same, then for yesterday after 04:00', async () => {
    await mockDb.insert(focusSessions).values(work('2026-10-05T00:31', 1500));

    at('2026-10-05T00:45'); // the study day is still the 4th: "Today" must show the session
    const night = await stats(`?tz=${VN}`);
    expect(night.dailyFocus.at(-1)).toEqual({ date: '2026-10-04', duration: 1500 });
    const nightToday = await stats(`?tz=${VN}&startDate=2026-10-04&endDate=2026-10-04`);
    expect(nightToday.summary).toMatchObject({ totalFocusTime: 1500, completedSessions: 1 });

    at('2026-10-05T09:00'); // morning: the 5th has started, the session stays on the 4th
    const morning = await stats(`?tz=${VN}`);
    expect(morning.dailyFocus.at(-1)).toEqual({ date: '2026-10-05', duration: 0 });
    expect(morning.dailyFocus.at(-2)).toEqual({ date: '2026-10-04', duration: 1500 });
    const morningToday = await stats(`?tz=${VN}&startDate=2026-10-05&endDate=2026-10-05`);
    expect(morningToday.summary).toMatchObject({ totalFocusTime: 0, completedSessions: 0 });
  });

  it('splits at 04:00: 03:30 belongs to the previous day and 04:00 to the next', async () => {
    await mockDb.insert(focusSessions).values([work('2026-10-05T03:30', 600), work('2026-10-05T04:00', 1200)]);
    const body = await stats(`?tz=${VN}&startDate=2026-10-04&endDate=2026-10-05`);
    expect(body.dailyFocus).toEqual([
      { date: '2026-10-04', duration: 600 },
      { date: '2026-10-05', duration: 1200 },
    ]);
  });

  it('keeps a 23:50 to 00:15 session on one day and the streak intact', async () => {
    await mockDb.insert(focusSessions).values([
      work('2026-10-03T21:00', 1500),
      work('2026-10-04T23:50', 600), // the 4th
      work('2026-10-05T00:15', 600), // still the 4th
    ]);
    at('2026-10-05T02:00'); // study day = the 4th
    const body = await stats(`?tz=${VN}`);
    expect(body.dailyFocus.find((d: { date: string }) => d.date === '2026-10-04').duration).toBe(1200);
    expect(body.summary.streak).toEqual({ current: 2, longest: 2 });
  });

  it('does not break the streak before the day ends, and breaks it after a missed day', async () => {
    await mockDb.insert(focusSessions).values([work('2026-10-03T10:00'), work('2026-10-04T10:00')]);
    at('2026-10-05T09:00'); // the 5th not studied yet: streak alive
    expect((await stats(`?tz=${VN}`)).summary.streak).toEqual({ current: 2, longest: 2 });
    at('2026-10-06T09:00'); // the 5th went by empty
    expect((await stats(`?tz=${VN}`)).summary.streak).toEqual({ current: 0, longest: 2 });
  });

  it('measures days in the zone sent by the client', async () => {
    // 07:30Z on 2026-03-08 is 03:30 EDT right after the New York spring forward: study day the 7th.
    await mockDb.insert(focusSessions).values({ userId: 'u1', mode: 'work', durationSec: 900, createdAt: new Date('2026-03-08T07:30:00Z') });
    vi.setSystemTime(new Date('2026-03-08T16:00:00Z'));
    const ny = await stats('?tz=America/New_York&startDate=2026-03-07&endDate=2026-03-08');
    expect(ny.dailyFocus).toEqual([
      { date: '2026-03-07', duration: 900 },
      { date: '2026-03-08', duration: 0 },
    ]);
    // The same instant is 07:30 UTC, after the 04:00 cut: the 8th.
    const utc = await stats('?startDate=2026-03-07&endDate=2026-03-08');
    expect(utc.dailyFocus).toEqual([
      { date: '2026-03-07', duration: 0 },
      { date: '2026-03-08', duration: 900 },
    ]);
  });

  it('aggregates a 12-week heatmap window in one response', async () => {
    await mockDb.insert(focusSessions).values([
      work('2026-07-20T10:00', 600),
      work('2026-07-20T11:00', 600),
      work('2026-10-05T10:00', 300),
    ]);
    const body = await stats(`?tz=${VN}&startDate=2026-07-20&endDate=2026-10-05`);
    expect(body.dailyFocus).toHaveLength(78);
    expect(body.dailyFocus[0]).toEqual({ date: '2026-07-20', duration: 1200 });
    expect(body.dailyFocus.at(-1)).toEqual({ date: '2026-10-05', duration: 300 });
  });
});

describe('GET /api/history', () => {
  beforeEach(async () => {
    const [{ id: taskId }] = await mockDb.insert(tasks).values({ userId: 'u1', title: 'Essay' }).returning({ id: tasks.id });
    await mockDb.insert(focusSessions).values([
      { ...work('2026-10-05T08:00', 1500), taskId },
      { userId: 'u1', mode: 'shortBreak', durationSec: 300, createdAt: vn('2026-10-05T08:30') },
      work('2026-10-04T09:00', 1500),
      work('2026-09-30T09:00', 600),
      { userId: 'u2', mode: 'work', durationSec: 9999, createdAt: vn('2026-10-05T08:00') },
    ]);
  });

  it('lists own sessions newest first with the task title', async () => {
    const { sessions } = await history();
    expect(sessions).toHaveLength(4);
    expect(sessions[0]).toMatchObject({ mode: 'shortBreak', duration: 300, tasks: null });
    expect(sessions[1]).toMatchObject({ mode: 'work', duration: 1500, tasks: { title: 'Essay' } });
    expect(sessions.at(-1).tasks).toBeNull();
  });

  it('filters by study days in the given zone', async () => {
    await mockDb.insert(focusSessions).values([work('2026-10-05T00:31'), work('2026-10-05T03:59'), work('2026-10-05T04:00', 777)]);
    const fourth = await history(`?tz=${VN}&startDate=2026-10-04&endDate=2026-10-04`);
    expect(durations(fourth)).toEqual([600, 600, 1500]);
    const fifth = await history(`?tz=${VN}&startDate=2026-10-05&endDate=2026-10-05`);
    expect(durations(fifth)).toEqual([300, 777, 1500]);
  });

  it('without tz it falls back to UTC study days', async () => {
    // 01:00 UTC on the 5th is 08:00 VN but still the 4th in UTC (before 04:00).
    await mockDb.insert(focusSessions).values({ userId: 'u1', mode: 'work', durationSec: 42, createdAt: new Date('2026-10-05T01:00:00Z') });
    const fourth = await history('?startDate=2026-10-04&endDate=2026-10-04');
    expect(fourth.sessions.map((s: { duration: number }) => s.duration)).toContain(42);
  });

  it('keeps the default limit, and a larger one for ranges', async () => {
    await mockDb.insert(focusSessions).values(
      Array.from({ length: 60 }, (_, i) => work(`2026-10-02T${String(10 + Math.floor(i / 6)).padStart(2, '0')}:${String((i % 6) * 10).padStart(2, '0')}`)),
    );
    expect((await history()).sessions).toHaveLength(50);
    expect((await history(`?tz=${VN}&startDate=2026-10-02&endDate=2026-10-02`)).sessions).toHaveLength(60);
  });

  it('rejects requests without a session', async () => {
    vi.mocked(getSessionUser).mockResolvedValue(null);
    expect((await HISTORY(new Request('http://localhost/api/history'))).status).toBe(401);
  });
});
