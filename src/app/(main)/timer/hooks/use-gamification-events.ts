import { useEffect, useRef } from 'react';
import { useTimerStore, type TimerMode } from '@/stores/timer-store';
import { useGamificationStore } from '@/stores/gamification-store';

/**
 * Hook that subscribes to timer state changes and triggers gamification rewards.
 * Should be used in the timer page to sync XP/coins/badges with timer completions.
 */
export function useGamificationEvents() {
  const completePomodoro = useGamificationStore((state) => state.completePomodoro);

  const prevModeRef = useRef<TimerMode | null>(null);

  useEffect(() => {
    // Subscribe to timer store changes
    const unsub = useTimerStore.subscribe((state) => {
      const { mode, settings } = state;

      // Detect work session completion (mode changed from work to break)
      // Note: completePomodoro internally calls checkAndUnlockBadges
      if (prevModeRef.current !== null && prevModeRef.current !== mode) {
        if (
          prevModeRef.current === 'work' &&
          (mode === 'shortBreak' || mode === 'longBreak')
        ) {
          // Work session completed - award XP, coins, update stats
          const workDuration = settings.workDuration;
          completePomodoro(workDuration);
        }
      }

      // Update ref
      prevModeRef.current = mode;
    });

    // Initialize ref with current state
    const { mode } = useTimerStore.getState();
    prevModeRef.current = mode;

    return () => unsub();
  }, [completePomodoro]);
}
