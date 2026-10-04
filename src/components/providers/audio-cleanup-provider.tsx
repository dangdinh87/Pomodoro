'use client';

import { useEffect } from 'react';
import { useAmbientRestore } from '@/hooks/use-ambient-restore';

/**
 * AudioCleanupProvider
 * Ensures orphaned HTML Audio elements are stopped and cleaned up when the app loads/reloads.
 * (YouTube is not handled here: its player lives in the mini player card and goes away with it.)
 *
 * This prevents "phantom audio" bugs where sounds play but the UI doesn't reflect it,
 * caused by stale audio elements from previous sessions.
 */
export function AudioCleanupProvider() {
  // A mix restored from the last visit starts on the first gesture (autoplay policy)
  useAmbientRestore();

  useEffect(() => {
    // Only clean up orphaned audio elements (from previous sessions)
    // Don't use globalAudioCleanup() as it destroys AudioManager state
    const orphanedAudios = document.querySelectorAll<HTMLAudioElement>('audio:not([data-managed])');
    orphanedAudios.forEach(audio => {
      (audio as HTMLAudioElement).pause();
      audio.remove();
    });

    // Optional: Also cleanup on page visibility change (when returning to tab)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // Check if there are any orphaned audio elements and clean them up
        const audioElements = document.querySelectorAll<HTMLAudioElement>('audio:not([data-managed])');
        if (audioElements.length > 0) {
          audioElements.forEach(audio => {
            audio.pause();
            audio.remove();
          });
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return null; // This is a utility provider with no UI
}
