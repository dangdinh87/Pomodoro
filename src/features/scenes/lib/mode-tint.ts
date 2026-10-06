export type TimerMode = 'focus' | 'shortBreak' | 'longBreak';
export type Rgb = [number, number, number];

// Brighter than the stage tint: these colour light sources inside a scene, not the whole background.
export const MODE_TINTS: Record<TimerMode, Rgb> = {
  focus: [0.93, 0.36, 0.27],
  shortBreak: [0.18, 0.78, 0.68],
  longBreak: [0.35, 0.52, 0.98],
};

export function parseTimerMode(value: string | null | undefined): TimerMode {
  return value === 'shortBreak' || value === 'longBreak' ? value : 'focus';
}

export function lerpRgb(from: Rgb, to: Rgb, k: number): Rgb {
  return [from[0] + (to[0] - from[0]) * k, from[1] + (to[1] - from[1]) * k, from[2] + (to[2] - from[2]) * k];
}
