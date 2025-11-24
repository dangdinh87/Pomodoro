import { useQuery } from '@tanstack/react-query'
import { DateRange } from 'react-day-picker'
import { format } from 'date-fns'

export interface Session {
    id: string
    created_at: string
    duration: number
    mode: 'work' | 'shortBreak' | 'longBreak'
    completed: boolean
    task_id?: string
}

export interface HistoryData {
    sessions: Session[]
}

async function fetchHistory(dateRange: DateRange | undefined): Promise<HistoryData> {
    let url = '/api/history'

    if (dateRange?.from) {
        const params = new URLSearchParams()
        params.append('startDate', format(dateRange.from, 'yyyy-MM-dd'))
        if (dateRange.to) {
            params.append('endDate', format(dateRange.to, 'yyyy-MM-dd'))
        } else {
            params.append('endDate', format(dateRange.from, 'yyyy-MM-dd'))
        }
        url += `?${params.toString()}`
    }

    const res = await fetch(url)
    if (!res.ok) {
        throw new Error('Failed to fetch history')
    }

    return res.json()
}

export function useHistory(dateRange: DateRange | undefined) {
    const queryKey = ['history',
        dateRange?.from ? format(dateRange.from, 'yyyy-MM-dd') : undefined,
        dateRange?.to ? format(dateRange.to, 'yyyy-MM-dd') : undefined
    ]

    return useQuery({
        queryKey,
        queryFn: () => fetchHistory(dateRange),
        staleTime: 1000 * 60 * 5, // 5 minutes
    })
}
