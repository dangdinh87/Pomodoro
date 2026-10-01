export type DurationKey = 'workDuration' | 'shortBreakDuration' | 'longBreakDuration' | 'longBreakInterval';

export const DURATION_LIMITS: Record<DurationKey, { min: number; max: number }> = {
  workDuration: { min: 1, max: 120 },
  shortBreakDuration: { min: 1, max: 30 },
  longBreakDuration: { min: 1, max: 60 },
  longBreakInterval: { min: 2, max: 10 },
};

export interface DurationPreset {
  workDuration: number;
  shortBreakDuration: number;
  longBreakDuration: number;
}

/** Well-known focus/break rhythms: Pomodoro, 50/10, DeskTime's 52/17, and a 90-minute deep-work block. */
export const DURATION_PRESETS: readonly DurationPreset[] = [
  { workDuration: 25, shortBreakDuration: 5, longBreakDuration: 15 },
  { workDuration: 50, shortBreakDuration: 10, longBreakDuration: 30 },
  { workDuration: 52, shortBreakDuration: 17, longBreakDuration: 30 },
  { workDuration: 90, shortBreakDuration: 20, longBreakDuration: 30 },
];

export function clampDuration(key: DurationKey, value: number): number {
  const { min, max } = DURATION_LIMITS[key];
  return Math.max(min, Math.min(max, Math.round(value)));
}

/** Parses free-typed input; falls back when it is not a number, then clamps. */
export function parseDuration(key: DurationKey, input: string, fallback: number): number {
  const n = parseInt(input, 10);
  return clampDuration(key, Number.isNaN(n) ? fallback : n);
}

/** Index of the preset matching focus + short break, or -1 for a custom rhythm. */
export function matchPreset(work: number, shortBreak: number): number {
  return DURATION_PRESETS.findIndex((p) => p.workDuration === work && p.shortBreakDuration === shortBreak);
}

/** Total minutes of one full cycle: N focus sessions, N-1 short breaks, one long break. */
export function cycleMinutes(s: DurationPreset & { longBreakInterval: number }): number {
  const n = s.longBreakInterval;
  return n * s.workDuration + (n - 1) * s.shortBreakDuration + s.longBreakDuration;
}
