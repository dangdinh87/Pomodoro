import { useStats } from '@/hooks/use-stats';
import { studyTodayDate } from '@/lib/stats/study-day';

/**
 * Streak and today's focus time from the stats query the timer card already runs
 * (same query key as DailyProgress, so no extra request). Zeros until the first answer.
 */
export function useTodayStats() {
  const today = studyTodayDate();
  const { data } = useStats({ from: today, to: today });
  const seconds = data?.summary.totalFocusTime ?? 0;
  return {
    streak: data?.summary.streak.current ?? 0,
    /** Rounded up: any recorded time keeps the streak alive, even under a minute. */
    todayFocusMinutes: Math.ceil(seconds / 60),
  };
}
