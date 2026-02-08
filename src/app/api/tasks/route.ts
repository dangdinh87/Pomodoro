import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import { validateCreateTask, type CreateTaskPayload } from './task-schemas';

const API_ROUTE_TOKEN = process.env.API_ROUTE_TOKEN;

function missingSupabaseResponse() {
  return NextResponse.json(
    { error: 'Supabase client is not configured' },
    { status: 500 },
  );
}

function unauthorizedResponse() {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}

function isAuthorized(request: Request) {
  if (!API_ROUTE_TOKEN) return true;
  const header = request.headers.get('authorization') || '';
  if (!header.startsWith('Bearer ')) return false;
  const token = header.slice(7);
  return token === API_ROUTE_TOKEN;
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
  const limit = parseInt(searchParams.get('limit') || '10');
  const page = parseInt(searchParams.get('page') || '1');
  const offset = (page - 1) * limit;

  // Filter parameters
  const q = searchParams.get('q');
  const status = searchParams.get('status');
  const priority = searchParams.get('priority');
  const tag = searchParams.get('tag');
  const from = searchParams.get('from');
  const to = searchParams.get('to');
  const dateField = searchParams.get('dateField') || 'created_at'; // Default to created_at

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
    if (!isAuthorized(request)) {
      return unauthorizedResponse();
    }
    // If authorized by token, we still need a user_id to create the task for.
    // The current implementation relies on user.id.
    // If we want to support token-based creation, we'd need to pass user_id in body.
    // For now, I will keep the restriction that user MUST be present.
    // The issue was that isAuthorized was running BEFORE checking for user session, potentially blocking valid users if they didn't have the token.
    return unauthorizedResponse();
  }

  const userId = user.id;

  try {
    const body = await request.json();
    const parsed = validateCreateTask(body);

    if (!parsed.success) {
      return validationErrorResponse(parsed.error);
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
        {
          error: 'Failed to create task',
          details: error.message,
        },
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
