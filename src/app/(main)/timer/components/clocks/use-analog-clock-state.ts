'use client';

import { useMemo } from 'react';

export type ClockVisualState = 'idle' | 'running' | 'urgent' | 'critical' | 'complete';

export interface ClockAnimationConfig {
  state: ClockVisualState;
  /** HSL string for current ring/text color */
  color: string;
}

/** Derives visual animation state from timer props */
export function useAnalogClockState({
  timeLeft,
  isRunning,
}: {
  timeLeft: number;
  isRunning: boolean;
}): ClockAnimationConfig {
  return useMemo(() => {
    let state: ClockVisualState;

    if (timeLeft <= 0) {
      state = 'complete';
    } else if (!isRunning) {
      state = 'idle';
    } else if (timeLeft <= 10) {
      state = 'critical';
    } else if (timeLeft <= 60) {
      state = 'urgent';
    } else {
      state = 'running';
    }

    switch (state) {
      case 'idle':
      case 'running':
      case 'complete':
        return { state, color: 'hsl(var(--foreground))' };

      case 'urgent':
        return { state, color: 'hsl(30, 95%, 55%)' };

      case 'critical':
        return { state, color: 'hsl(0, 85%, 55%)' };
    }
  }, [timeLeft, isRunning]);
}
