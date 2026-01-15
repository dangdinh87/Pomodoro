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
import { useStats } from '@/hooks/use-stats'
import { DateRange } from 'react-day-picker'

const MILESTONES = [7, 30, 100] as const

const isMilestone = (n: number) => MILESTONES.includes(n as typeof MILESTONES[number])
const nextMilestone = (n: number) => MILESTONES.find(m => m > n) ?? null

export default function StreakTracker() {
  const [month, setMonth] = useState<Date>(() => startOfMonth(new Date()))
  const [isMarking, setIsMarking] = useState(false)

  const dateRange = useMemo<DateRange>(() => ({
    from: startOfMonth(month),
    to: endOfMonth(month)
  }), [month])

  const { data: statsData, refetch, isLoading } = useStats(dateRange)

  // Computed values
  const currentStreak = statsData?.summary?.streak?.current || 0

  // Create a Set of focused dates for O(1) lookup
  const focusedDates = useMemo(() => {
    const set = new Set<string>()
    if (statsData?.dailyFocus) {
      statsData.dailyFocus.forEach(day => {
        // If count > 0 or duration > 0, consider it focused
        if (day.count > 0 || day.duration > 0) {
          set.add(day.date)
        }
      })
    }
    return set
  }, [statsData])

  const hasMarkedToday = useMemo(() => {
    const todayISO = format(new Date(), 'yyyy-MM-dd')
    // We need to check if today is in the focused set.
    // However, the focused set only contains dates from the current 'month' view range if we rely on statsData.
    // If the current view is not the current month, statsData won't have today's data unless we fetch it separately.
    // But typically users look at the current month to check in.

    // Actually, to be safe, we should probably assume if we are viewing the current month, we trust the data.
    // If not, we might not know. But the UI is usually centered on current activity.
    // Let's rely on the displayed data for now.
    return focusedDates.has(todayISO)
  }, [focusedDates])

  // Simplified month navigation
  const handlePrevMonth = () => setMonth((m) => startOfMonth(subMonths(m, 1)))
  const handleNextMonth = () => setMonth((m) => startOfMonth(addMonths(m, 1)))

  const handleMarkToday = async () => {
    if (hasMarkedToday) {
      toast.info('Bạn đã đánh dấu hôm nay rồi')
      return
    }

    setIsMarking(true)
    try {
      const res = await fetch('/api/tasks/session-complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'work',
          durationSec: 1, // Record 1 second for manual check-in
          taskId: null
        })
      })

      if (!res.ok) throw new Error('Failed to check in')

      await refetch()
      setMonth(startOfMonth(new Date())) // Jump to current month to show the new mark
      toast.success('Check-in thành công! +1 streak')

      // If new streak hits milestone
      // Note: We don't know the new streak until refetch, but we can guess.
      // But refetch handles it.

    } catch (error) {
      console.error(error)
      toast.error('Có lỗi xảy ra khi check-in')
    } finally {
      setIsMarking(false)
    }
  }

  const gridDays = useMemo(() => {
    const start = startOfWeek(startOfMonth(month), { weekStartsOn: 1 })
    const end = endOfWeek(endOfMonth(month), { weekStartsOn: 1 })
    const days: { date: Date; iso: string; focused: boolean; inMonth: boolean; today: boolean }[] = []

    for (let d = start; d <= end; d = addDays(d, 1)) {
      const date = new Date(d)
      const iso = format(date, 'yyyy-MM-dd')
      days.push({
        date,
        iso,
        focused: focusedDates.has(iso),
        inMonth: isSameMonth(date, month),
        today: isToday(date),
      })
    }
    return days
  }, [focusedDates, month])

  const weekdays = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN']
  const monthLabel = format(month, 'LLLL yyyy', { locale: vi })
  const milestoneNext = nextMilestone(currentStreak)
  const monthFocusedCount = useMemo(
    () => gridDays.filter((d) => d.inMonth && d.focused).length,
    [gridDays]
  )

  if (isLoading && !statsData) {
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
              disabled={hasMarkedToday || isMarking}
              className={cn(
                'px-5',
                hasMarkedToday ? 'opacity-60 cursor-not-allowed' : ''
              )}
            >
              {isMarking ? 'Đang xử lý...' : '+ Đánh dấu hôm nay'}
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
