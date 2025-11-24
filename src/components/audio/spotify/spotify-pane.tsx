'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';
import { SpotifyInputSection } from './spotify-input-section';
import { SpotifyPlaylistList, SpotifyPlaylist } from './spotify-playlist-list';
import { SpotifyEmbed } from './spotify-embed';
import { useSpotifyPlayer } from '@/hooks/use-spotify-player';

async function getJSON<T = any>(path: string): Promise<T> {
    const res = await fetch(path, { cache: 'no-store' });
    if (!res.ok) {
        const txt = await res.text().catch(() => '');
        throw new Error(txt || `Request failed ${res.status}`);
    }
    return res.json();
}

export default function SpotifyPane() {
    const [connected, setConnected] = useState<boolean>(false);
    const [checking, setChecking] = useState<boolean>(true);
    const {
        data: playlists = [],
        isLoading: loadingPlaylists,
        refetch: refreshPlaylists,
        isFetching,
    } = useQuery<SpotifyPlaylist[]>({
        queryKey: ['spotify-playlists'],
        queryFn: async () => {
            const data = await getJSON<{ items: SpotifyPlaylist[] }>(
                '/api/spotify/playlists?limit=50',
            );
            return data.items || [];
        },
        enabled: connected,
        staleTime: Infinity,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        onError: (e: any) => {
            toast.error('Không tải được playlist Spotify');
        },
    });

    const {
        playerStatus,
        embedPlaylistId,
        embedContainerId,
        embedHeight,
        startPlayback,
    } = useSpotifyPlayer();

    // Check Spotify connection on mount
    useEffect(() => {
        (async () => {
            try {
                setChecking(true);
                const st = await getJSON<{ connected: boolean }>('/api/spotify/status');
                setConnected(!!st.connected);
            } catch {
                setConnected(false);
            } finally {
                setChecking(false);
            }
        })();
    }, []);

    const login = () => {
        window.open('/api/spotify/login', '_blank');
    };

    const extractPlaylistId = (input: string): string | null => {
        if (!input) return null;
        const trimmed = input.trim();

        try {
            const url = new URL(trimmed);
            if (url.hostname.includes('spotify.com')) {
                const segments = url.pathname.split('/').filter(Boolean);
                const playlistIndex = segments.findIndex(
                    (segment) => segment === 'playlist',
                );
                if (playlistIndex !== -1 && segments[playlistIndex + 1]) {
                    return segments[playlistIndex + 1].split('?')[0];
                }
            }
        } catch {
            // Not a full URL, continue
        }

        const match = trimmed.match(/playlist[:/]([a-zA-Z0-9]+)/);
        if (match) return match[1];

        if (/^[a-zA-Z0-9]{22}$/.test(trimmed)) {
            return trimmed;
        }

        return null;
    };

    const handlePlayCustomPlaylist = (url: string) => {
        const playlistId = extractPlaylistId(url);
        if (!playlistId) {
            toast.error('Link Spotify không hợp lệ. Hãy dán link playlist.');
            return;
        }
        void startPlayback(playlistId, 'Playlist từ link');
    };

    const handlePlayUserPlaylist = (playlist: SpotifyPlaylist) => {
        const playlistId = extractPlaylistId(playlist.uri || playlist.id);
        if (!playlistId) {
            toast.error('Không lấy được playlist ID hợp lệ');
            return;
        }

        void startPlayback(playlistId, playlist.name, {
            name: playlist.name,
            image: playlist.images?.[0]?.url,
            author: playlist.owner?.display_name,
            tracks: playlist.tracks?.total,
        });
    };

    if (checking) {
        return (
            <div className="text-sm text-muted-foreground">
                Đang kiểm tra trạng thái Spotify...
            </div>
        );
    }

    if (!connected) {
        return (
            <div className="space-y-3">
                <div className="text-sm text-muted-foreground">
                    Đăng nhập Spotify để tải playlist cá nhân và phát nhạc.
                </div>
                <Button onClick={login}>Đăng nhập với Spotify</Button>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-4">
            <SpotifyInputSection onPlayCustomPlaylist={handlePlayCustomPlaylist} />

            <section className="space-y-4 rounded-xl border bg-background/60 p-4 shadow-sm">
                <SpotifyPlaylistList
                    playlists={playlists}
                    loading={loadingPlaylists || isFetching}
                    onRefresh={() => refreshPlaylists()}
                    onPlayPlaylist={handlePlayUserPlaylist}
                    currentEmbedId={embedPlaylistId}
                />
            </section>

            <SpotifyEmbed
                embedContainerId={embedContainerId}
                embedHeight={embedHeight}
                playerStatus={playerStatus}
                isVisible={!!embedPlaylistId}
            />
        </div>
    );
}
