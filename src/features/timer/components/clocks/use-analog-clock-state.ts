'use client';

import { useMemo } from 'react';
import { getClockVisualState, type ClockVisualState } from './clock-math';

export type { ClockVisualState };

export interface ClockAnimationConfig {
  state: ClockVisualState;
  /** Text colour: ink normally, amber / rose in the low-time warning */
  color: string;
  /** Ring / bar colour: the mode accent normally, amber / rose in the low-time warning */
  accent: string;
  /** Only the last 10 seconds pulse; the last minute just changes colour */
  pulse: boolean;
}

/** Derives visual state from timer props. `warn` = the "low time warning" setting. */
export function useAnalogClockState({
  timeLeft,
  isRunning,
  warn = true,
}: {
  timeLeft: number;
  isRunning: boolean;
  warn?: boolean;
}): ClockAnimationConfig {
  return useMemo(() => {
    const state = getClockVisualState(timeLeft, isRunning, warn);
    switch (state) {
      case 'urgent':
        return { state, color: 'var(--amber-meter)', accent: 'var(--amber-meter)', pulse: false };
      case 'critical':
        return { state, color: 'var(--rose-solid)', accent: 'var(--rose-solid)', pulse: true };
      default:
        return { state, color: 'var(--ink)', accent: 'var(--accent)', pulse: false };
    }
  }, [timeLeft, isRunning, warn]);
}
