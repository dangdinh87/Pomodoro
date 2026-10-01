import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import {
  isValidTagFilter,
  sanitizeSearchTerm,
  validateCreateTask,
  type CreateTaskPayload,
} from './task-schemas';
import { isTaskOwnedByUser } from './task-ownership';

const DEFAULT_PAGE_SIZE = 10;
const MAX_PAGE_SIZE = 100;
// Far beyond any real task list; keeps the computed offset sane
const MAX_PAGE = 10_000;
const FILTERABLE_DATE_FIELDS = ['created_at', 'updated_at', 'due_date'] as const;

function unauthorizedResponse() {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}

function validationErrorResponse(error: {
  message: string;
  details?: Record<string, string[]>;
}) {
  return NextResponse.json(
    { error: error.message, details: error.details },
    { status: 400 },
  );
}

function parsePositiveInt(value: string | null, fallback: number, max: number) {
  const parsed = Number.parseInt(value ?? '', 10);
  if (!Number.isFinite(parsed) || parsed < 1) return fallback;
  return Math.min(parsed, max);
}

function parseDateField(value: string | null) {
  return FILTERABLE_DATE_FIELDS.find((field) => field === value) ?? 'created_at';
}

function parseDateParam(value: string | null) {
  return value && !Number.isNaN(Date.parse(value)) ? value : null;
}

function buildInsertPayload(userId: string, payload: CreateTaskPayload) {
  // Ensure user_id is a string (UUID from auth is already a string, but ensure consistency)
  // Base payload with required fields that always exist
  // Note: status is NOT included - database has a DEFAULT value
  const basePayload: Record<string, any> = {
    user_id: String(userId),
    title: payload.title,
    description: payload.description,
    priority: payload.priority,
    estimate_pomodoros: payload.estimate_pomodoros,
    tags: payload.tags,
  };

  // Only add new fields if they have values (prevents errors if columns don't exist yet)
  if (payload.due_date) {
    basePayload.due_date = payload.due_date;
  }
  if (payload.parent_task_id) {
    basePayload.parent_task_id = payload.parent_task_id;
  }
  if (payload.is_template) {
    basePayload.is_template = payload.is_template;
  }

  return basePayload;
}

export async function GET(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return unauthorizedResponse();
  }

  const userId = user.id;

  const { searchParams } = new URL(request.url);
  const limit = parsePositiveInt(searchParams.get('limit'), DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE);
  const page = parsePositiveInt(searchParams.get('page'), 1, MAX_PAGE);
  const offset = (page - 1) * limit;

  // Filter parameters
  const q = sanitizeSearchTerm(searchParams.get('q'));
  const status = searchParams.get('status');
  const priority = searchParams.get('priority');
  const tag = searchParams.get('tag');
  const from = parseDateParam(searchParams.get('from'));
  const to = parseDateParam(searchParams.get('to'));
  const dateField = parseDateField(searchParams.get('dateField'));

  if (tag && tag !== 'all' && !isValidTagFilter(tag)) {
    return validationErrorResponse({ message: 'Invalid tag filter' });
  }

  // Simple query that works with or without new columns
  let query = supabase
    .from('tasks')
    .select('*', { count: 'exact' })
    .eq('user_id', String(userId))
    .eq('is_deleted', false);

  if (q) {
    query = query.or(`title.ilike.%${q}%,description.ilike.%${q}%`);
  }
  if (status && status !== 'all') {
    query = query.eq('status', status.toUpperCase());
  }
  if (priority && priority !== 'all') {
    query = query.eq('priority', priority.toUpperCase());
  }
  if (tag && tag !== 'all') {
    query = query.contains('tags', [tag]);
  }
  if (from) {
    query = query.gte(dateField, from);
  }
  if (to) {
    query = query.lte(dateField, to);
  }

  const { data, error, count } = await query
    .order('display_order', { ascending: true })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error('Error fetching tasks:', {
      error,
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
      userId,
    });
    return NextResponse.json(
      { error: 'Failed to fetch tasks' },
      { status: 500 },
    );
  }

  return NextResponse.json({
    tasks: data ?? [],
    total: count ?? 0,
    page,
    limit,
  });
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return unauthorizedResponse();
  }

  const userId = user.id;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return validationErrorResponse({ message: 'Request body must be valid JSON' });
  }

  try {
    const parsed = validateCreateTask(body);

    if (!parsed.success) {
      return validationErrorResponse(parsed.error);
    }

    if (
      parsed.data.parent_task_id &&
      !(await isTaskOwnedByUser(supabase, parsed.data.parent_task_id, userId))
    ) {
      return validationErrorResponse({
        message: 'Invalid task data',
        details: { parent_task_id: ['Parent task not found'] },
      });
    }

    const payload = buildInsertPayload(userId, parsed.data);

    const { data, error } = await supabase
      .from('tasks')
      .insert(payload)
      .select('*')
      .single();

    if (error) {
      console.error('Error creating task:', {
        error,
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
        userId,
        payload,
      });
      return NextResponse.json(
        { error: 'Failed to create task' },
        { status: 500 },
      );
    }

    return NextResponse.json({ task: data }, { status: 201 });
  } catch (error) {
    console.error('Error creating task', error);
    return NextResponse.json(
      { error: 'Failed to create task' },
      { status: 500 },
    );
  }
}
