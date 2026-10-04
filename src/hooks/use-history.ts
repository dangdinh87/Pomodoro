import { useQuery } from '@tanstack/react-query'
import { DateRange } from 'react-day-picker'
import { format } from 'date-fns'
import { useAuthStore } from '@/stores/auth-store'
import { getBrowserTimeZone } from '@/lib/stats/study-day'

export interface Session {
    id: string
    created_at: string
    duration: number
    mode: 'work' | 'shortBreak' | 'longBreak'
    completed: boolean
    task_id?: string
    tasks?: {
        title: string
    } | null
}

export interface HistoryData {
    sessions: Session[]
}

// The range holds study days (04:00 local) as local-midnight dates, sent as yyyy-MM-dd keys with the zone.
async function fetchHistory(dateRange: DateRange | undefined, tz: string): Promise<HistoryData> {
    const params = new URLSearchParams({ tz })

    if (dateRange?.from) {
        params.append('startDate', format(dateRange.from, 'yyyy-MM-dd'))
        if (dateRange.to) {
            params.append('endDate', format(dateRange.to, 'yyyy-MM-dd'))
        } else {
            params.append('endDate', format(dateRange.from, 'yyyy-MM-dd'))
        }
    }

    const res = await fetch(`/api/history?${params.toString()}`)
    if (!res.ok) {
        throw new Error('Failed to fetch history')
    }

    return res.json()
}

export function useHistory(dateRange: DateRange | undefined) {
    const hasSession = useAuthStore((state) => !!state.user)
    const tz = getBrowserTimeZone()
    const queryKey = ['history',
        tz,
        dateRange?.from ? format(dateRange.from, 'yyyy-MM-dd') : undefined,
        dateRange?.to ? format(dateRange.to, 'yyyy-MM-dd') : undefined
    ]

    return useQuery({
        queryKey,
        enabled: hasSession,
        queryFn: () => fetchHistory(dateRange, tz),
        staleTime: 1000 * 60 * 5, // 5 minutes
    })
}
