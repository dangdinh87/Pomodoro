import { createClient } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

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

        let query = supabase
            .from('sessions')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })

        if (startDate) {
            query = query.gte('created_at', startDate)
        }
        if (endDate) {
            // Add one day to include the end date fully if it's just a date string
            // But usually the client sends a specific timestamp or we handle it here.
            // Assuming client sends ISO strings or YYYY-MM-DD.
            // If YYYY-MM-DD, we might want to go to the end of that day.
            // For now, let's assume the client handles the exact range or we just use as is.
            // If it's just a date, we might want to add time 23:59:59
            query = query.lte('created_at', endDate)
        } else {
            // Default limit if no date range? Or maybe just limit to recent 50?
            // Let's stick to date range if provided, otherwise maybe last 30 days?
            // The original stats API had a default. Let's keep it simple for now.
        }

        // If no date range, maybe limit to 50 recent sessions?
        if (!startDate && !endDate) {
            query = query.limit(50)
        }

        const { data: sessions, error: sessionsError } = await query

        if (sessionsError) {
            console.error('Error fetching sessions:', sessionsError)
            return NextResponse.json(
                { error: 'Failed to fetch sessions' },
                { status: 500 },
            )
        }

        return NextResponse.json({ sessions })
    } catch (error) {
        console.error('Error in history API:', error)
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 },
        )
    }
}
