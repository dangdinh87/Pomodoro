import { NextResponse } from 'next/server';
import { and, eq } from 'drizzle-orm';
import { db } from '@/db';
import { tasks } from '@/db/schema';
import { getSessionUser } from '@/lib/auth/session-user';
import { badRequest, notFound, readJson, serverError, unauthorized } from '@/lib/api/responses';
import { toTaskJson } from '@/lib/tasks/task-json';
import { isUuid, validateUpdateTask, type UpdateTaskPayload } from '../task-schemas';

type RouteParams = { params: Promise<{ id: string }> };

function toColumns(payload: UpdateTaskPayload): Partial<typeof tasks.$inferInsert> {
  const columns: Partial<typeof tasks.$inferInsert> = {};
  if (payload.title !== undefined) columns.title = payload.title;
  if (payload.description !== undefined) columns.description = payload.description;
  if (payload.priority !== undefined) columns.priority = payload.priority;
  if (payload.estimate_pomodoros !== undefined) columns.estimatePomodoros = payload.estimate_pomodoros;
  if (payload.tags !== undefined) columns.tags = payload.tags;
  if (payload.status !== undefined) columns.status = payload.status;
  if (payload.due_date !== undefined) columns.dueDate = payload.due_date ? new Date(payload.due_date) : null;
  if (payload.display_order !== undefined) columns.displayOrder = payload.display_order;
  if (payload.is_template !== undefined) columns.isTemplate = payload.is_template;
  return columns;
}

export async function PATCH(request: Request, { params }: RouteParams) {
  const user = await getSessionUser();
  if (!user) return unauthorized();
  const { id } = await params;
  if (!isUuid(id)) return notFound('Task not found');

  const body = await readJson(request);
  if (body === undefined) return badRequest('Request body must be valid JSON');
  const parsed = validateUpdateTask(body);
  if (!parsed.success) return badRequest(parsed.error.message, parsed.error.details);

  try {
    const [task] = await db
      .update(tasks)
      .set(toColumns(parsed.data))
      .where(and(eq(tasks.id, id), eq(tasks.userId, user.id)))
      .returning();
    return task ? NextResponse.json({ task: toTaskJson(task) }) : notFound('Task not found');
  } catch (error) {
    return serverError('Failed to update task', error);
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  const user = await getSessionUser();
  if (!user) return unauthorized();
  const { id } = await params;
  if (!isUuid(id)) return notFound('Task not found');
  const owned = and(eq(tasks.id, id), eq(tasks.userId, user.id));

  try {
    if (new URL(request.url).searchParams.get('hard') === 'true') {
      await db.delete(tasks).where(owned);
      return NextResponse.json({ ok: true });
    }
    const [task] = await db.update(tasks).set({ isDeleted: true }).where(owned).returning();
    return task ? NextResponse.json({ task: toTaskJson(task) }) : notFound('Task not found');
  } catch (error) {
    return serverError('Failed to delete task', error);
  }
}
