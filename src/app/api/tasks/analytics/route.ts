import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

export async function GET(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const userId = user.id
  const { searchParams } = new URL(request.url)
  const range = searchParams.get('range') ?? 'week'

  const now = new Date()
  let from: Date

  if (range === 'month') {
    from = new Date(now.getFullYear(), now.getMonth(), 1)
  } else if (range === 'day') {
    from = startOfDay(now)
  } else {
    // week
    from = new Date(now)
    from.setDate(now.getDate() - 7)
  }

  try {
    const [{ data: tasks, error: tasksError }, { data: sessions, error: sessionsError }] =
      await Promise.all([
        supabase
          .from('tasks')
          .select('*')
          .eq('user_id', userId)
          .eq('is_deleted', false),
        supabase
          .from('sessions')
          .select('*')
          .eq('user_id', userId)
          .gte('created_at', from.toISOString())
          .order('created_at', { ascending: true }),
      ])

    if (tasksError || sessionsError) {
      console.error('Error fetching analytics data', tasksError ?? sessionsError)
      return NextResponse.json(
        { error: 'Failed to fetch analytics data' },
        { status: 500 },
      )
    }

    const safeTasks = tasks ?? []
    const safeSessions = sessions ?? []

    // Aggregate work time per day
    const workByDay: Record<string, number> = {}
    const workByTask: Record<
      string,
      { timeSec: number; pomodoros: number }
    > = {}

    for (const s of safeSessions) {
      if (s.mode !== 'work') continue
      const createdAt = new Date(s.created_at)
      const dayKey = startOfDay(createdAt).toISOString().slice(0, 10)
      workByDay[dayKey] = (workByDay[dayKey] ?? 0) + s.duration

      if (s.task_id) {
        const entry = workByTask[s.task_id] ?? { timeSec: 0, pomodoros: 0 }
        entry.timeSec += s.duration
        entry.pomodoros += 1
        workByTask[s.task_id] = entry
      }
    }

    const tasksWithAggregates = safeTasks.map((t) => {
      const extra = workByTask[t.id] ?? { timeSec: 0, pomodoros: 0 }
      const estimated = t.estimate_pomodoros ?? 0
      const actual = t.actual_pomodoros ?? 0

      let completionPercent = 0
      if (estimated > 0) {
        completionPercent = Math.min(
          100,
          Math.round((actual / estimated) * 100),
        )
      }

      return {
        ...t,
        aggregatedPomodoros: extra.pomodoros,
        aggregatedTimeSec: extra.timeSec,
        completionPercent,
      }
    })

    const mostWorkedOnTasks = [...tasksWithAggregates]
      .sort((a, b) => (b.time_spent ?? 0) - (a.time_spent ?? 0))
      .slice(0, 5)

    const totalWorkSec = Object.values(workByDay).reduce(
      (acc, v) => acc + v,
      0,
    )
    const totalPomodoros = safeSessions.filter(
      (s) => s.mode === 'work',
    ).length
    const tasksDone = safeTasks.filter((t) => t.status === 'done').length

    const summary = {
      range,
      from,
      to: now,
      totalWorkSec,
      totalPomodoros,
      tasksCompleted: tasksDone,
    }

    return NextResponse.json({
      tasks: tasksWithAggregates,
      workByDay,
      mostWorkedOnTasks,
      summary,
    })
  } catch (error) {
    console.error('Error fetching task analytics', error)
    return NextResponse.json(
      { error: 'Failed to fetch task analytics' },
      { status: 500 },
    )
  }
}

