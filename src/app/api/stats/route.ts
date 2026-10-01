import { NextResponse } from 'next/server';
import { and, eq, gte, lt, sql, type SQL } from 'drizzle-orm';
import { db } from '@/db';
import { focusSessions } from '@/db/schema';
import { getSessionUser } from '@/lib/auth/session-user';
import { serverError, unauthorized } from '@/lib/api/responses';
import { computeStreaks } from '@/lib/stats/streak';

const DAY_MS = 24 * 60 * 60 * 1000;
const MAX_RANGE_DAYS = 366;
// Days are UTC calendar days for now; plans/261001-2241-study-bro-v2 §5.2 moves them to 04:00 Vietnam time.
const isoDay = (date: Date) => date.toISOString().slice(0, 10);

function parseDay(value: string | null) {
  return value && /^\d{4}-\d{2}-\d{2}$/.test(value) ? new Date(`${value}T00:00:00Z`) : null;
}

export async function GET(request: Request) {
  const user = await getSessionUser();
  if (!user) return unauthorized();

  const { searchParams } = new URL(request.url);
  const startDate = parseDay(searchParams.get('startDate'));
  const endDate = parseDay(searchParams.get('endDate'));

  // Days shown on the chart: the requested range, or the last 7 days.
  const today = new Date(`${isoDay(new Date())}T00:00:00Z`);
  const first = startDate && endDate ? startDate : new Date(today.getTime() - 6 * DAY_MS);
  const last = startDate && endDate ? endDate : today;
  const dailyFocus = new Map<string, number>();
  for (let t = first.getTime(), n = 0; t <= last.getTime() && n < MAX_RANGE_DAYS; t += DAY_MS, n++) {
    dailyFocus.set(isoDay(new Date(t)), 0);
  }

  const conditions: SQL[] = [eq(focusSessions.userId, user.id)];
  if (startDate) conditions.push(gte(focusSessions.createdAt, startDate));
  if (endDate) conditions.push(lt(focusSessions.createdAt, new Date(endDate.getTime() + DAY_MS)));

  try {
    const [sessions, activeDays] = await Promise.all([
      db
        .select({ duration: focusSessions.durationSec, mode: focusSessions.mode, createdAt: focusSessions.createdAt })
        .from(focusSessions)
        .where(and(...conditions)),
      db
        .selectDistinct({ day: sql<string>`to_char(${focusSessions.createdAt} at time zone 'UTC', 'YYYY-MM-DD')` })
        .from(focusSessions)
        .where(and(eq(focusSessions.userId, user.id), eq(focusSessions.mode, 'work'))),
    ]);

    const distribution = { work: 0, shortBreak: 0, longBreak: 0 };
    let totalFocusTime = 0;
    let completedSessions = 0;
    for (const { duration, mode, createdAt } of sessions) {
      distribution[mode] += duration;
      if (mode !== 'work') continue;
      totalFocusTime += duration;
      completedSessions++;
      const day = isoDay(createdAt);
      if (dailyFocus.has(day)) dailyFocus.set(day, dailyFocus.get(day)! + duration);
    }

    return NextResponse.json({
      summary: {
        totalFocusTime,
        completedSessions,
        streak: computeStreaks(activeDays.map((d) => d.day), isoDay(today)),
      },
      dailyFocus: Array.from(dailyFocus, ([date, duration]) => ({ date, duration })),
      distribution: Object.entries(distribution).map(([name, value]) => ({ name, value })),
    });
  } catch (error) {
    return serverError('Failed to fetch statistics', error);
  }
}
