"use client"

import React, { useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Flame, CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  format,
  parseISO,
  differenceInCalendarDays,
  startOfMonth,
  startOfWeek,
  endOfMonth,
  endOfWeek,
  addDays,
  isSameMonth,
  isToday,
} from 'date-fns'
import { vi } from 'date-fns/locale'

type StreakStore = {
  streak: number
  lastDateISO: string | null
  history: string[] // ISO dates for days marked focused
}

const STORAGE_KEY = 'pomodoro-streak'

const todayISO = () => format(new Date(), 'yyyy-MM-dd')
const isoToDate = (iso: string) => parseISO(iso)
const diffDays = (aISO: string, bISO: string) =>
  differenceInCalendarDays(isoToDate(aISO), isoToDate(bISO))
const isMilestone = (n: number) => [7, 30, 100].includes(n)
const nextMilestone = (n: number) => [7, 30, 100].find(m => m > n) ?? null
const uniquePush = (arr: string[], v: string) => (arr.includes(v) ? arr : [...arr, v])

export default function StreakTracker() {
  const [data, setData] = useState<StreakStore>(() => {
    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem(STORAGE_KEY)
        if (raw) return JSON.parse(raw) as StreakStore
      } catch {}
    }
    return { streak: 0, lastDateISO: null, history: [] }
  })
  const [hasMarkedToday, setHasMarkedToday] = useState<boolean>(false)
  const [loaded, setLoaded] = useState(false)
  const [month, setMonth] = useState<Date>(() => startOfMonth(new Date()))

  // Hydrate from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw) as StreakStore
        setData(parsed)
        setHasMarkedToday(parsed.history.includes(todayISO()))
      } else {
        setHasMarkedToday(false)
      }
    } catch {}
    setLoaded(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Persist (only after hydration)
  useEffect(() => {
    if (!loaded) return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    } catch {}
  }, [data, loaded])

  const handlePrevMonth = () => setMonth((m) => startOfMonth(addDays(m, -1 * new Date(m.getFullYear(), m.getMonth() + 1, 0).getDate())))
  const handleNextMonth = () => setMonth((m) => startOfMonth(addDays(m, new Date(m.getFullYear(), m.getMonth() + 1, 0).getDate())))

  const handleMarkToday = () => {
    const today = todayISO()
    if (data.history.includes(today)) {
      toast.info('Bạn đã đánh dấu hôm nay rồi')
      setHasMarkedToday(true)
      return
    }
    const last = data.lastDateISO
    let nextStreak = 0
    if (!last) {
      nextStreak = 1
    } else {
      const gap = diffDays(today, last)
      if (gap === 0) {
        nextStreak = data.streak
      } else if (gap === 1) {
        nextStreak = data.streak + 1
      } else {
        nextStreak = 1
      }
    }
    const updated: StreakStore = {
      streak: nextStreak,
      lastDateISO: today,
      history: uniquePush(data.history, today),
    }
    setData(updated)
    setHasMarkedToday(true)
    if (isMilestone(nextStreak)) {
      toast.success(`Cột mốc ${nextStreak}!`)
    } else {
      toast.success(`+1 streak! Tổng: ${nextStreak}`)
    }
    // Ensure calendar shows current month
    setMonth(startOfMonth(new Date()))
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
        focused: data.history.includes(iso),
        inMonth: isSameMonth(date, month),
        today: isToday(date),
      })
    }
    return days
  }, [data.history, month])

  const weekdays = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN']
  const monthLabel = format(month, 'LLLL yyyy', { locale: vi })
  const milestoneNext = nextMilestone(data.streak)
  const monthFocusedCount = useMemo(
    () =>
      gridDays.filter((d) => d.inMonth && d.focused).length,
    [gridDays]
  )

  if (!loaded) {
    return (
      <div className="mt-24 w-full max-w-3xl mx-auto px-4">
        <Card className="bg-background/50 backdrop-blur-sm border-border/20">
          <CardContent className="py-8 text-center text-sm text-muted-foreground">
            Loading...
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="mt-24 w-full max-w-3xl mx-auto px-4">
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
              disabled={hasMarkedToday}
              className={cn(
                'px-5',
                hasMarkedToday ? 'opacity-60 cursor-not-allowed' : ''
              )}
            >
              + Đánh dấu hôm nay
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
                Chuỗi hiện tại: <span className="font-semibold text-foreground">{data.streak} ngày</span>
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {milestoneNext
                  ? <>Còn <span className="font-semibold">{milestoneNext - data.streak}</span> ngày đến mốc <span className="font-semibold">{milestoneNext}</span>.</>
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