"use client"

import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import { Flame, RotateCcw, CalendarDays, Trophy } from 'lucide-react'
import { cn } from '@/lib/utils'
import { format, parseISO, differenceInCalendarDays, subDays } from 'date-fns'

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

const uniquePush = (arr: string[], v: string) => {
  if (arr.includes(v)) return arr
  return [...arr, v]
}

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
  const [milestoneHit, setMilestoneHit] = useState<number | null>(null)
  const [loaded, setLoaded] = useState(false)
  const confettiRef = useRef<HTMLDivElement | null>(null)

  // Hydrate from localStorage on mount to avoid SSR defaults overwriting persisted data
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw) as StreakStore
        setData(parsed)
        setHasMarkedToday(parsed.history.includes(todayISO()))
      } else {
        // No saved data; derive today's mark from current state (still default)
        setHasMarkedToday(data.history.includes(todayISO()))
      }
    } catch {}
    setLoaded(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Persist (only after hydration) to avoid overwriting saved streak with defaults
  useEffect(() => {
    if (!loaded) return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    } catch {}
  }, [data, loaded])

  const triggerConfetti = () => {
    if (!confettiRef.current) return
    const container = confettiRef.current
    const colors = ['#ff6b6b', '#feca57', '#48dbfb', '#1dd1a1', '#5f27cd']
    const pieces = 60
    for (let i = 0; i < pieces; i++) {
      const el = document.createElement('span')
      el.className = 'confetti-piece'
      const size = Math.random() * 6 + 4
      el.style.width = `${size}px`
      el.style.height = `${size * 0.6}px`
      el.style.left = `${Math.random() * 100}%`
      el.style.backgroundColor = colors[i % colors.length]
      el.style.opacity = '0.9'
      el.style.transform = `translateY(-10px) rotate(${Math.random() * 360}deg)`
      container.appendChild(el)
      const duration = 1200 + Math.random() * 1400
      const translateX = (Math.random() - 0.5) * 220
      const translateY = 220 + Math.random() * 220
      const rotate = Math.random() * 720
      el.animate(
        [
          { transform: `translate(0, -10px) rotate(0deg)`, opacity: 1 },
          { transform: `translate(${translateX}px, ${translateY}px) rotate(${rotate}deg)`, opacity: 0 }
        ],
        { duration, easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)', fill: 'forwards' }
      ).onfinish = () => {
        try { container.removeChild(el) } catch {}
      }
    }
  }

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
    triggerConfetti()
    if (isMilestone(nextStreak)) {
      setMilestoneHit(nextStreak)
    }
    toast.success(`+1 streak! Tổng: ${nextStreak}`)
  }

  const handleReset = () => {
    setData({ streak: 0, lastDateISO: null, history: [] })
    setHasMarkedToday(false)
    setMilestoneHit(null)
    toast.success('Đã reset streak')
  }

  const recentDays = useMemo(() => {
    const days: { iso: string; focused: boolean }[] = []
    const base = new Date()
    for (let i = 29; i >= 0; i--) {
      const d = subDays(base, i)
      const iso = format(d, 'yyyy-MM-dd')
      days.push({ iso, focused: data.history.includes(iso) })
    }
    return days
  }, [data.history])

  const ringGlow = 'hsla(var(--primary), 0.35)'
  const milestoneNext = nextMilestone(data.streak)

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
            <Flame className="h-5 w-5 text-[hsl(var(--primary))]" />
            Streak Tracker
          </CardTitle>
          <div className="flex items-center gap-2"></div>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-[1fr_280px] gap-6">
            <div className="space-y-6">
              <div className="relative mx-auto w-56 h-56">
                <div className="absolute inset-0 rounded-full"
                  style={{
                    boxShadow: `0 0 40px ${ringGlow}`,
                    filter: 'blur(0.4px)',
                  }}
                />
                <div
                  className="absolute inset-0 rounded-full"
                  style={{
                    border: '3px solid hsl(var(--primary))',
                    opacity: 0.25,
                  }}
                />
                <motion.div
                  className="absolute inset-0 rounded-full"
                  style={{
                    background: `conic-gradient(from 0deg, transparent 0%, hsl(var(--primary)) 20%, transparent 40%)`,
                    filter: 'blur(0.3px)',
                  }}
                  animate={{ rotate: 360 }}
                  transition={{ duration: 8, ease: 'linear', repeat: Infinity }}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.div
                    initial={{ scale: 0.95, opacity: 0.9 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="text-6xl font-extrabold tracking-tight text-center"
                    style={{ color: 'hsl(var(--primary))', textShadow: '0 0 8px rgba(0,0,0,0.06)' }}
                  >
                    {data.streak}
                  </motion.div>
                </div>
                <AnimatePresence>
                  {milestoneHit && (
                    <motion.div
                      className="absolute -top-6 left-1/2 -translate-x-1/2 flex items-center gap-2 px-3 py-1 rounded-full bg-primary/90 text-primary-foreground shadow"
                      initial={{ y: -12, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: -12, opacity: 0 }}
                      transition={{ duration: 0.4 }}
                    >
                      <Trophy className="h-4 w-4" />
                      Milestone {milestoneHit}!
                    </motion.div>
                  )}
                </AnimatePresence>
                <div ref={confettiRef} className="pointer-events-none absolute inset-0 overflow-hidden" />
              </div>

              <div className="flex items-center gap-3 justify-center">
                <Button
                  onClick={handleMarkToday}
                  disabled={hasMarkedToday}
                  className={cn(
                    'px-5',
                    'transition-all hover:opacity-90 hover:blur-[0.1px]',
                    hasMarkedToday ? 'opacity-60 cursor-not-allowed' : ''
                  )}
                >
                  + Mark Today
                </Button>
                <div className="text-xs text-muted-foreground">
                  {hasMarkedToday ? 'Đã đánh dấu hôm nay' : 'Đánh dấu một ngày tập trung'}
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 text-[hsl(var(--primary))]" />
                  <Label>Lịch 30 ngày gần đây</Label>
                </div>
                <div className="grid grid-cols-10 gap-1">
                  {recentDays.map((d) => {
                    const isToday = d.iso === todayISO();
                    const dayNum = format(parseISO(d.iso), 'dd');
                    return (
                      <motion.div
                        key={d.iso}
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.2 }}
                        className={cn(
                          'h-7 w-7 rounded-md border flex items-center justify-center text-[10px]',
                          d.focused ? 'bg-primary/80 border-primary text-primary-foreground' : 'bg-muted border-border text-muted-foreground',
                          isToday ? 'ring-2 ring-primary' : ''
                        )}
                        title={d.iso}
                      >
                        {dayNum}
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="space-y-4">
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
            </div>
          </div>
        </CardContent>
      </Card>

      <style jsx>{`
        @keyframes spinGlow {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .confetti-piece {
          position: absolute;
          top: 0;
          left: 0;
          border-radius: 2px;
        }
      `}</style>
    </div>
  )
}