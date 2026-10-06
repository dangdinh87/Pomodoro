import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { focusSessions, tasks, user as users, userTags } from '@/db/schema';
import { getSessionUser } from '@/lib/auth/session-user';
import { sameOriginJsonGuard } from '@/lib/api/same-origin-json-guard';
import { consumeRateLimit } from '@/lib/api/in-memory-rate-limiter';
import { serverError, unauthorized } from '@/lib/api/responses';
import { toTaskJson } from '@/lib/tasks/task-json';
import { isValidTimeZone, studyDayOf } from '@/lib/stats/study-day';

const EXPORT_LIMIT = 3;
const EXPORT_WINDOW_MS = 60 * 60 * 1000;

export async function GET(request: Request) {
  const blocked = sameOriginJsonGuard(request);
  if (blocked) return blocked;

  const user = await getSessionUser();
  if (!user) return unauthorized();

  const limit = consumeRateLimit(`account-export:${user.id}`, EXPORT_LIMIT, EXPORT_WINDOW_MS);
  if (!limit.allowed) {
    return NextResponse.json(
      { error: 'Too many export requests' },
      { status: 429, headers: { 'Retry-After': String(limit.retryAfterSec) } },
    );
  }

  try {
    const [[account], taskRows, sessionRows, [tagRow]] = await Promise.all([
      db
        .select({ id: users.id, email: users.email, name: users.name, createdAt: users.createdAt })
        .from(users)
        .where(eq(users.id, user.id)),
      db.select().from(tasks).where(eq(tasks.userId, user.id)),
      db.select().from(focusSessions).where(eq(focusSessions.userId, user.id)),
      db.select({ tags: userTags.tags }).from(userTags).where(eq(userTags.userId, user.id)),
    ]);

    const payload = {
      exportedAt: new Date().toISOString(),
      account: account ?? null,
      tasks: taskRows.map(toTaskJson),
      sessions: sessionRows,
      tags: tagRow?.tags ?? [],
    };
    // File name date: the study day (04:00 local) in the viewer's zone when `tz` is sent, else the UTC date.
    const now = new Date();
    const tz = new URL(request.url).searchParams.get('tz');
    const date = isValidTimeZone(tz) ? studyDayOf(now, tz) : now.toISOString().slice(0, 10);
    return new NextResponse(JSON.stringify(payload, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Content-Disposition': `attachment; filename="studybro-data-${date}.json"`,
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    return serverError('Failed to export data', error);
  }
}
