import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { tasks } = body

    if (!Array.isArray(tasks) || tasks.length === 0) {
      return NextResponse.json(
        { error: 'Tasks array is required' },
        { status: 400 }
      )
    }

    // Validate each task has id and displayOrder
    for (const task of tasks) {
      if (!task.id || typeof task.displayOrder !== 'number') {
        return NextResponse.json(
          { error: 'Each task must have id and displayOrder' },
          { status: 400 }
        )
      }
    }

    // Update each task's display_order
    const updates = tasks.map(({ id, displayOrder }) =>
      supabase
        .from('tasks')
        .update({ display_order: displayOrder, updated_at: new Date().toISOString() })
        .eq('id', id)
        .eq('user_id', user.id)
    )

    const results = await Promise.all(updates)

    // Check for any errors
    const errors = results.filter(r => r.error)
    if (errors.length > 0) {
      console.error('Error reordering tasks:', errors)
      return NextResponse.json(
        { error: 'Failed to reorder some tasks' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error reordering tasks:', error)
    return NextResponse.json(
      { error: 'Failed to reorder tasks' },
      { status: 500 }
    )
  }
}
