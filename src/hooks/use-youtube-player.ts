'use client';

import { useEffect, useState, useCallback } from 'react';
import { toast } from 'sonner';
import { useAudioStore } from '@/stores/audio-store';
import { fetchYouTubeOEmbed } from '@/lib/youtube-utils';

// Type definitions for better type safety
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

// Window interface extension for type safety
declare global {
  interface Window {
    [GLOBAL_YT_PLAYER_KEY]?: any;
    [GLOBAL_YT_SOURCE_KEY]?: YouTubeSource | null;
    onYouTubeIframeAPIReady?: () => void;
    YT?: any;
  }
}

// Helper functions for global YouTube player management
const getOrCreateGlobalYTContainer = (): HTMLDivElement => {
  let el = document.getElementById(GLOBAL_YT_CONTAINER_ID) as HTMLDivElement | null;
  if (!el) {
    el = document.createElement('div');
    el.id = GLOBAL_YT_CONTAINER_ID;
    el.style.position = 'fixed';
    el.style.width = '0px';
    el.style.height = '0px';
    el.style.left = '-9999px';
    el.style.top = '0';
    el.style.display = 'none';
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

const getGlobalYTSource = (): YouTubeSource | null => {
  return window[GLOBAL_YT_SOURCE_KEY] || null;
};

// YouTube URL parsing utility
export const parseYouTubeUrl = (url: string): ParsedYouTubeUrl => {
  if (!url) return {};

  try {
    const u = new URL(url);

    // Handle youtu.be short URLs
    if (u.hostname === 'youtu.be') {
      const id = u.pathname.split('/').filter(Boolean)[0];
      return id ? { videoId: id } : {};
    }

    // Handle youtube.com URLs
    if (u.hostname.includes('youtube.com')) {
      // Regular video URLs
      if (u.pathname.startsWith('/watch')) {
        const vid = u.searchParams.get('v') || undefined;
        const list = u.searchParams.get('list') || undefined;
        return { videoId: vid, listId: list };
      }

      // Shorts
      if (u.pathname.startsWith('/shorts/')) {
        const id = u.pathname.split('/').filter(Boolean)[1];
        return id ? { videoId: id } : {};
      }

      // Live streams
      if (u.pathname.startsWith('/live/')) {
        const id = u.pathname.split('/').filter(Boolean)[1];
        return id ? { videoId: id } : {};
      }

      // Playlists
      if (u.pathname.startsWith('/playlist')) {
        const list = u.searchParams.get('list') || undefined;
        return { listId: list };
      }

      // Channels
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
    if (window.YT && window.YT.Player) {
      resolve(window.YT);
      return;
    }

    const existingScript = document.getElementById('youtube-iframe-api') as HTMLScriptElement | null;
    if (!existingScript) {
      const script = document.createElement('script');
      script.id = 'youtube-iframe-api';
      script.src = 'https://www.youtube.com/iframe_api';
      document.body.appendChild(script);
    }

    window.onYouTubeIframeAPIReady = () => {
      resolve(window.YT);
    };
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

      // Sync with audio store
      if (mappedStatus === 'stopped' || !source) {
        clearCurrentlyPlaying();
      } else if (mappedStatus === 'playing' || mappedStatus === 'paused') {
        // Check if we need to set currentlyPlaying
        const currentPlaying = useAudioStore.getState().currentlyPlaying;

        // If no currentlyPlaying or it's not YouTube, set it
        if (!currentPlaying || currentPlaying.type !== 'youtube') {
          const id = source.videoId ? `video-${source.videoId}` : source.listId ? `playlist-${source.listId}` : '';
          const name = source.videoId ? `YouTube Video` : `YouTube Playlist`;

          setCurrentlyPlaying({
            type: 'youtube',
            id,
            name,
            volume: 50,
            isPlaying: mappedStatus === 'playing',
            source: {
              type: 'youtube',
              id,
              name,
              url: '',
              volume: 50,
              loop: false
            }
          });
        } else {
          // Just update playing status
          updatePlayingStatus(mappedStatus === 'playing');
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

      if (existingPlayer) {
        // Update existing player
        if (autoPlay) {
          try {
            existingPlayer.unMute?.();
          } catch {
            // Ignore errors when unmuting
          }
        }

        if (options?.isPlaylist) {
          if (typeof existingPlayer.loadPlaylist === 'function') {
            existingPlayer.loadPlaylist({ list: videoIdOrListId });
          } else if (typeof existingPlayer.cuePlaylist === 'function') {
            existingPlayer.cuePlaylist({ list: videoIdOrListId });
          }
          if (autoPlay) existingPlayer.playVideo?.();
          setGlobalYTSource({ listId: videoIdOrListId });
          // Update audio store
          setCurrentlyPlaying({
            type: 'youtube',
            id: `playlist-${videoIdOrListId}`,
            name: `YouTube Playlist`,
            volume: 50,
            isPlaying: autoPlay,
            source: { type: 'youtube', id: `playlist-${videoIdOrListId}`, name: 'YouTube Playlist', url: '', volume: 50, loop: false }
          });

          // Fetch real title
          fetchYouTubeOEmbed(`https://www.youtube.com/playlist?list=${videoIdOrListId}`).then(data => {
            if (data && data.title) {
              const current = useAudioStore.getState().currentlyPlaying;
              if (current && current.id === `playlist-${videoIdOrListId}`) {
                setCurrentlyPlaying({ ...current, name: data.title });
              }
            }
          });
        } else {
          existingPlayer.loadVideoById(videoIdOrListId);
          if (autoPlay) existingPlayer.playVideo?.();
          setGlobalYTSource({ videoId: videoIdOrListId });
          // Update audio store
          setCurrentlyPlaying({
            type: 'youtube',
            id: `video-${videoIdOrListId}`,
            name: `YouTube Video`,
            volume: 50,
            isPlaying: autoPlay,
            source: { type: 'youtube', id: `video-${videoIdOrListId}`, name: 'YouTube Video', url: '', volume: 50, loop: false }
          });

          // Fetch real title
          fetchYouTubeOEmbed(`https://www.youtube.com/watch?v=${videoIdOrListId}`).then(data => {
            if (data && data.title) {
              const current = useAudioStore.getState().currentlyPlaying;
              if (current && current.id === `video-${videoIdOrListId}`) {
                setCurrentlyPlaying({ ...current, name: data.title });
              }
            }
          });
        }
        return;
      }

      // Create new player
      const container = getOrCreateGlobalYTContainer();
      const player = new YT.Player(container, {
        videoId: options?.isPlaylist ? undefined : videoIdOrListId,
        playerVars: options?.isPlaylist
          ? { rel: 0, list: videoIdOrListId, modestbranding: 1, controls: 1 }
          : { rel: 0, modestbranding: 1, controls: 1 },
        events: {
          onReady: () => {
            if (autoPlay) {
              (async () => {
                try {
                  try {
                    player.unMute?.();
                  } catch {
                    // Ignore errors when unmuting
                  }
                  try {
                    player.playVideo?.();
                  } catch {
                    // Ignore errors when playing
                  }
                  toast.success('Đang phát nền • Nhạc sẽ tiếp tục khi đóng cửa sổ 🎧');
                } catch {
                  // Ignore all errors in the ready handler
                }
              })();
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

      // Record current source and update audio store
      if (options?.isPlaylist) {
        setGlobalYTSource({ listId: videoIdOrListId });
        setCurrentlyPlaying({
          type: 'youtube',
          id: `playlist-${videoIdOrListId}`,
          name: `YouTube Playlist`,
          volume: 50,
          isPlaying: autoPlay,
          source: { type: 'youtube', id: `playlist-${videoIdOrListId}`, name: 'YouTube Playlist', url: '', volume: 50, loop: false }
        });

        // Fetch real title
        fetchYouTubeOEmbed(`https://www.youtube.com/playlist?list=${videoIdOrListId}`).then(data => {
          if (data && data.title) {
            const current = useAudioStore.getState().currentlyPlaying;
            if (current && current.id === `playlist-${videoIdOrListId}`) {
              setCurrentlyPlaying({ ...current, name: data.title });
            }
          }
        });
      } else {
        setGlobalYTSource({ videoId: videoIdOrListId });
        setCurrentlyPlaying({
          type: 'youtube',
          id: `video-${videoIdOrListId}`,
          name: `YouTube Video`,
          volume: 50,
          isPlaying: autoPlay,
          source: { type: 'youtube', id: `video-${videoIdOrListId}`, name: 'YouTube Video', url: '', volume: 50, loop: false }
        });

        // Fetch real title
        fetchYouTubeOEmbed(`https://www.youtube.com/watch?v=${videoIdOrListId}`).then(data => {
          if (data && data.title) {
            const current = useAudioStore.getState().currentlyPlaying;
            if (current && current.id === `video-${videoIdOrListId}`) {
              setCurrentlyPlaying({ ...current, name: data.title });
            }
          }
        });
      }
    } catch (error) {
      console.error('Failed to create or update YouTube player:', error);
      toast.error('Không thể tạo trình phát YouTube. Vui lòng thử lại.');
    }
  }, []);

  // Toggle playback
  const togglePlayback = useCallback(async (videoId?: string, listId?: string, isChannel?: boolean) => {
    if (isChannel || (!videoId && !listId)) return;

    try {
      const yt = getGlobalYT();

      if (!yt) {
        // Create new player if none exists
        if (listId && !videoId) {
          await createOrUpdatePlayer(listId, true, { isPlaylist: true });
        } else if (videoId) {
          await createOrUpdatePlayer(videoId, true);
        }
        return;
      }

      const state = yt.getPlayerState?.();

      if (state === 1) {
        // Playing -> Pause
        yt.pauseVideo();
      } else if (state === 2) {
        // Paused -> Play
        yt.playVideo();
      } else {
        // Stopped or other state -> Create new player
        if (listId && !videoId) {
          await createOrUpdatePlayer(listId, true, { isPlaylist: true });
        } else if (videoId) {
          await createOrUpdatePlayer(videoId, true);
        }
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