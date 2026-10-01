import { NextResponse } from 'next/server';
import { and, eq, gte, sql, sum } from 'drizzle-orm';
import { db } from '@/db';
import { focusSessions, tasks } from '@/db/schema';
import { SESSION_MAX_TOTAL_SEC_PER_DAY } from '@/config/constants';
import { getSessionUser } from '@/lib/auth/session-user';
import { badRequest, readJson, serverError, unauthorized } from '@/lib/api/responses';
import { validateSessionCompletion } from './session-schemas';

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

// Client-reported sessions (phase 02). Replaced by server-issued sessions with
// heartbeats in plans/261001-2241-study-bro-v2/phase-04.
export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) return unauthorized();

  const body = await readJson(request);
  if (body === undefined) return badRequest('Request body must be valid JSON');
  const parsed = validateSessionCompletion(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error }, { status: 400 });
  const { taskId, durationSec, mode } = parsed.data;

  try {
    const since = new Date(Date.now() - ONE_DAY_MS);
    const [{ logged }] = await db
      .select({ logged: sum(focusSessions.durationSec).mapWith(Number) })
      .from(focusSessions)
      .where(and(eq(focusSessions.userId, user.id), gte(focusSessions.createdAt, since)));
    if ((logged ?? 0) + durationSec > SESSION_MAX_TOTAL_SEC_PER_DAY) {
      return NextResponse.json({ error: 'Daily session limit exceeded' }, { status: 429 });
    }

    // An unknown or foreign task id is not an error: the session is kept without a task.
    const ownedTask = taskId
      ? (
          await db
            .select({ id: tasks.id })
            .from(tasks)
            .where(and(eq(tasks.id, taskId), eq(tasks.userId, user.id)))
        )[0]
      : undefined;

    const session = await db.transaction(async (tx) => {
      const [row] = await tx
        .insert(focusSessions)
        .values({ userId: user.id, taskId: ownedTask?.id ?? null, mode, durationSec })
        .returning();
      if (ownedTask && mode === 'work') {
        await tx
          .update(tasks)
          .set({
            actualPomodoros: sql`${tasks.actualPomodoros} + 1`,
            timeSpentMs: sql`${tasks.timeSpentMs} + ${durationSec * 1000}`,
          })
          .where(eq(tasks.id, ownedTask.id));
      }
      return row;
    });
    return NextResponse.json({ session });
  } catch (error) {
    return serverError('Failed to record session completion', error);
  }
}
