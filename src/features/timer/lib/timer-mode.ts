import { useTimerStore, type TimerMode } from '@/stores/timer-store';

type DurationSettings = { workDuration: number; shortBreakDuration: number; longBreakDuration: number };

export function modeDurationSec(mode: TimerMode, settings: DurationSettings) {
  const minutes =
    mode === 'work' ? settings.workDuration : mode === 'shortBreak' ? settings.shortBreakDuration : settings.longBreakDuration;
  return minutes * 60;
}

/** Started, paused or running: switching mode now would throw that progress away. */
export function timerHasProgress() {
  const { isRunning, timeLeft, mode, settings } = useTimerStore.getState();
  return isRunning || timeLeft < modeDurationSec(mode, settings);
}

/** Stops the timer and loads the full duration of `mode`. */
export function switchTimerMode(mode: TimerMode) {
  const state = useTimerStore.getState();
  const duration = modeDurationSec(mode, state.settings);
  state.setIsRunning(false);
  state.setDeadlineAt(null);
  state.setMode(mode);
  state.setTimeLeft(duration);
  state.setLastSessionTimeLeft(duration);
}
