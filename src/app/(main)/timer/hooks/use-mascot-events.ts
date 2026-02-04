import { useEffect, useRef } from 'react';
import { useTimerStore, type TimerMode } from '@/stores/timer-store';
import { useMascotStore } from '@/stores/mascot-store';

/**
 * Hook that subscribes to timer state changes and emits mascot events.
 * Should be used in the timer page to sync mascot expressions with timer state.
 */
export function useMascotEvents() {
  const handleEvent = useMascotStore((state) => state.handleEvent);
  const prevModeRef = useRef<TimerMode | null>(null);
  const prevIsRunningRef = useRef<boolean | null>(null);

  useEffect(() => {
    // Subscribe to timer store changes
    const unsub = useTimerStore.subscribe((state, prevState) => {
      const { mode, isRunning } = state;

      // Detect mode changes
      if (prevModeRef.current !== null && prevModeRef.current !== mode) {
        // Mode changed
        if (mode === 'work') {
          // Starting a work session
          if (isRunning) {
            handleEvent('SESSION_START');
          }
        } else if (mode === 'shortBreak' || mode === 'longBreak') {
          // Break started
          handleEvent('BREAK_START');
        }
      }

      // Detect running state changes
      if (prevIsRunningRef.current !== null && prevIsRunningRef.current !== isRunning) {
        if (isRunning && mode === 'work') {
          // Work session started/resumed
          handleEvent('SESSION_START');
        } else if (!isRunning && mode === 'work' && prevIsRunningRef.current) {
          // Work session paused (not triggering event here, only on complete)
        }
      }

      // Update refs
      prevModeRef.current = mode;
      prevIsRunningRef.current = isRunning;
    });

    // Initialize refs with current state
    const { mode, isRunning } = useTimerStore.getState();
    prevModeRef.current = mode;
    prevIsRunningRef.current = isRunning;

    // Set initial mascot state based on current timer state
    if (isRunning && mode === 'work') {
      handleEvent('SESSION_START');
    } else if (isRunning && (mode === 'shortBreak' || mode === 'longBreak')) {
      handleEvent('BREAK_START');
    }

    return () => unsub();
  }, [handleEvent]);
}
