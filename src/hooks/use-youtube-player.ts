'use client';

import { useEffect, useState, useCallback } from 'react';
import { toast } from 'sonner';
import { useAudioStore } from '@/stores/audio-store';
import { fetchYouTubeOEmbed } from '@/lib/youtube-utils';

// Type definitions
export interface YouTubeSource {
  videoId?: string;
  listId?: string;
}

export interface YouTubePlayerState {
  status: 'stopped' | 'playing' | 'paused' | 'buffering';
  currentSource: YouTubeSource | null;
}

export interface ParsedYouTubeUrl {
  videoId?: string;
  listId?: string;
  isChannel?: boolean;
}

// Global YouTube player management
const GLOBAL_YT_PLAYER_KEY = '__globalYTPlayer';
const GLOBAL_YT_SOURCE_KEY = '__globalYTSource';
const GLOBAL_YT_CONTAINER_ID = 'youtube-global-container';

// YouTube player state mapping
const YT_STATE_MAP: Record<number, YouTubePlayerState['status']> = {
  1: 'playing',
  2: 'paused',
  3: 'buffering',
};

declare global {
  interface Window {
    [GLOBAL_YT_PLAYER_KEY]?: any;
    [GLOBAL_YT_SOURCE_KEY]?: YouTubeSource | null;
    onYouTubeIframeAPIReady?: () => void;
    YT?: any;
  }
}

// Helper functions
const getOrCreateGlobalYTContainer = (): HTMLDivElement => {
  let el = document.getElementById(GLOBAL_YT_CONTAINER_ID) as HTMLDivElement | null;
  if (!el) {
    el = document.createElement('div');
    el.id = GLOBAL_YT_CONTAINER_ID;
    Object.assign(el.style, {
      position: 'fixed',
      width: '0px',
      height: '0px',
      left: '-9999px',
      top: '0',
      display: 'none',
    });
    document.body.appendChild(el);
  }
  return el;
};

const setGlobalYT = (player: any): void => {
  window[GLOBAL_YT_PLAYER_KEY] = player;
};

const getGlobalYT = (): any => window[GLOBAL_YT_PLAYER_KEY] || null;

const setGlobalYTSource = (source: YouTubeSource | null): void => {
  window[GLOBAL_YT_SOURCE_KEY] = source;
};

const getGlobalYTSource = (): YouTubeSource | null => window[GLOBAL_YT_SOURCE_KEY] || null;

