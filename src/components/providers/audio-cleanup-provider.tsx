'use client';

import { useEffect } from 'react';
import { audioManager } from '@/lib/audio/audio-manager';

/**
 * AudioCleanupProvider
 * Ensures all audio (including orphaned HTML Audio elements and YouTube iframes)
 * is stopped and cleaned up when the app loads/reloads.
 *
 * This prevents "phantom audio" bugs where sounds play but the UI doesn't reflect it,
 * caused by stale audio elements from previous sessions.
 */
export function AudioCleanupProvider() {
  useEffect(() => {
    // Only clean up orphaned audio elements (from previous sessions)
    // Don't use globalAudioCleanup() as it destroys AudioManager state
    const orphanedAudios = document.querySelectorAll('audio:not([data-managed])');
    orphanedAudios.forEach(audio => {
      (audio as HTMLAudioElement).pause();
      audio.remove();
    });

    // Clean orphaned YouTube iframes only if AudioManager has no active YouTube
    if (!audioManager.getCurrentSource() || audioManager.getCurrentSource()?.type !== 'youtube') {
      const ytIframes = document.querySelectorAll('iframe[src*="youtube.com"]');
      ytIframes.forEach(iframe => iframe.remove());
    }

    // Optional: Also cleanup on page visibility change (when returning to tab)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // Check if there are any orphaned audio elements and clean them up
        const audioElements = document.querySelectorAll('audio:not([data-managed])');
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
