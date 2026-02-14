'use client';

import { useMemo } from 'react';
import { getClockState, ClockVisualState, ClockAnimationConfig } from './clock-state-utils';

export type { ClockVisualState, ClockAnimationConfig };

/** Derives visual animation state from timer props */
export function useAnalogClockState({
  timeLeft,
  isRunning,
}: {
  timeLeft: number;
  isRunning: boolean;
}): ClockAnimationConfig {
  return useMemo(() => {
    return getClockState(timeLeft, isRunning);
  }, [timeLeft, isRunning]);
}
