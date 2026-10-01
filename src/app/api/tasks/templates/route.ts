import { NextResponse } from 'next/server';
import { and, desc, eq } from 'drizzle-orm';
import { db } from '@/db';
import { tasks } from '@/db/schema';
import { getSessionUser } from '@/lib/auth/session-user';
import { serverError, unauthorized } from '@/lib/api/responses';
import { toTaskJson } from '@/lib/tasks/task-json';

export async function GET() {
  const user = await getSessionUser();
  if (!user) return unauthorized();

  try {
    const rows = await db
      .select()
      .from(tasks)
      .where(and(eq(tasks.userId, user.id), eq(tasks.isTemplate, true), eq(tasks.isDeleted, false)))
      .orderBy(desc(tasks.createdAt));
    return NextResponse.json({ templates: rows.map(toTaskJson) });
  } catch (error) {
    return serverError('Failed to load templates', error);
  }
}
