import { NextResponse } from 'next/server';
import { and, eq } from 'drizzle-orm';
import { db } from '@/db';
import { tasks } from '@/db/schema';
import { getSessionUser } from '@/lib/auth/session-user';
import { badRequest, readJson, serverError, unauthorized } from '@/lib/api/responses';
import { isUuid } from '../task-schemas';

const MAX_REORDER = 500;

type OrderUpdate = { id: string; displayOrder: number };

const isOrderUpdate = (value: unknown): value is OrderUpdate =>
  !!value &&
  typeof value === 'object' &&
  isUuid((value as OrderUpdate).id) &&
  Number.isInteger((value as OrderUpdate).displayOrder);

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) return unauthorized();

  const body = (await readJson(request)) as { tasks?: unknown } | undefined;
  const updates = body?.tasks;
  if (!Array.isArray(updates) || updates.length === 0 || updates.length > MAX_REORDER) {
    return badRequest('Tasks array is required');
  }
  if (!updates.every(isOrderUpdate)) {
    return badRequest('Each task must have id and displayOrder');
  }

  try {
    await db.transaction(async (tx) => {
      for (const { id, displayOrder } of updates) {
        await tx
          .update(tasks)
          .set({ displayOrder })
          .where(and(eq(tasks.id, id), eq(tasks.userId, user.id)));
      }
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return serverError('Failed to reorder tasks', error);
  }
}
