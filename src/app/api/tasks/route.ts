import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import {
  validateCreateTask,
  type CreateTaskPayload,
} from './task-schemas'

const API_ROUTE_TOKEN = process.env.API_ROUTE_TOKEN

function missingSupabaseResponse() {
  return NextResponse.json(
    { error: 'Supabase client is not configured' },
    { status: 500 },
  )
}

function unauthorizedResponse() {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}

function isAuthorized(request: Request) {
  if (!API_ROUTE_TOKEN) return true
  const header = request.headers.get('authorization') || ''
  if (!header.startsWith('Bearer ')) return false
  const token = header.slice(7)
  return token === API_ROUTE_TOKEN
}

function validationErrorResponse(error: { message: string; details?: Record<string, string[]> }) {
  return NextResponse.json(
    { error: error.message, details: error.details },
    { status: 400 },
  )
}

function buildInsertPayload(
  userId: string,
  payload: CreateTaskPayload,
) {
  // Ensure user_id is a string (UUID from auth is already a string, but ensure consistency)
  return {
    user_id: String(userId),
    title: payload.title,
    description: payload.description,
    priority: payload.priority,
    estimate_pomodoros: payload.estimate_pomodoros,
    tags: payload.tags,
  }
}

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return unauthorizedResponse()
  }

  const userId = user.id

  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('user_id', String(userId))
    .eq('is_deleted', false)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching tasks:', {
      error,
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
      userId,
    })
    return NextResponse.json(
      { error: 'Failed to fetch tasks' },
      { status: 500 },
    )
  }

  return NextResponse.json({ tasks: data ?? [] })
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    if (!isAuthorized(request)) {
      return unauthorizedResponse()
    }
    // If authorized by token, we still need a user_id to create the task for.
    // The current implementation relies on user.id.
    // If we want to support token-based creation, we'd need to pass user_id in body.
    // For now, I will keep the restriction that user MUST be present.
    // The issue was that isAuthorized was running BEFORE checking for user session, potentially blocking valid users if they didn't have the token.
    return unauthorizedResponse()
  }

  const userId = user.id

  try {
    const body = await request.json()
    const parsed = validateCreateTask(body)

    if (!parsed.success) {
      return validationErrorResponse(parsed.error)
    }

    const payload = buildInsertPayload(userId, parsed.data)

    const { data, error } = await supabase
      .from('tasks')
      .insert(payload)
      .select('*')
      .single()

    if (error) {
      console.error('Error creating task:', {
        error,
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
        userId,
        payload,
      })
      return NextResponse.json(
        { 
          error: 'Failed to create task',
          details: error.message,
        },
        { status: 500 },
      )
    }

    return NextResponse.json({ task: data }, { status: 201 })
  } catch (error) {
    console.error('Error creating task', error)
    return NextResponse.json(
      { error: 'Failed to create task' },
      { status: 500 },
    )
  }
}

