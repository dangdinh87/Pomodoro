import { NextResponse } from 'next/server';
import { and, desc, eq, type SQL } from 'drizzle-orm';
import { db } from '@/db';
import { focusSessions, tasks } from '@/db/schema';
import { getSessionUser } from '@/lib/auth/session-user';
import { serverError, unauthorized } from '@/lib/api/responses';
import { parseStudyQuery, windowConditions } from '@/lib/stats/study-query';

const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 1000;

export async function GET(request: Request) {
  const user = await getSessionUser();
  if (!user) return unauthorized();

  // startDate/endDate are study days (04:00 local) in the viewer's `tz`.
  const { from, to } = parseStudyQuery(new URL(request.url).searchParams);
  const conditions: SQL[] = [eq(focusSessions.userId, user.id), ...windowConditions(focusSessions.createdAt, { from, to })];

  try {
    const rows = await db
      .select({ session: focusSessions, taskTitle: tasks.title })
      .from(focusSessions)
      .leftJoin(tasks, eq(tasks.id, focusSessions.taskId))
      .where(and(...conditions))
      .orderBy(desc(focusSessions.createdAt))
      .limit(from || to ? MAX_LIMIT : DEFAULT_LIMIT);

    return NextResponse.json({
      sessions: rows.map(({ session, taskTitle }) => ({
        id: session.id,
        task_id: session.taskId,
        mode: session.mode,
        duration: session.durationSec,
        created_at: session.createdAt,
        tasks: taskTitle === null ? null : { title: taskTitle },
      })),
    });
  } catch (error) {
    return serverError('Failed to fetch sessions', error);
  }
}
