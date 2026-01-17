import { useQuery } from '@tanstack/react-query'
import { DateRange } from 'react-day-picker'
import { format } from 'date-fns'

export interface StatsData {
    summary: {
        totalFocusTime: number
        completedSessions: number
        streak: {
            current: number
            longest: number
        }
    }
    dailyFocus: {
        date: string
        duration: number
    }[]
    distribution: {
        name: string
        value: number
        color: string
    }[]
}

async function fetchStats(dateRange: DateRange | undefined): Promise<StatsData> {
    let url = '/api/stats'
    const params = new URLSearchParams()

    // Always send timezone offset
    params.append('timezoneOffset', new Date().getTimezoneOffset().toString())

    if (dateRange?.from && dateRange?.to) {
        params.append('startDate', format(dateRange.from, 'yyyy-MM-dd'))
        params.append('endDate', format(dateRange.to, 'yyyy-MM-dd'))
    }

    // If params exist, append them to URL
    if (Array.from(params.keys()).length > 0) {
        url += `?${params.toString()}`
    }

    const res = await fetch(url)
    if (!res.ok) {
        throw new Error('Failed to fetch stats')
    }

    return res.json()
}

export function useStats(dateRange: DateRange | undefined) {
    const queryKey = ['stats',
        dateRange?.from ? format(dateRange.from, 'yyyy-MM-dd') : undefined,
        dateRange?.to ? format(dateRange.to, 'yyyy-MM-dd') : undefined
    ]

    return useQuery({
        queryKey,
        queryFn: () => fetchStats(dateRange),
        staleTime: 1000 * 60 * 5, // 5 minutes
    })
}
