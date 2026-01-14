'use client';

import { useState, useRef, useMemo, useEffect, useId } from 'react';
import { useTheme } from 'next-themes';

export type PlayerStatus = 'idle' | 'loading' | 'playing' | 'paused' | 'error';

export interface SpotifyPlaylistMeta {
    name: string;
    image?: string;
    author?: string;
    tracks?: number;
}

declare global {
    interface Window {
        onSpotifyIframeApiReady?: (IFrameAPI: any) => void;
        Spotify?: any;
    }
}

export const useSpotifyPlayer = () => {
    const [playerStatus, setPlayerStatus] = useState<PlayerStatus>('idle');
    const [embedPlaylistId, setEmbedPlaylistId] = useState<string | null>(null);
    const [currentPlaylistMeta, setCurrentPlaylistMeta] = useState<SpotifyPlaylistMeta | null>(null);

    const embedControllerRef = useRef<any>(null);
    const { resolvedTheme } = useTheme();
    const reactId = useId();

    const embedContainerId = useMemo(
        () => `spotify-embed-${reactId.replace(/:/g, '')}`,
        [reactId],
    );
    const embedHeight = 520;

    const embedVisualTheme = useMemo<'dark' | 'light'>(() => {
        if (resolvedTheme === 'dark') return 'dark';
        if (resolvedTheme === 'light') return 'light';
        if (typeof window !== 'undefined') {
            const prefersDark = window.matchMedia(
                '(prefers-color-scheme: dark)',
            ).matches;
            return prefersDark ? 'dark' : 'light';
        }
        return 'light';
    }, [resolvedTheme]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (embedControllerRef.current) {
                try {
                    embedControllerRef.current.pause();
                } catch (e) {
                    console.error('Error pausing on unmount', e);
                }
            }
        };
    }, []);

    const ensureSpotifyAPI = (): Promise<any> => {
        return new Promise((resolve) => {
            if (window.Spotify) {
                resolve(window.Spotify);
                return;
            }

            window.onSpotifyIframeApiReady = (IFrameAPI: any) => {
                resolve(IFrameAPI);
            };

            if (!document.getElementById('spotify-iframe-api')) {
                const script = document.createElement('script');
                script.id = 'spotify-iframe-api';
                script.src = 'https://open.spotify.com/embed/iframe-api/v1';
                script.async = true;
                document.body.appendChild(script);
            }
        });
    };

    const initializeController = async (playlistId: string) => {
        const IFrameAPI = await ensureSpotifyAPI();
        const element = document.getElementById(embedContainerId);

        if (!element) return;

        const options = {
            uri: `spotify:playlist:${playlistId}`,
            width: '100%',
            height: embedHeight,
            theme: embedVisualTheme,
        };

        const callback = (EmbedController: any) => {
            embedControllerRef.current = EmbedController;

            EmbedController.addListener('playback_update', (e: any) => {
                if (e.data.isPaused) {
                    setPlayerStatus('paused');
                } else {
                    setPlayerStatus('playing');
                }
            });

            EmbedController.play();
        };

        IFrameAPI.createController(element, options, callback);
    };

    const startPlayback = async (
        playlistId: string,
        name: string,
        meta?: SpotifyPlaylistMeta,
    ) => {
        setEmbedPlaylistId(playlistId);
        setCurrentPlaylistMeta(meta || { name });
        setPlayerStatus('loading');

        // If controller exists, load new URI
        if (embedControllerRef.current) {
            embedControllerRef.current.loadUri(`spotify:playlist:${playlistId}`);
            embedControllerRef.current.play();
        } else {
            // Initialize new controller
            await initializeController(playlistId);
        }
    };

    const resumePlayback = () => {
        if (embedControllerRef.current) {
            embedControllerRef.current.resume();
        }
    };

    const pausePlayback = () => {
        if (embedControllerRef.current) {
            embedControllerRef.current.pause();
        }
    };

    const stopPlayback = () => {
        if (embedControllerRef.current) {
            embedControllerRef.current.pause();
        }
        setEmbedPlaylistId(null);
        setPlayerStatus('idle');
        setCurrentPlaylistMeta(null);
    };

    return {
        playerStatus,
        embedPlaylistId,
        currentPlaylistMeta,
        embedContainerId,
        embedHeight,
        startPlayback,
        resumePlayback,
        pausePlayback,
        stopPlayback,
    };
};
