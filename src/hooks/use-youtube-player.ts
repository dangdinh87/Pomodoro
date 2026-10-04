'use client';

import { useCallback, useMemo } from 'react';
import { nextYouTubeVideo, playYouTube, previousYouTubeVideo, stopYouTube, toggleYouTubePlayback } from '@/lib/audio/youtube-controller';
import { useYouTubeStore, type YouTubeSource, type YouTubeStatus } from '@/stores/youtube-player-store';

export type { YouTubeSource };

export interface YouTubePlayerState {
  status: YouTubeStatus;
  currentSource: YouTubeSource | null;
}

export interface ParsedYouTubeUrl {
  videoId?: string;
  listId?: string;
  isChannel?: boolean;
}

// YouTube URL parsing utility
export const parseYouTubeUrl = (url: string): ParsedYouTubeUrl => {
  if (!url) return {};

  try {
    const u = new URL(url);

    if (u.hostname === 'youtu.be') {
      const id = u.pathname.split('/').filter(Boolean)[0];
      return id ? { videoId: id } : {};
    }

    if (u.hostname === 'youtube.com' || u.hostname.endsWith('.youtube.com')) {
      if (u.pathname.startsWith('/watch')) {
        return {
          videoId: u.searchParams.get('v') || undefined,
          listId: u.searchParams.get('list') || undefined
        };
      }
      if (u.pathname.startsWith('/shorts/') || u.pathname.startsWith('/live/')) {
        const id = u.pathname.split('/').filter(Boolean)[1];
        return id ? { videoId: id } : {};
      }
      if (u.pathname.startsWith('/playlist')) {
        return { listId: u.searchParams.get('list') || undefined };
      }
      if (u.pathname.startsWith('/c/') || u.pathname.startsWith('/channel/')) {
        return { isChannel: true };
      }
    }
    return {};
  } catch {
    return {};
  }
};

/**
 * The Sounds panel's handle on the YouTube player. The player itself is shown by the mini player card
 * (always mounted in AppProviders), so playing from here makes that card appear; nothing plays unseen.
 */
export const useYouTubePlayer = () => {
  const status = useYouTubeStore((state) => state.status);
  const currentSource = useYouTubeStore((state) => state.source);

  const playerState = useMemo<YouTubePlayerState>(() => ({ status, currentSource }), [status, currentSource]);

  // Same source: pause or resume. Another source: play it.
  const togglePlayback = useCallback(async (videoId?: string, listId?: string, isChannel?: boolean) => {
    if (isChannel || (!videoId && !listId)) return;

    const current = useYouTubeStore.getState().source;
    const isSameSource = Boolean(current && (videoId ? current.videoId === videoId : current.listId === listId));
    if (isSameSource) {
      toggleYouTubePlayback();
      return;
    }
    await playYouTube(listId && !videoId ? { listId } : { videoId });
  }, []);

  const stopPlayback = useCallback(() => stopYouTube(), []);

  return {
    playerState,
    /** Plays a video or playlist (replacing what plays now). */
    play: playYouTube,
    togglePlayback,
    stopPlayback,
    nextVideo: nextYouTubeVideo,
    previousVideo: previousYouTubeVideo,
  };
};
