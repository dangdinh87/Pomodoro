import { NextResponse } from 'next/server';
import { and, eq, gt, lte, sql, sum } from 'drizzle-orm';
import { db } from '@/db';
import { focusSessions, tasks } from '@/db/schema';
import { SESSION_LIMIT_CODE, SESSION_MAX_TOTAL_SEC_PER_DAY } from '@/config/constants';
import { getSessionUser } from '@/lib/auth/session-user';
import { badRequest, readJson, serverError, unauthorized } from '@/lib/api/responses';
import { resolveSessionEnd, validateSessionCompletion } from './session-schemas';

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
  const { taskId, durationSec, mode, completedFullSession, clientSessionId } = parsed.data;
  const endedAt = resolveSessionEnd(parsed.data.endedAt, Date.now());

  try {
    const outcome = await db.transaction(async (tx) => {
      // One writer per user at a time: the cap check below and the insert must
      // not interleave with another request of the same user (parallel POSTs
      // would all read the same total and slip past the cap). Released at commit.
      await tx.execute(sql`select pg_advisory_xact_lock(hashtext(${user.id}))`);

      // A retry of a session already stored (lost response, two tabs): acknowledge
      // without touching the task counters again.
      if (clientSessionId) {
        const [existing] = await tx
          .select({ id: focusSessions.id })
          .from(focusSessions)
          .where(and(eq(focusSessions.userId, user.id), eq(focusSessions.clientSessionId, clientSessionId)))
          .limit(1);
        if (existing) return { duplicate: true } as const;
      }

      // 24 hours of focus per rolling day, counted in the window that ends when
      // this session did (so backdating cannot dodge the cap)
      const [{ logged }] = await tx
        .select({ logged: sum(focusSessions.durationSec).mapWith(Number) })
        .from(focusSessions)
        .where(
          and(
            eq(focusSessions.userId, user.id),
            gt(focusSessions.createdAt, new Date(endedAt.getTime() - ONE_DAY_MS)),
            lte(focusSessions.createdAt, endedAt),
          ),
        );
      if ((logged ?? 0) + durationSec > SESSION_MAX_TOTAL_SEC_PER_DAY) return { limited: true } as const;

      // An unknown or foreign task id is not an error: the session is kept without a task.
      const ownedTask = taskId
        ? (
            await tx
              .select({ id: tasks.id })
              .from(tasks)
              .where(and(eq(tasks.id, taskId), eq(tasks.userId, user.id)))
          )[0]
        : undefined;

      const [row] = await tx
        .insert(focusSessions)
        .values({
          userId: user.id,
          taskId: ownedTask?.id ?? null,
          mode,
          durationSec,
          clientSessionId,
          createdAt: endedAt,
        })
        .onConflictDoNothing({ target: [focusSessions.userId, focusSessions.clientSessionId] })
        .returning();
      if (!row) return { duplicate: true } as const;

      if (ownedTask && mode === 'work') {
        await tx
          .update(tasks)
          .set({
            // Only a focus period that ran to its end counts as a pomodoro
            ...(completedFullSession && { actualPomodoros: sql`${tasks.actualPomodoros} + 1` }),
            timeSpentMs: sql`${tasks.timeSpentMs} + ${durationSec * 1000}`,
          })
          .where(eq(tasks.id, ownedTask.id));
      }
      return { session: row } as const;
    });

    if ('limited' in outcome) {
      return NextResponse.json({ error: 'Daily session limit exceeded', code: SESSION_LIMIT_CODE }, { status: 429 });
    }
    return NextResponse.json(outcome);
  } catch (error) {
    return serverError('Failed to record session completion', error);
  }
}
