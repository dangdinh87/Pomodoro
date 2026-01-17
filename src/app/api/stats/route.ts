import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

export async function GET(request: Request) {
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

        // Get date range from query parameters
        const { searchParams } = new URL(request.url)
        const startDate = searchParams.get('startDate')
        const endDate = searchParams.get('endDate')
        const timezoneOffset = parseInt(searchParams.get('timezoneOffset') || '0', 10)

        // 2. Fetch Summary Stats (Total Time, Completed Sessions)
        let query = supabase
            .from('sessions')
            .select('duration, mode, created_at')
            .eq('user_id', userId)

        // Apply date filters if provided
        if (startDate) {
            // Adjust start date to UTC based on timezone offset
            // startDate is YYYY-MM-DD in client time
            // Client start of day is 00:00:00 Client Time
            // UTC Time = Client Time + Offset Minutes
            const start = new Date(startDate)
            const startUtc = new Date(start.getTime() + timezoneOffset * 60 * 1000)
            query = query.gte('created_at', startUtc.toISOString())
        }
        if (endDate) {
            // Add one day to include the end date fully
            const end = new Date(endDate)
            end.setDate(end.getDate() + 1)
            const endUtc = new Date(end.getTime() + timezoneOffset * 60 * 1000)
            query = query.lt('created_at', endUtc.toISOString())
        }

        const { data: sessions, error: sessionsError } = await query

        if (sessionsError) throw sessionsError

        let totalFocusTime = 0
        let completedSessions = 0

        // For charts
        const dailyFocus: Record<string, number> = {}
        const distribution = {
            work: 0,
            shortBreak: 0,
            longBreak: 0,
        }

        // Initialize daily focus map based on date range
        if (startDate && endDate) {
            const start = new Date(startDate)
            const end = new Date(endDate)
            for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
                const dateStr = d.toISOString().split('T')[0]
                dailyFocus[dateStr] = 0
            }
        } else {
            // Default to last 7 days if no range specified
            // Adjust today to user's local time
            const now = new Date()
            const localNow = new Date(now.getTime() - timezoneOffset * 60 * 1000)

            for (let i = 6; i >= 0; i--) {
                const d = new Date(localNow)
                d.setDate(d.getDate() - i)
                const dateStr = d.toISOString().split('T')[0]
                dailyFocus[dateStr] = 0
            }
        }


        sessions.forEach(session => {
            // Summary
            if (session.mode === 'work') {
                totalFocusTime += session.duration
                completedSessions++
            }

            // Distribution
            if (session.mode === 'work') distribution.work += session.duration
            else if (session.mode === 'shortBreak') distribution.shortBreak += session.duration
            else if (session.mode === 'longBreak') distribution.longBreak += session.duration

            // Daily Focus (only work)
            if (session.mode === 'work') {
                const sessionDate = new Date(session.created_at)
                // Convert session UTC time to client local time
                const localSessionDate = new Date(sessionDate.getTime() - timezoneOffset * 60 * 1000)
                const dateStr = localSessionDate.toISOString().split('T')[0]

                if (dailyFocus[dateStr] !== undefined) {
                    dailyFocus[dateStr] += session.duration
                }
            }
        })

        // 3. Fetch Streak
        const { data: streakData, error: streakError } = await supabase
            .from('streaks')
            .select('current, longest')
            .eq('user_id', userId)
            .single()

        if (streakError && streakError.code !== 'PGRST116') {
            console.error('Error fetching streak', streakError)
        }

        // Format response
        // Format response
        const stats = {
            summary: {
                totalFocusTime, // in seconds
                completedSessions,
                streak: {
                    current: streakData?.current || 0,
                    longest: streakData?.longest || 0,
                }
            },
            dailyFocus: Object.entries(dailyFocus).map(([date, duration]) => ({
                date,
                duration, // in seconds
            })),
            distribution: [
                { name: 'work', value: distribution.work, color: '#3b82f6' }, // blue-500
                { name: 'shortBreak', value: distribution.shortBreak, color: '#f59e0b' }, // amber-500
                { name: 'longBreak', value: distribution.longBreak, color: '#8b5cf6' }, // violet-500
            ],
        }

        return NextResponse.json(stats)

    } catch (error) {
        console.error('Error fetching stats', error)
        return NextResponse.json(
            { error: 'Failed to fetch statistics' },
            { status: 500 },
        )
    }
}
