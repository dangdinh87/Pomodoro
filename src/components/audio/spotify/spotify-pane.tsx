'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { SpotifyEmbed } from './spotify-embed';
import { useSpotifyPlayer } from '@/hooks/use-spotify-player';
import { Sparkles, Music2, ExternalLink } from 'lucide-react';

export default function SpotifyPane() {
    const [customPlaylistUrl, setCustomPlaylistUrl] = useState<string>('');

    const {
        playerStatus,
        embedPlaylistId,
        embedContainerId,
        embedHeight,
        startPlayback,
    } = useSpotifyPlayer();

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

    const handlePlayCustomPlaylist = () => {
        const playlistId = extractPlaylistId(customPlaylistUrl);
        if (!playlistId) {
            toast.error('Link Spotify không hợp lệ. Hãy dán link playlist.');
            return;
        }
        void startPlayback(playlistId, 'Playlist từ link');
    };

    // Suggested playlists for quick access
    const suggestedPlaylists = [
        {
            name: 'Deep Focus',
            id: '37i9dQZF1DWZeKCadgRdKQ',
            description: 'Nhạc tập trung sâu',
        },
        {
            name: 'Lo-Fi Beats',
            id: '37i9dQZF1DWWQRwui0ExPn',
            description: 'Lofi hip hop chill',
        },
        {
            name: 'Peaceful Piano',
            id: '37i9dQZF1DX4sWSpwq3LiO',
            description: 'Piano thư giãn',
        },
    ];

    return (
        <div className="flex flex-col gap-4">
            {/* Main Input Section */}
            <section className="space-y-4 rounded-xl border bg-background/60 p-4 shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-[#1DB954]/10 flex items-center justify-center">
                        <Music2 className="h-5 w-5 text-[#1DB954]" />
                    </div>
                    <div>
                        <p className="text-sm font-medium">Phát nhạc từ Spotify</p>
                        <p className="text-xs text-muted-foreground">
                            Dán link playlist Spotify để phát nhạc nền
                        </p>
                    </div>
                </div>

                <div className="flex flex-col gap-2 sm:flex-row">
                    <Input
                        placeholder="https://open.spotify.com/playlist/..."
                        value={customPlaylistUrl}
                        onChange={(e) => setCustomPlaylistUrl(e.target.value)}
                        className="flex-1 text-sm"
                    />
                    <Button
                        size="lg"
                        className="h-10 px-5 bg-[#1DB954] text-white hover:bg-[#1DB954]/90"
                        onClick={handlePlayCustomPlaylist}
                        disabled={!customPlaylistUrl.trim()}
                    >
                        Phát
                    </Button>
                </div>

                {/* Quick suggestions */}
                <div className="space-y-2">
                    <p className="text-xs text-muted-foreground">Gợi ý nhanh:</p>
                    <div className="flex flex-wrap gap-2">
                        {suggestedPlaylists.map((playlist) => (
                            <Button
                                key={playlist.id}
                                variant="outline"
                                size="sm"
                                className="h-8 text-xs hover:border-[#1DB954] hover:text-[#1DB954]"
                                onClick={() => startPlayback(playlist.id, playlist.name)}
                            >
                                {playlist.name}
                            </Button>
                        ))}
                    </div>
                </div>
            </section>

            {/* Coming Soon - Account Sync Feature */}
            <section className="relative overflow-hidden rounded-xl border border-dashed border-muted-foreground/30 bg-gradient-to-br from-muted/30 to-muted/10 p-4">
                <div className="absolute top-2 right-2">
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-medium">
                        <Sparkles className="h-3 w-3" />
                        Sắp ra mắt
                    </span>
                </div>

                <div className="flex items-start gap-3 pr-20">
                    <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center shrink-0">
                        <svg
                            role="img"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 text-muted-foreground"
                            fill="currentColor"
                        >
                            <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141 4.32-1.32 9.84-.6 13.5 1.56.42.18.6.78.241 1.26zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 14.82 1.14.54.3.72 1.02.42 1.56-.3.54-1.02.72-1.56.42z" />
                        </svg>
                    </div>
                    <div className="space-y-1">
                        <p className="text-sm font-medium text-muted-foreground">
                            Đồng bộ tài khoản Spotify
                        </p>
                        <p className="text-xs text-muted-foreground/70">
                            Kết nối tài khoản Spotify để xem playlist cá nhân, lịch sử nghe và điều khiển playback trực tiếp.
                        </p>
                    </div>
                </div>
            </section>

            {/* Spotify Embed Player */}
            <SpotifyEmbed
                embedContainerId={embedContainerId}
                embedHeight={embedHeight}
                playerStatus={playerStatus}
                isVisible={!!embedPlaylistId}
            />
        </div>
    );
}
