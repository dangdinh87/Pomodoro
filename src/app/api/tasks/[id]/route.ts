import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import {
  validateUpdateTask,
  type UpdateTaskPayload,
} from '../task-schemas'

const API_ROUTE_TOKEN = process.env.API_ROUTE_TOKEN

function unauthorizedResponse() {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}

function isAuthorized(request: Request) {
  if (!API_ROUTE_TOKEN) return true
  const header = request.headers.get('authorization') || ''
  if (!header.startsWith('Bearer ')) return false
  return header.slice(7) === API_ROUTE_TOKEN
}

function validationErrorResponse(error: { message: string; details?: Record<string, string[]> }) {
  return NextResponse.json(
    { error: error.message, details: error.details },
    { status: 400 },
  )
}

function buildUpdatePayload(payload: UpdateTaskPayload) {
  const updates: Record<string, unknown> = {}
  if (payload.title !== undefined) updates.title = payload.title
  if (payload.description !== undefined) updates.description = payload.description
  if (payload.priority !== undefined) updates.priority = payload.priority
  if (payload.estimate_pomodoros !== undefined) {
    updates.estimate_pomodoros = payload.estimate_pomodoros
  }
  if (payload.tags !== undefined) updates.tags = payload.tags
  if (payload.status !== undefined) updates.status = payload.status
  updates.updated_at = new Date().toISOString()
  return updates
}

interface RouteParams {
  params: {
    id: string
  }
}

export async function PATCH(request: Request, { params }: RouteParams) {
  if (!isAuthorized(request)) {
    return unauthorizedResponse()
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return unauthorizedResponse()
  }

  const userId = user.id
  const { id } = params

  try {
    const body = await request.json()
    const parsed = validateUpdateTask(body)

    if (!parsed.success) {
      return validationErrorResponse(parsed.error)
    }

    const updates = buildUpdatePayload(parsed.data)

    const { data, error } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', id)
      .eq('user_id', userId)
      .select('*')
      .single()

    if (error) {
      console.error('Error updating task', error)
      return NextResponse.json(
        { error: 'Failed to update task' },
        { status: 500 },
      )
    }

    return NextResponse.json({ task: data })
  } catch (error) {
    console.error('Error updating task', error)
    return NextResponse.json(
      { error: 'Failed to update task' },
      { status: 500 },
    )
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  if (!isAuthorized(request)) {
    return unauthorizedResponse()
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return unauthorizedResponse()
  }

  const userId = user.id
  const { id } = params
  const { searchParams } = new URL(request.url)
  const hard = searchParams.get('hard') === 'true'

  try {
    if (hard) {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id)
        .eq('user_id', userId)

      if (error) {
        console.error('Error hard-deleting task', error)
        return NextResponse.json(
          { error: 'Failed to delete task' },
          { status: 500 },
        )
      }

      return NextResponse.json({ ok: true })
    }

    const { data, error } = await supabase
      .from('tasks')
      .update({ is_deleted: true })
      .eq('id', id)
      .eq('user_id', userId)
      .select('*')
      .single()

    if (error) {
      console.error('Error soft-deleting task', error)
      return NextResponse.json(
        { error: 'Failed to delete task' },
        { status: 500 },
      )
    }

    return NextResponse.json({ task: data })
  } catch (error) {
    console.error('Error deleting task', error)
    return NextResponse.json(
      { error: 'Failed to delete task' },
      { status: 500 },
    )
  }
}

