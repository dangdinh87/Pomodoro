import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

export async function POST(request: Request) {
  const supabase = await createClient()

  try {
    // 1. Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 },
      )
    }

    const userId = user.id
    const body = await request.json()
    const {
      taskId,
      durationSec,
      mode,
    }: {
      taskId?: string | null
      durationSec: number
      mode: 'work' | 'shortBreak' | 'longBreak'
    } = body

    const duration = Math.max(0, Math.round(durationSec))

    // 2. Validate taskId if provided
    let validatedTaskId: string | null = null

    if (taskId) {
      const { data: taskData, error: taskError } = await supabase
        .from('tasks')
        .select('id')
        .eq('id', taskId)
        .eq('user_id', userId)
        .single()

      if (taskError || !taskData) {
        console.warn(`Invalid taskId ${taskId} for user ${userId}: ${taskError?.message || 'not found'}`)
        validatedTaskId = null
      } else {
        validatedTaskId = taskId
      }
    }

    // 3. Record session
    const { data: sessionData, error: sessionError } = await supabase
      .from('sessions')
      .insert({
        user_id: userId,
        task_id: validatedTaskId,
        duration,
        mode, // 'work', 'shortBreak', or 'longBreak'
      })
      .select('*')
      .single()

    if (sessionError) {
      console.error('Error creating session', sessionError)
      return NextResponse.json(
        { error: 'Failed to record session completion' },
        { status: 500 },
      )
    }

    // 4. Update Task progress (if applicable)
    if (validatedTaskId && mode === 'work') {
      const { error: incError } = await supabase.rpc('increment_task_pomodoro', {
        task_id_input: validatedTaskId,
        user_id_input: userId,
        duration_ms_input: duration * 1000,
      })

      if (incError) {
        console.error('Error updating task progress', incError)
      }
    }

    // 5. Update Streak (only for 'work' sessions)
    if (mode === 'work') {
      // Fetch current streak
      const { data: streakData, error: streakFetchError } = await supabase
        .from('streaks')
        .select('*')
        .eq('user_id', userId)
        .single()

      const today = new Date().toISOString().split('T')[0]

      if (streakFetchError && streakFetchError.code !== 'PGRST116') { // PGRST116 is "Row not found"
        console.error('Error fetching streak', streakFetchError)
      }

      let newCurrent = 1
      let newLongest = 1
      let shouldUpdate = false

      if (streakData) {
        const lastSessionDate = streakData.last_session ? new Date(streakData.last_session).toISOString().split('T')[0] : null

        if (lastSessionDate === today) {
          // Already recorded for today, don't increment streak, but update last_session timestamp
          shouldUpdate = true
          newCurrent = streakData.current
          newLongest = streakData.longest
        } else {
          // Check if yesterday
          const yesterday = new Date()
          yesterday.setDate(yesterday.getDate() - 1)
          const yesterdayStr = yesterday.toISOString().split('T')[0]

          if (lastSessionDate === yesterdayStr) {
            // Consecutive day
            newCurrent = streakData.current + 1
            newLongest = Math.max(newCurrent, streakData.longest)
            shouldUpdate = true
          } else {
            // Streak broken
            newCurrent = 1
            // Longest remains same
            newLongest = streakData.longest
            shouldUpdate = true
          }
        }
      } else {
        // No streak record exists, create one
        shouldUpdate = true
      }

      if (shouldUpdate) {
        const { error: streakUpdateError } = await supabase
          .from('streaks')
          .upsert({
            user_id: userId,
            current: newCurrent,
            longest: newLongest,
            last_session: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }, { onConflict: 'user_id' })

        if (streakUpdateError) {
          console.error('Error updating streak', streakUpdateError)
        }
      }
    }

    return NextResponse.json({ session: sessionData })
  } catch (error) {
    console.error('Error recording session completion', error)
    return NextResponse.json(
      { error: 'Failed to record session completion' },
      { status: 500 },
    )
  }
}