// YouTube URL parsing utility
export const parseYouTubeUrl = (url: string): ParsedYouTubeUrl => {
  if (!url) return {};

  try {
    const u = new URL(url);

    if (u.hostname === 'youtu.be') {
      const id = u.pathname.split('/').filter(Boolean)[0];
      return id ? { videoId: id } : {};
    }

    if (u.hostname.includes('youtube.com')) {
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

// YouTube API loading utility
const ensureYouTubeAPI = (): Promise<any> => {
  return new Promise((resolve) => {
    if (window.YT?.Player) {
      resolve(window.YT);
      return;
    }

    if (!document.getElementById('youtube-iframe-api')) {
      const script = document.createElement('script');
      script.id = 'youtube-iframe-api';
      script.src = 'https://www.youtube.com/iframe_api';
      document.body.appendChild(script);
    }

    window.onYouTubeIframeAPIReady = () => resolve(window.YT);
  });
};

// Helper to update audio store with YouTube info
const updateAudioStoreForYouTube = (
  source: YouTubeSource,
  isPlaying: boolean,
  setCurrentlyPlaying: (audio: any) => void
) => {
  const id = source.videoId ? `video-${source.videoId}` : source.listId ? `playlist-${source.listId}` : '';
  const name = source.videoId ? 'YouTube Video' : 'YouTube Playlist';
  const url = source.videoId
    ? `https://www.youtube.com/watch?v=${source.videoId}`
    : `https://www.youtube.com/playlist?list=${source.listId}`;

  setCurrentlyPlaying({
    type: 'youtube',
    id,
    name,
    volume: 50,
    isPlaying,
    source: { type: 'youtube', id, name, url, volume: 50, loop: false }
  });

  // Fetch real title
  fetchYouTubeOEmbed(url).then(data => {
    if (data?.title) {
      const current = useAudioStore.getState().currentlyPlaying;
      if (current?.id === id) {
        setCurrentlyPlaying({ ...current, name: data.title });
      }
    }
  });
};

// Main YouTube player hook
export const useYouTubePlayer = () => {
  const setCurrentlyPlaying = useAudioStore((state) => state.setCurrentlyPlaying);
  const updatePlayingStatus = useAudioStore((state) => state.updatePlayingStatus);
  const clearCurrentlyPlaying = useAudioStore((state) => state.clearCurrentlyPlaying);

  const [playerState, setPlayerState] = useState<YouTubePlayerState>({
    status: 'stopped',
    currentSource: null,
  });

  // Update player state from global player
  const updatePlayerState = useCallback(() => {
    try {
      const yt = getGlobalYT();
      const state = yt?.getPlayerState?.();
      const mappedStatus = state !== undefined ? YT_STATE_MAP[state] || 'stopped' : 'stopped';
      const source = getGlobalYTSource();

      setPlayerState({
        status: mappedStatus,
        currentSource: source,
      });

      const currentPlaying = useAudioStore.getState().currentlyPlaying;

      // Sync audio store with YouTube player state
      if (mappedStatus === 'stopped' || !source) {
        // Only clear if current audio is YouTube
        if (currentPlaying?.type === 'youtube') {
          clearCurrentlyPlaying();
        }
      } else if (mappedStatus === 'playing' || mappedStatus === 'paused') {
        if (currentPlaying?.type === 'youtube') {
          // Update playing status for existing YouTube audio
          updatePlayingStatus(mappedStatus === 'playing');
        } else if (!currentPlaying) {
          // No audio playing - set YouTube as current
          updateAudioStoreForYouTube(source, mappedStatus === 'playing', setCurrentlyPlaying);
        }
      }
    } catch {
      setPlayerState(prev => ({ ...prev, status: 'stopped' }));
    }
  }, [updatePlayingStatus, clearCurrentlyPlaying, setCurrentlyPlaying]);

  // Poll for player state changes
  useEffect(() => {
    const interval = window.setInterval(updatePlayerState, 800);
    return () => window.clearInterval(interval);
  }, [updatePlayerState]);

  // Create or update YouTube player
  const createOrUpdatePlayer = useCallback(async (
    videoIdOrListId: string,
    autoPlay: boolean,
    options?: { isPlaylist?: boolean }
  ) => {
    try {
      const YT = await ensureYouTubeAPI();
      const existingPlayer = getGlobalYT();
      const isPlaylist = options?.isPlaylist;
      const source: YouTubeSource = isPlaylist
        ? { listId: videoIdOrListId }
        : { videoId: videoIdOrListId };

      if (existingPlayer) {
        if (autoPlay) {
          try { existingPlayer.unMute?.(); } catch { /* ignore */ }
        }

        if (isPlaylist) {
          existingPlayer.loadPlaylist?.({ list: videoIdOrListId }) ||
            existingPlayer.cuePlaylist?.({ list: videoIdOrListId });
        } else {
          existingPlayer.loadVideoById(videoIdOrListId);
        }

        if (autoPlay) existingPlayer.playVideo?.();
        setGlobalYTSource(source);
        updateAudioStoreForYouTube(source, autoPlay, setCurrentlyPlaying);
        return;
      }

      // Create new player
      const container = getOrCreateGlobalYTContainer();
      const player = new YT.Player(container, {
        videoId: isPlaylist ? undefined : videoIdOrListId,
        playerVars: {
          rel: 0,
          modestbranding: 1,
          controls: 1,
          ...(isPlaylist && { list: videoIdOrListId })
        },
        events: {
          onReady: () => {
            if (autoPlay) {
              try { player.unMute?.(); } catch { /* ignore */ }
              try { player.playVideo?.(); } catch { /* ignore */ }
              toast.success('Đang phát nền • Nhạc sẽ tiếp tục khi đóng cửa sổ 🎧');
            }
          },
          onStateChange: (e: any) => {
            const state = e?.data;
            const mappedStatus = state !== undefined ? YT_STATE_MAP[state] || 'stopped' : 'stopped';
            setPlayerState(prev => ({ ...prev, status: mappedStatus }));
          },
        },
      });

      setGlobalYT(player);
      setGlobalYTSource(source);
      updateAudioStoreForYouTube(source, autoPlay, setCurrentlyPlaying);
    } catch (error) {
      console.error('Failed to create or update YouTube player:', error);
      toast.error('Không thể tạo trình phát YouTube. Vui lòng thử lại.');
    }
  }, [setCurrentlyPlaying]);

  // Toggle playback - only toggle if same source, otherwise play new source
  const togglePlayback = useCallback(async (videoId?: string, listId?: string, isChannel?: boolean) => {
    if (isChannel || (!videoId && !listId)) return;

    try {
      const yt = getGlobalYT();
      const currentSource = getGlobalYTSource();

      // Check if requested source matches current source
      const isSameSource = currentSource && (
        (videoId && currentSource.videoId === videoId) ||
        (listId && !videoId && currentSource.listId === listId)
      );

      if (!yt || !isSameSource) {
        // No player or different source -> play new source
        if (listId && !videoId) {
          await createOrUpdatePlayer(listId, true, { isPlaylist: true });
        } else if (videoId) {
          await createOrUpdatePlayer(videoId, true);
        }
        return;
      }

      // Same source - toggle play/pause
      const state = yt.getPlayerState?.();
      if (state === 1) {
        yt.pauseVideo();
      } else {
        yt.playVideo();
      }
    } catch (error) {
      console.error('Failed to toggle playback:', error);
      toast.error('Không thể điều khiển trình phát. Vui lòng thử lại.');
    }
  }, [createOrUpdatePlayer]);

  // Stop playback
  const stopPlayback = useCallback(() => {
    try {
      getGlobalYT()?.stopVideo();
    } catch {
      // Ignore errors when stopping
    }
    setPlayerState({
      status: 'stopped',
      currentSource: null,
    });
    setGlobalYTSource(null);
    // Clear audio store
    clearCurrentlyPlaying();
  }, [clearCurrentlyPlaying]);

  // Sync volume and mute state with global audio settings
  const audioSettings = useAudioStore((state) => state.audioSettings);

  useEffect(() => {
    const player = getGlobalYT();
    if (player && typeof player.setVolume === 'function') {
      player.setVolume(audioSettings.volume);
    }
    if (player && typeof player.mute === 'function' && typeof player.unMute === 'function') {
      if (audioSettings.isMuted) {
        player.mute();
      } else {
        player.unMute();
      }
    }
  }, [audioSettings.volume, audioSettings.isMuted]);

  return {
    playerState,
    createOrUpdatePlayer,
    togglePlayback,
    stopPlayback,
    updatePlayerState,
  };
};