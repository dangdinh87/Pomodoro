import { NextResponse } from 'next/server';
import { and, desc, eq, gte, lt, type SQL } from 'drizzle-orm';
import { db } from '@/db';
import { focusSessions, tasks } from '@/db/schema';
import { getSessionUser } from '@/lib/auth/session-user';
import { serverError, unauthorized } from '@/lib/api/responses';

const DAY_MS = 24 * 60 * 60 * 1000;
const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 1000;

function parseDay(value: string | null) {
  return value && /^\d{4}-\d{2}-\d{2}$/.test(value) ? new Date(`${value}T00:00:00Z`) : null;
}

export async function GET(request: Request) {
  const user = await getSessionUser();
  if (!user) return unauthorized();

  const { searchParams } = new URL(request.url);
  const startDate = parseDay(searchParams.get('startDate'));
  const endDate = parseDay(searchParams.get('endDate'));
  const conditions: SQL[] = [eq(focusSessions.userId, user.id)];
  if (startDate) conditions.push(gte(focusSessions.createdAt, startDate));
  if (endDate) conditions.push(lt(focusSessions.createdAt, new Date(endDate.getTime() + DAY_MS)));

  try {
    const rows = await db
      .select({ session: focusSessions, taskTitle: tasks.title })
      .from(focusSessions)
      .leftJoin(tasks, eq(tasks.id, focusSessions.taskId))
      .where(and(...conditions))
      .orderBy(desc(focusSessions.createdAt))
      .limit(startDate || endDate ? MAX_LIMIT : DEFAULT_LIMIT);

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
