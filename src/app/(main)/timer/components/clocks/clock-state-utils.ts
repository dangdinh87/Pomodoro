
export type ClockVisualState = 'idle' | 'running' | 'urgent' | 'critical' | 'complete';

export interface ClockAnimationConfig {
  state: ClockVisualState;
  /** HSL string for current ring/text color */
  color: string;
}

/** Pure function to derive visual animation state from timer props */
export function getClockState(timeLeft: number, isRunning: boolean): ClockAnimationConfig {
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
}
