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
  subMonths,
  addMonths,
  isSameMonth,
  isToday,
  isValid,
} from 'date-fns'
import { vi } from 'date-fns/locale'

type StreakStore = {
  streak: number
  lastDateISO: string | null
  history: string[] // ISO dates for days marked focused
}

const STORAGE_KEY = 'pomodoro-streak'
const MILESTONES = [7, 30, 100] as const

// Utility functions
const todayISO = () => format(new Date(), 'yyyy-MM-dd')

const isoToDate = (iso: string) => {
  try {
    const date = parseISO(iso)
    return isValid(date) ? date : null
  } catch {
    return null
  }
}

const diffDays = (aISO: string, bISO: string) => {
  const dateA = isoToDate(aISO)
  const dateB = isoToDate(bISO)
  if (!dateA || !dateB) return 0
  return differenceInCalendarDays(dateA, dateB)
}

const isMilestone = (n: number) => MILESTONES.includes(n as typeof MILESTONES[number])

const nextMilestone = (n: number) => MILESTONES.find(m => m > n) ?? null

const uniqueSortedPush = (arr: string[], v: string) => {
  if (arr.includes(v)) return [...arr]
  const sorted = [...arr, v].sort((a, b) => a.localeCompare(b))
  return sorted
}

// Calculate current streak by finding consecutive days ending with today
const calculateCurrentStreak = (historySet: Set<string>, today: string): number => {
  if (!historySet.has(today)) return 0

  let streak = 0
  let currentDate = today

  while (historySet.has(currentDate)) {
    streak++
    const date = isoToDate(currentDate)
    if (!date) break
    currentDate = format(addDays(date, -1), 'yyyy-MM-dd')
  }

  return streak
}

// Validate and sanitize stored data
const validateStreakStore = (data: any): StreakStore => {
  const defaultData: StreakStore = { streak: 0, lastDateISO: null, history: [] }

  if (!data || typeof data !== 'object') return defaultData

  const { streak, lastDateISO, history } = data

  // Validate streak
  const validStreak = (typeof streak === 'number' && streak >= 0) ? streak : 0

  // Validate lastDateISO
  const validLastDate = (typeof lastDateISO === 'string' && isoToDate(lastDateISO)) ? lastDateISO : null

  // Validate and sort history
  const validHistory = Array.isArray(history)
    ? history.filter(date => typeof date === 'string' && isoToDate(date)).sort((a, b) => a.localeCompare(b))
    : []

  return {
    streak: validStreak,
    lastDateISO: validLastDate,
    history: validHistory,
  }
}

export default function StreakTracker() {
  const [data, setData] = useState<StreakStore>(() => {
    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem(STORAGE_KEY)
        if (raw) {
          const parsed = JSON.parse(raw)
          return validateStreakStore(parsed)
        }
      } catch (error) {
        console.warn('Failed to load streak data:', error)
      }
    }
    return { streak: 0, lastDateISO: null, history: [] }
  })

  const [loaded, setLoaded] = useState(false)
  const [month, setMonth] = useState<Date>(() => startOfMonth(new Date()))

  // Computed values
  const today = useMemo(() => todayISO(), [])
  // Optimize history lookups with Set (O(1) vs O(N))
  const historySet = useMemo(() => new Set(data.history), [data.history])
  const hasMarkedToday = useMemo(() => historySet.has(today), [historySet, today])
  const currentStreak = useMemo(() => calculateCurrentStreak(historySet, today), [historySet, today])

  // Hydrate from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw)
        const validated = validateStreakStore(parsed)
        setData(validated)
      }
    } catch (error) {
      console.warn('Failed to load streak data:', error)
    }
    setLoaded(true)
  }, [])

  // Persist data changes (only after hydration)
  useEffect(() => {
    if (!loaded) return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    } catch (error) {
      console.warn('Failed to save streak data:', error)
    }
  }, [data, loaded])

  // Simplified month navigation
  const handlePrevMonth = () => setMonth((m) => startOfMonth(subMonths(m, 1)))
  const handleNextMonth = () => setMonth((m) => startOfMonth(addMonths(m, 1)))

  const handleMarkToday = () => {
    const todayDate = todayISO()

    if (hasMarkedToday) {
      toast.info('Bạn đã đánh dấu hôm nay rồi')
      return
    }

    const newHistory = uniqueSortedPush(data.history, todayDate)
    const newStreak = calculateCurrentStreak(new Set(newHistory), todayDate)

    const updated: StreakStore = {
      streak: newStreak,
      lastDateISO: todayDate,
      history: newHistory,
    }

    setData(updated)

    if (isMilestone(newStreak)) {
      toast.success(`Cột mốc ${newStreak}! 🎉`)
    } else {
      toast.success(`+1 streak! Tổng: ${newStreak}`)
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
        focused: historySet.has(iso),
        inMonth: isSameMonth(date, month),
        today: isToday(date),
      })
    }
    return days
  }, [historySet, month])

  const weekdays = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN']
  const monthLabel = format(month, 'LLLL yyyy', { locale: vi })
  const milestoneNext = nextMilestone(currentStreak)
  const monthFocusedCount = useMemo(
    () =>
      gridDays.filter((d) => d.inMonth && d.focused).length,
    [gridDays]
  )

  if (!loaded) {
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