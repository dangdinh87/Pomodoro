import type { TomoFace } from '@/components/brand/tomo';
import { getBrowserTimeZone, studyDayOf } from '@/lib/stats/study-day';
import type { TimerMode } from '@/stores/timer-store';

/**
 * What Tomo shows and says, as a pure function of the app state (spec §4.2).
 * Rules are checked top to bottom; the first one that matches wins.
 */

/** Variants per situation: i18n keys `tomo.lines.<situation>.1` to `.<count>` exist in en, vi and ja. */
export const LINE_COUNTS = {
  celebration: 4,
  breakTip: 4,
  keepStreak: 4,
  sleep: 4,
  greetingMorning: 4,
  greetingAfternoon: 4,
  greetingEvening: 4,
} as const;

export type TomoSituation = keyof typeof LINE_COUNTS;

/**
 * A study day counts toward the streak with any focus time at all (see computeStreaks / the stats route:
 * one `work` session is enough), so the nudge stops as soon as today has a minute on the clock.
 */
export const KEEP_STREAK_MINUTES = 1;

/** From this local hour on (18:00) a streak with nothing done today makes Tomo worry. */
const WORRY_FROM_HOUR = 18;
/** Local hours [23:00, 04:00) are "go to sleep" time; 04:00 is also where a study day starts. */
const SLEEP_FROM_HOUR = 23;
const SLEEP_UNTIL_HOUR = 4;

export interface TomoMoodInput {
  mode: TimerMode;
  isRunning: boolean;
  /** A focus session has just run to its end and its celebration is still on screen. */
  justCompleted: boolean;
  /** Current streak in days. */
  streak: number;
  /** Focus minutes logged on today's study day. */
  todayFocusMinutes: number;
  /** The viewer's wall clock decides the hour; the study day decides which variant of a line to use. */
  now: Date;
}

export interface TomoMood {
  face: TomoFace;
  /** Full i18n key of what Tomo says, or null when Tomo stays quiet. */
  lineKey: string | null;
}

const DAY_MS = 24 * 60 * 60 * 1000;

/** One variant per study day, rolling through all of them in order, so a line never repeats back to back. */
function lineFor(situation: TomoSituation, now: Date): string {
  const day = Math.round(Date.parse(`${studyDayOf(now, getBrowserTimeZone())}T00:00:00Z`) / DAY_MS);
  const count = LINE_COUNTS[situation];
  return `tomo.lines.${situation}.${(((day % count) + count) % count) + 1}`;
}

function greetingFor(hour: number): TomoSituation {
  if (hour < 12) return 'greetingMorning';
  if (hour < WORRY_FROM_HOUR) return 'greetingAfternoon';
  return 'greetingEvening';
}

export function pickTomoMood({ mode, isRunning, justCompleted, streak, todayFocusMinutes, now }: TomoMoodInput): TomoMood {
  // 1. A focus session just ended: the celebration owns the moment
  if (justCompleted) return { face: 'party', lineKey: lineFor('celebration', now) };

  // 2. Focus is running: Tomo keeps quiet and just studies alongside
  if (mode === 'work' && isRunning) return { face: 'focus', lineKey: null };

  // 3. Break time (running or not)
  if (mode !== 'work') return { face: 'sleepy', lineKey: lineFor('breakTip', now) };

  const hour = now.getHours();

  // 4. A streak with nothing done today, and the day is running out
  if (streak > 0 && todayFocusMinutes < KEEP_STREAK_MINUTES && hour >= WORRY_FROM_HOUR) {
    return { face: 'worried', lineKey: lineFor('keepStreak', now) };
  }

  // 5. Late night
  if (hour >= SLEEP_FROM_HOUR || hour < SLEEP_UNTIL_HOUR) return { face: 'sleepy', lineKey: lineFor('sleep', now) };

  // 6. Otherwise a greeting for the time of day
  return { face: 'happy', lineKey: lineFor(greetingFor(hour), now) };
}
