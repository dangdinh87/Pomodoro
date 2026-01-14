"use client"

import React, { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Flame, CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  format,
  startOfMonth,
  startOfWeek,
  endOfMonth,
  endOfWeek,
  addDays,
  subMonths,
  addMonths,
  isSameMonth,
  isToday,
} from 'date-fns'
import { vi } from 'date-fns/locale'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

const MILESTONES = [7, 30, 100] as const

// Utility functions
const todayISO = () => format(new Date(), 'yyyy-MM-dd')

const nextMilestone = (n: number) => MILESTONES.find(m => m > n) ?? null

export default function StreakTracker() {
  const [month, setMonth] = useState<Date>(() => startOfMonth(new Date()))
  const queryClient = useQueryClient()

  // Computed values
  const today = useMemo(() => todayISO(), [])

  // Calculate range for query
  const start = startOfWeek(startOfMonth(month), { weekStartsOn: 1 })
  const end = endOfWeek(endOfMonth(month), { weekStartsOn: 1 })
  const startDateStr = format(start, 'yyyy-MM-dd')
  const endDateStr = format(end, 'yyyy-MM-dd')
  const timezoneOffset = new Date().getTimezoneOffset()

  const { data: stats, isLoading } = useQuery({
    queryKey: ['stats', startDateStr, endDateStr, timezoneOffset],
    queryFn: async () => {
      const res = await fetch(`/api/stats?startDate=${startDateStr}&endDate=${endDateStr}&timezoneOffset=${timezoneOffset}`)
      if (!res.ok) throw new Error('Failed to fetch stats')
      return res.json()
    },
    // Keep data fresh but cache for a bit
    staleTime: 60 * 1000,
  })

  // Derived state
  const history = useMemo(() => {
    if (!stats?.dailyFocus) return []
    // dailyFocus is array of { date: string, duration: number }
    return stats.dailyFocus
      .filter((d: any) => d.duration > 0)
      .map((d: any) => d.date)
  }, [stats])

  const currentStreak = stats?.summary?.streak?.current || 0
  const hasMarkedToday = useMemo(() => history.includes(today), [history, today])

  // Mutation for "Mark Today"
  const markTodayMutation = useMutation({
      mutationFn: async () => {
          const res = await fetch('/api/tasks/session-complete', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                  durationSec: 1, // Dummy duration
                  mode: 'work',
                  clientDate: today,
                  timezoneOffset: timezoneOffset
              })
          })
          if (!res.ok) throw new Error('Failed to mark today')
          return res.json()
      },
      onSuccess: () => {
          toast.success('Đã đánh dấu hôm nay!')
          queryClient.invalidateQueries({ queryKey: ['stats'] })
      },
      onError: () => {
          toast.error('Có lỗi xảy ra khi đánh dấu.')
      }
  })

  // Simplified month navigation
  const handlePrevMonth = () => setMonth((m) => startOfMonth(subMonths(m, 1)))
  const handleNextMonth = () => setMonth((m) => startOfMonth(addMonths(m, 1)))

  const handleMarkToday = () => {
    if (hasMarkedToday) {
      toast.info('Bạn đã đánh dấu hôm nay rồi')
      return
    }
    markTodayMutation.mutate()
  }

  const gridDays = useMemo(() => {
    const days: { date: Date; iso: string; focused: boolean; inMonth: boolean; today: boolean }[] = []
    for (let d = start; d <= end; d = addDays(d, 1)) {
      const date = new Date(d)
      const iso = format(date, 'yyyy-MM-dd')
      days.push({
        date,
        iso,
        focused: history.includes(iso),
        inMonth: isSameMonth(date, month),
        today: isToday(date),
      })
    }
    return days
  }, [history, month, start, end])

  const weekdays = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN']
  const monthLabel = format(month, 'LLLL yyyy', { locale: vi })
  const milestoneNext = nextMilestone(currentStreak)
  const monthFocusedCount = useMemo(
    () =>
      gridDays.filter((d) => d.inMonth && d.focused).length,
    [gridDays]
  )

  if (isLoading) {
    return (
      <div className="w-full max-w-3xl mx-auto px-4">
        <Card className="bg-background/50 backdrop-blur-sm border-border/20">
          <CardContent className="py-8 text-center text-sm text-muted-foreground">
            Loading...
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="w-full max-w-3xl mx-auto px-4">
      <Card className="bg-background/70 backdrop-blur-md border-white/20 dark:border-white/10 shadow-xl">
        <CardHeader className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Flame className="h-6 w-6 text-[hsl(var(--primary))]" />
            Streak Calendar
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={handlePrevMonth}
              aria-label="Tháng trước"
              className="hover:bg-muted"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="text-sm font-medium">{monthLabel}</div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleNextMonth}
              aria-label="Tháng sau"
              className="hover:bg-muted"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="flex items-center gap-3 justify-center">
            <Button
              onClick={handleMarkToday}
              disabled={hasMarkedToday || markTodayMutation.isPending}
              className={cn(
                'px-5',
                hasMarkedToday ? 'opacity-60 cursor-not-allowed' : ''
              )}
            >
              {markTodayMutation.isPending ? 'Đang xử lý...' : '+ Đánh dấu hôm nay'}
            </Button>
            <div className="text-xs text-muted-foreground">
              {hasMarkedToday ? 'Đã đánh dấu hôm nay' : 'Đánh dấu một ngày tập trung'}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-[hsl(var(--primary))]" />
              <Label>Lịch tháng</Label>
            </div>

            {/* Weekday headers */}
            <div className="grid grid-cols-7 gap-1 text-[11px] text-muted-foreground">
              {weekdays.map((wd) => (
                <div key={wd} className="h-7 flex items-center justify-center">
                  {wd}
                </div>
              ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-1">
              {gridDays.map((d) => {
                const dayNum = format(d.date, 'd')
                return (
                  <div
                    key={d.iso}
                    title={d.iso}
                    className={cn(
                      'h-9 rounded-md border flex items-center justify-center text-[12px]',
                      d.focused
                        ? 'bg-primary/80 border-primary text-primary-foreground'
                        : 'bg-muted border-border text-muted-foreground',
                      d.today ? 'ring-2 ring-primary' : '',
                      !d.inMonth ? 'opacity-40' : ''
                    )}
                  >
                    {dayNum}
                  </div>
                )
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3 rounded-lg border bg-muted/40">
              <div className="text-sm text-muted-foreground">
                Chuỗi hiện tại: <span className="font-semibold text-foreground">{currentStreak} ngày</span>
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {milestoneNext
                  ? <>Còn <span className="font-semibold">{milestoneNext - currentStreak}</span> ngày đến mốc <span className="font-semibold">{milestoneNext}</span>.</>
                  : <>Bạn đã vượt qua tất cả các mốc lớn! Tiếp tục giữ phong độ.</>}
              </div>
            </div>

            <div className="p-3 rounded-lg border bg-muted/40">
              <div className="text-sm text-muted-foreground">
                Đã đánh dấu tháng này: <span className="font-semibold text-foreground">{monthFocusedCount}</span> ngày
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                Mẹo: Giữ lịch đơn giản, đều đặn mỗi ngày.
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
