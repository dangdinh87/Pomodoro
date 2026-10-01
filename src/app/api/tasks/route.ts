import { NextResponse } from 'next/server';
import { and, arrayContains, asc, count, desc, eq, gte, ilike, lte, or, type SQL } from 'drizzle-orm';
import { db } from '@/db';
import { tasks } from '@/db/schema';
import { getSessionUser } from '@/lib/auth/session-user';
import { badRequest, readJson, serverError, unauthorized } from '@/lib/api/responses';
import { toTaskJson } from '@/lib/tasks/task-json';
import { isValidTagFilter, sanitizeSearchTerm, validateCreateTask } from './task-schemas';

const DEFAULT_PAGE_SIZE = 10;
const MAX_PAGE_SIZE = 100;
// Far beyond any real task list; keeps the computed offset sane
const MAX_PAGE = 10_000;
const DATE_FIELDS = {
  created_at: tasks.createdAt,
  updated_at: tasks.updatedAt,
  due_date: tasks.dueDate,
} as const;
const STATUSES = ['TODO', 'DOING', 'DONE'] as const;
const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH'] as const;

function parsePositiveInt(value: string | null, fallback: number, max: number) {
  const parsed = Number.parseInt(value ?? '', 10);
  if (!Number.isFinite(parsed) || parsed < 1) return fallback;
  return Math.min(parsed, max);
}

function parseDate(value: string | null) {
  return value && !Number.isNaN(Date.parse(value)) ? new Date(value) : null;
}

function pick<T extends string>(values: readonly T[], raw: string | null): T | null {
  const upper = raw?.toUpperCase();
  return values.find((v) => v === upper) ?? null;
}

export async function GET(request: Request) {
  const user = await getSessionUser();
  if (!user) return unauthorized();

  const { searchParams } = new URL(request.url);
  const limit = parsePositiveInt(searchParams.get('limit'), DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE);
  const page = parsePositiveInt(searchParams.get('page'), 1, MAX_PAGE);
  const q = sanitizeSearchTerm(searchParams.get('q'));
  const tag = searchParams.get('tag');
  const status = pick(STATUSES, searchParams.get('status'));
  const priority = pick(PRIORITIES, searchParams.get('priority'));
  const dateField =
    DATE_FIELDS[searchParams.get('dateField') as keyof typeof DATE_FIELDS] ?? DATE_FIELDS.created_at;
  const from = parseDate(searchParams.get('from'));
  const to = parseDate(searchParams.get('to'));

  if (tag && tag !== 'all' && !isValidTagFilter(tag)) {
    return badRequest('Invalid tag filter');
  }

  const conditions: (SQL | undefined)[] = [eq(tasks.userId, user.id), eq(tasks.isDeleted, false)];
  if (q) conditions.push(or(ilike(tasks.title, `%${q}%`), ilike(tasks.description, `%${q}%`)));
  if (status) conditions.push(eq(tasks.status, status));
  if (priority) conditions.push(eq(tasks.priority, priority));
  if (tag && tag !== 'all') conditions.push(arrayContains(tasks.tags, [tag]));
  if (from) conditions.push(gte(dateField, from));
  if (to) conditions.push(lte(dateField, to));
  const where = and(...conditions);

  try {
    const [rows, [{ total }]] = await Promise.all([
      db
        .select()
        .from(tasks)
        .where(where)
        .orderBy(asc(tasks.displayOrder), desc(tasks.createdAt))
        .limit(limit)
        .offset((page - 1) * limit),
      db.select({ total: count() }).from(tasks).where(where),
    ]);
    return NextResponse.json({ tasks: rows.map(toTaskJson), total, page, limit });
  } catch (error) {
    return serverError('Failed to fetch tasks', error);
  }
}

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) return unauthorized();

  const body = await readJson(request);
  if (body === undefined) return badRequest('Request body must be valid JSON');

  const parsed = validateCreateTask(body);
  if (!parsed.success) return badRequest(parsed.error.message, parsed.error.details);

  const { title, description, priority, estimate_pomodoros, tags: taskTags, due_date, is_template } =
    parsed.data;
  try {
    const [task] = await db
      .insert(tasks)
      .values({
        userId: user.id,
        title,
        description,
        priority,
        estimatePomodoros: estimate_pomodoros,
        tags: taskTags,
        dueDate: due_date ? new Date(due_date) : null,
        isTemplate: Boolean(is_template),
      })
      .returning();
    return NextResponse.json({ task: toTaskJson(task) }, { status: 201 });
  } catch (error) {
    return serverError('Failed to create task', error);
  }
}
