import { NextResponse } from 'next/server';
import { and, eq } from 'drizzle-orm';
import { db } from '@/db';
import { tasks } from '@/db/schema';
import { getSessionUser } from '@/lib/auth/session-user';
import { notFound, serverError, unauthorized } from '@/lib/api/responses';
import { toTaskJson } from '@/lib/tasks/task-json';
import { isUuid } from '../../task-schemas';

type RouteParams = { params: Promise<{ id: string }> };

export async function POST(_request: Request, { params }: RouteParams) {
  const user = await getSessionUser();
  if (!user) return unauthorized();
  const { id } = await params;
  if (!isUuid(id)) return notFound('Task not found');

  try {
    const [original] = await db
      .select()
      .from(tasks)
      .where(and(eq(tasks.id, id), eq(tasks.userId, user.id)));
    if (!original) return notFound('Task not found');

    // A copy starts fresh: progress, time and status are reset.
    const [copy] = await db
      .insert(tasks)
      .values({
        userId: user.id,
        title: `${original.title} (Copy)`,
        description: original.description,
        priority: original.priority,
        estimatePomodoros: original.estimatePomodoros,
        tags: original.tags,
        dueDate: original.dueDate,
        displayOrder: original.displayOrder + 1,
      })
      .returning();
    return NextResponse.json({ task: toTaskJson(copy) }, { status: 201 });
  } catch (error) {
    return serverError('Failed to clone task', error);
  }
}
