/** @vitest-environment node */
import { sql } from 'drizzle-orm';
import { createTestDb, createTestUser, resetTestDb, type TestDb } from '@/test-utils/test-db';
import { focusSessions } from '@/db/schema';
import { studyDaySql } from './study-day-sql';
import { studyDayOf, studyDayRange } from './study-day';

let db: TestDb;

beforeAll(async () => {
  db = await createTestDb();
});

async function sqlDayOf(instant: Date, tz: string) {
  const { rows } = await db.execute(
    sql`select ${studyDaySql(sql`${instant.toISOString()}::timestamptz`, tz)} as day`,
  );
  return (rows[0] as { day: string }).day;
}

describe('studyDaySql', () => {
  it('agrees with studyDayOf around the 04:00 cut, DST changes and half-hour zones', async () => {
    const instants = [
      '2026-10-04T20:59:59Z', // 03:59:59 VN
      '2026-10-04T21:00:00Z', // 04:00 VN
      '2026-10-04T17:31:00Z', // 00:31 VN on the 5th
      '2026-03-08T07:30:00Z', // New York, 03:30 EDT right after the jump
      '2026-03-08T08:00:00Z',
      '2026-11-01T05:30:00Z', // New York, first 01:30
      '2026-11-01T06:30:00Z', // New York, second 01:30
      '2026-11-01T09:00:00Z',
      '2026-12-31T22:30:00Z',
    ].map((iso) => new Date(iso));
    for (const tz of ['Asia/Ho_Chi_Minh', 'America/New_York', 'UTC', 'Asia/Kolkata', 'Australia/Lord_Howe', 'Pacific/Kiritimati']) {
      for (const instant of instants) {
        expect(await sqlDayOf(instant, tz), `${tz} ${instant.toISOString()}`).toBe(studyDayOf(instant, tz));
      }
    }
  });

  it('binds the zone as a parameter', async () => {
    await expect(sqlDayOf(new Date(), "UTC'; select 1; --")).rejects.toThrow();
  });

  it('groups by output position in a real query', async () => {
    await resetTestDb(db);
    await createTestUser(db, 'u1');
    await db.insert(focusSessions).values([
      { userId: 'u1', mode: 'work', durationSec: 60, createdAt: new Date('2026-10-04T17:31:00Z') }, // 00:31 VN, study day 10-04
      { userId: 'u1', mode: 'work', durationSec: 120, createdAt: new Date('2026-10-04T16:50:00Z') }, // 23:50 VN, study day 10-04
      { userId: 'u1', mode: 'work', durationSec: 300, createdAt: new Date('2026-10-05T02:00:00Z') }, // 09:00 VN, study day 10-05
    ]);
    const day = studyDaySql(focusSessions.createdAt, 'Asia/Ho_Chi_Minh');
    const rows = await db
      .select({ day, seconds: sql<number>`sum(${focusSessions.durationSec})::int` })
      .from(focusSessions)
      .groupBy(sql`1`)
      .orderBy(sql`1`);
    expect(rows).toEqual([
      { day: '2026-10-04', seconds: 180 },
      { day: '2026-10-05', seconds: 300 },
    ]);
  });

  it('matches the instants of studyDayRange', async () => {
    const { start, end } = studyDayRange('2026-03-07', 'America/New_York');
    expect(await sqlDayOf(start, 'America/New_York')).toBe('2026-03-07');
    expect(await sqlDayOf(new Date(start.getTime() - 1), 'America/New_York')).toBe('2026-03-06');
    expect(await sqlDayOf(new Date(end.getTime() - 1), 'America/New_York')).toBe('2026-03-07');
    expect(await sqlDayOf(end, 'America/New_York')).toBe('2026-03-08');
  });
});
