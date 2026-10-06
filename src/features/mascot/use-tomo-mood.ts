'use client';

import { useEffect, useMemo, useState } from 'react';
import { useTimerStore } from '@/stores/timer-store';
import { useCelebrationStore } from './celebration-store';
import { pickTomoMood, type TomoMood } from './pick-tomo-mood';
import { useTodayStats } from './use-today-stats';

const MINUTE_MS = 60_000;

/** The current time, refreshed every minute and when the tab comes back, so an 18:00 or 23:00 change shows up on its own. */
function useMinuteClock(): Date {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const refresh = () => setNow(new Date());
    const timer = window.setInterval(refresh, MINUTE_MS);
    const onVisible = () => document.visibilityState === 'visible' && refresh();
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, []);
  return now;
}

/** Tomo's face and line for the timer card, from the timer, the celebration and today's stats (no extra API). */
export function useTomoMood(): TomoMood {
  const mode = useTimerStore((state) => state.mode);
  const isRunning = useTimerStore((state) => state.isRunning);
  const justCompleted = useCelebrationStore((state) => state.pending !== null);
  const { streak, todayFocusMinutes } = useTodayStats();
  const now = useMinuteClock();
  return useMemo(
    () => pickTomoMood({ mode, isRunning, justCompleted, streak, todayFocusMinutes, now }),
    [mode, isRunning, justCompleted, streak, todayFocusMinutes, now],
  );
}
