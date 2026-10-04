import { NextResponse } from 'next/server';
import { and, eq, sql } from 'drizzle-orm';
import { db } from '@/db';
import { focusSessions } from '@/db/schema';
import { getSessionUser } from '@/lib/auth/session-user';
import { serverError, unauthorized } from '@/lib/api/responses';
import { computeStreaks } from '@/lib/stats/streak';
import { addDays, eachDay, studyDayOf } from '@/lib/stats/study-day';
import { studyDaySql } from '@/lib/stats/study-day-sql';
import { parseStudyQuery, windowConditions } from '@/lib/stats/study-query';

const MAX_RANGE_DAYS = 366;
const DEFAULT_CHART_DAYS = 7;

export async function GET(request: Request) {
  const user = await getSessionUser();
  if (!user) return unauthorized();

  // Days are study days (04:00 local) in the viewer's `tz`; startDate/endDate are inclusive study days.
  const { tz, startDay, endDay, from, to } = parseStudyQuery(new URL(request.url).searchParams);
  const today = studyDayOf(new Date(), tz);

  // Days shown on the chart: the requested range, or the last 7 study days.
  const chartDays =
    startDay && endDay ? eachDay(startDay, endDay, MAX_RANGE_DAYS) : eachDay(addDays(today, 1 - DEFAULT_CHART_DAYS), today, DEFAULT_CHART_DAYS);
  const dailyFocus = new Map(chartDays.map((day) => [day, 0]));

  const studyDay = studyDaySql(focusSessions.createdAt, tz);
  const isRanged = Boolean(from || to);

  try {
    // One row per (study day, mode); GROUP BY positions, see studyDaySql.
    const [rows, activeDays] = await Promise.all([
      db
        .select({
          day: studyDay,
          mode: focusSessions.mode,
          seconds: sql<number>`coalesce(sum(${focusSessions.durationSec}), 0)::int`,
          sessions: sql<number>`count(*)::int`,
        })
        .from(focusSessions)
        .where(and(eq(focusSessions.userId, user.id), ...windowConditions(focusSessions.createdAt, { from, to })))
        .groupBy(sql`1`, sql`2`),
      // The streak looks at all time, so a narrow range needs its own query; without a range the rows above are all time.
      isRanged
        ? db
            .select({ day: studyDay })
            .from(focusSessions)
            .where(and(eq(focusSessions.userId, user.id), eq(focusSessions.mode, 'work')))
            .groupBy(sql`1`)
        : null,
    ]);

    const distribution = { work: 0, shortBreak: 0, longBreak: 0 };
    let completedSessions = 0;
    for (const { day, mode, seconds, sessions } of rows) {
      distribution[mode] += seconds;
      if (mode !== 'work') continue;
      completedSessions += sessions;
      if (dailyFocus.has(day)) dailyFocus.set(day, dailyFocus.get(day)! + seconds);
    }
    const workDays = activeDays ?? rows.filter((row) => row.mode === 'work');

    return NextResponse.json({
      summary: {
        totalFocusTime: distribution.work,
        completedSessions,
        streak: computeStreaks(workDays.map((row) => row.day), today),
      },
      dailyFocus: Array.from(dailyFocus, ([date, duration]) => ({ date, duration })),
      distribution: Object.entries(distribution).map(([name, value]) => ({ name, value })),
    });
  } catch (error) {
    return serverError('Failed to fetch statistics', error);
  }
}
