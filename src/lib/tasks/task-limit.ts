import { NextResponse } from 'next/server';
import { and, count, eq } from 'drizzle-orm';
import { db } from '@/db';
import { tasks } from '@/db/schema';
import { MAX_TASKS_PER_USER, TASK_LIMIT_CODE } from './task-limit-error';

// Live (not deleted) tasks and templates one account can hold: a bound on storage, far above real use.

/**
 * The check is not atomic with the insert, so two simultaneous creates can end a task or two over.
 * That is fine for a storage bound; it is not a quota to bill against.
 */
export async function isTaskLimitReached(userId: string): Promise<boolean> {
  const [{ total }] = await db
    .select({ total: count() })
    .from(tasks)
    .where(and(eq(tasks.userId, userId), eq(tasks.isDeleted, false)));
  return total >= MAX_TASKS_PER_USER;
}

/** HTTP 409; the client shows its own translated message for `code`. */
export const taskLimitResponse = () =>
  NextResponse.json(
    { error: 'Task limit reached', code: TASK_LIMIT_CODE, max: MAX_TASKS_PER_USER },
    { status: 409 },
  );
