import { useEffect } from 'react';
import { useTimerStore } from '@/stores/timer-store';

export function isWakeLockSupported(): boolean {
  return typeof navigator !== 'undefined' && 'wakeLock' in navigator;
}

/**
 * Keeps the screen awake while a focus session runs (opt-in setting). Breaks and
 * paused timers let the screen sleep. The browser drops the lock whenever the tab
 * is hidden, so it is requested again when the tab becomes visible.
 */
export function useScreenWakeLock() {
  const keepScreenOn = useTimerStore((s) => s.settings.keepScreenOn);
  const isRunning = useTimerStore((s) => s.isRunning);
  const mode = useTimerStore((s) => s.mode);
  const active = Boolean(keepScreenOn) && isRunning && mode === 'work';

  useEffect(() => {
    if (!active || !isWakeLockSupported()) return;

    let sentinel: WakeLockSentinel | null = null;
    let requesting = false;
    let stopped = false;

    const acquire = async () => {
      // A hidden tab is refused; one request at a time; never stack locks
      if (stopped || sentinel || requesting || document.visibilityState !== 'visible') return;
      requesting = true;
      try {
        const lock = await navigator.wakeLock.request('screen');
        if (stopped) {
          void lock.release().catch(() => {});
          return;
        }
        sentinel = lock;
        lock.addEventListener('release', () => {
          if (sentinel === lock) sentinel = null;
        });
      } catch {
        // Refused (battery saver, policy): the screen just sleeps as usual
      } finally {
        requesting = false;
      }
    };

    const onVisibility = () => {
      if (document.visibilityState === 'visible') void acquire();
    };

    void acquire();
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      stopped = true;
      document.removeEventListener('visibilitychange', onVisibility);
      const held = sentinel;
      sentinel = null;
      void held?.release().catch(() => {});
    };
  }, [active]);
}
