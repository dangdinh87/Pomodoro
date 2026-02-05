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
  const prevCompletedSessionsRef = useRef<number | null>(null);
  const lastMilestoneRef = useRef<number>(0);

  useEffect(() => {
    // Subscribe to timer store changes
    const unsub = useTimerStore.subscribe((state, prevState) => {
      const { mode, isRunning, completedSessions } = state;

      // Detect mode changes
      if (prevModeRef.current !== null && prevModeRef.current !== mode) {
        // Mode changed from work to break = SESSION_END
        if (prevModeRef.current === 'work' && (mode === 'shortBreak' || mode === 'longBreak')) {
          handleEvent('SESSION_END');

          // Check for milestones (5, 10, 15, 20...)
          const milestones = [5, 10, 15, 20, 25, 30, 50, 100];
          for (const milestone of milestones) {
            if (completedSessions >= milestone && lastMilestoneRef.current < milestone) {
              lastMilestoneRef.current = milestone;
              // Delay milestone event to not overlap with SESSION_END
              setTimeout(() => {
                handleEvent('MILESTONE_REACHED');
              }, 5000);
              break;
            }
          }
        }

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
        }
      }

      // Update refs
      prevModeRef.current = mode;
      prevIsRunningRef.current = isRunning;
      prevCompletedSessionsRef.current = completedSessions;
    });

    // Initialize refs with current state
    const { mode, isRunning, completedSessions } = useTimerStore.getState();
    prevModeRef.current = mode;
    prevIsRunningRef.current = isRunning;
    prevCompletedSessionsRef.current = completedSessions;

    // Initialize milestone tracking
    const milestones = [5, 10, 15, 20, 25, 30, 50, 100];
    for (const milestone of milestones) {
      if (completedSessions >= milestone) {
        lastMilestoneRef.current = milestone;
      }
    }

    // Set initial mascot state based on current timer state
    if (isRunning && mode === 'work') {
      handleEvent('SESSION_START');
    } else if (isRunning && (mode === 'shortBreak' || mode === 'longBreak')) {
      handleEvent('BREAK_START');
    }

    return () => unsub();
  }, [handleEvent]);
}
