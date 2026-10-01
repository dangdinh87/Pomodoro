export type AnnouncerMode = 'work' | 'shortBreak' | 'longBreak';

export interface AnnouncerState {
  mode: AnnouncerMode;
  timeLeft: number;
  isRunning: boolean;
}

type Translate = (key: string, vars?: Record<string, string | number>) => string;

/** Remaining time is announced every 5 minutes, plus once at 1 minute left. */
export const ANNOUNCE_INTERVAL_SECONDS = 300;
export const ANNOUNCE_FINAL_MINUTE_SECONDS = 60;
/** A phase counts as "completed" (vs. manually switched) when it ended this close to 0. */
const COMPLETION_TOLERANCE_SECONDS = 2;

const spokenUnit = (count: number, singularKey: string, pluralKey: string, t: Translate) =>
  t(count === 1 ? singularKey : pluralKey, { count });

/** Human-readable duration, e.g. "5 minutes", "1 minute 30 seconds". */
export function formatSpokenTime(totalSeconds: number, t: Translate): string {
  const s = Math.max(0, Math.round(totalSeconds));
  const minutes = Math.floor(s / 60);
  const seconds = s % 60;
  const minutesPart = spokenUnit(minutes, 'timerAnnouncer.minute', 'timerAnnouncer.minutes', t);
  const secondsPart = spokenUnit(seconds, 'timerAnnouncer.second', 'timerAnnouncer.seconds', t);
  if (minutes === 0) return secondsPart;
  if (seconds === 0) return minutesPart;
  return `${minutesPart} ${secondsPart}`;
}

/**
 * Pure: returns the message to announce for a state transition, or null when
 * nothing should be said (never announces every second).
 */
export function getTimerAnnouncement(
  prev: AnnouncerState,
  next: AnnouncerState,
  t: Translate,
): string | null {
  const modeLabel = (m: AnnouncerMode) => t(`timerAnnouncer.mode.${m}`);

  if (prev.mode !== next.mode) {
    if (prev.isRunning && prev.timeLeft <= COMPLETION_TOLERANCE_SECONDS) {
      return t('timerAnnouncer.completed', {
        mode: modeLabel(prev.mode),
        next: modeLabel(next.mode),
      });
    }
    return null;
  }

  if (!prev.isRunning && next.isRunning) {
    return t('timerAnnouncer.started', {
      mode: modeLabel(next.mode),
      time: formatSpokenTime(next.timeLeft, t),
    });
  }

  if (prev.isRunning && !next.isRunning) {
    // Reaching zero is reported by the phase-completed message instead, and a
    // reset (time goes back up) is a deliberate user action — stay silent.
    if (next.timeLeft <= 0 || next.timeLeft > prev.timeLeft) return null;
    return t('timerAnnouncer.paused', {
      time: formatSpokenTime(next.timeLeft, t),
    });
  }

  if (prev.isRunning && next.isRunning && next.timeLeft < prev.timeLeft && next.timeLeft > 0) {
    // Crossing checks (not equality): a throttled background tab or drift
    // correction can skip the exact second.
    if (prev.timeLeft > ANNOUNCE_FINAL_MINUTE_SECONDS && next.timeLeft <= ANNOUNCE_FINAL_MINUTE_SECONDS) {
      return t('timerAnnouncer.oneMinute');
    }
    const milestone = Math.ceil(next.timeLeft / ANNOUNCE_INTERVAL_SECONDS) * ANNOUNCE_INTERVAL_SECONDS;
    if (milestone < prev.timeLeft) {
      return t('timerAnnouncer.remaining', {
        time: formatSpokenTime(milestone, t),
      });
    }
  }

  return null;
}
