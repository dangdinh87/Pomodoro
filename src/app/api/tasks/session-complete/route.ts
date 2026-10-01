import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { SESSION_MAX_TOTAL_SEC_PER_DAY } from '@/config/constants'
import { isTaskOwnedByUser } from '../task-ownership'
import { validateSessionCompletion } from './session-schemas'

const ONE_DAY_MS = 24 * 60 * 60 * 1000

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

    let body: unknown
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: 'Request body must be valid JSON' }, { status: 400 })
    }

    const parsed = validateSessionCompletion(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error }, { status: 400 })
    }

    const { taskId, durationSec: duration, mode } = parsed.data

    // 2. Plausibility guard: nobody can log more time than has elapsed in the
    // last 24h. Blocks leaderboard/streak inflation via forged durations.
    const since = new Date(Date.now() - ONE_DAY_MS).toISOString()
    const { data: recentSessions, error: recentError } = await supabase
      .from('sessions')
      .select('duration')
      .eq('user_id', userId)
      .gte('created_at', since)

    if (recentError) {
      console.error('Error loading recent sessions', recentError)
      return NextResponse.json(
        { error: 'Failed to record session completion' },
        { status: 500 },
      )
    }

    const loggedLastDay = (recentSessions ?? []).reduce(
      (total, session) => total + (Number(session.duration) || 0),
      0,
    )
    if (loggedLastDay + duration > SESSION_MAX_TOTAL_SEC_PER_DAY) {
      return NextResponse.json(
        { error: 'Daily session limit exceeded' },
        { status: 429 },
      )
    }

    // 3. Keep taskId only if it belongs to the user
    const validatedTaskId =
      taskId && (await isTaskOwnedByUser(supabase, taskId, userId)) ? taskId : null

    // 4. Record session
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

    // 5. Update Task progress (if applicable)
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

    // 6. Update Streak (only for 'work' sessions)
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

