'use client';

import { useEffect } from 'react';
import { useAudioStore } from '@/stores/audio-store';
import { useTimerStore } from '@/stores/timer-store';

/** Gestures that may still be refused (e.g. a modifier key): give up after this many tries. */
export const MAX_RESTORE_ATTEMPTS = 3;

/**
 * A mix restored after a reload cannot sound until the browser sees a user gesture.
 * This starts it on the first pointer press or key press, or when the timer starts,
 * then stops listening. Mount once, near the app root.
 */
export function useAmbientRestore() {
  useEffect(() => {
    let attempts = 0;
    let busy = false;
    let detached = false;

    const waiting = () => useAudioStore.getState().ambientRestore === 'autoplay';

    const detach = () => {
      if (detached) return;
      detached = true;
      window.removeEventListener('pointerdown', attempt);
      window.removeEventListener('keydown', attempt);
      unsubTimer();
      unsubAudio();
    };

    async function attempt() {
      if (busy || detached || !waiting()) return;
      busy = true;
      try {
        const started = await useAudioStore.getState().startRestoredAmbient();
        if (started) {
          detach();
        } else if (++attempts >= MAX_RESTORE_ATTEMPTS) {
          useAudioStore.getState().dropUnstartedAmbient();
          detach();
        }
      } finally {
        busy = false;
      }
    }

    window.addEventListener('pointerdown', attempt, { passive: true });
    window.addEventListener('keydown', attempt);
    const unsubTimer = useTimerStore.subscribe((state, prev) => {
      if (state.isRunning && !prev.isRunning) void attempt();
    });
    // Cleared or started by other means: nothing left to wait for
    const unsubAudio = useAudioStore.subscribe((state) => {
      if (state.ambientRestore !== 'autoplay' && !busy) detach();
    });

    if (!waiting()) detach();
    return detach;
  }, []);
}
