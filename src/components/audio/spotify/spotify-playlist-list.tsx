'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Music2, RefreshCw } from 'lucide-react';

export type SpotifyImage = { url: string; width?: number; height?: number };
export type SpotifyPlaylist = {
    id: string;
    name: string;
    uri: string;
    images?: SpotifyImage[];
    owner?: { display_name?: string };
    tracks?: { total?: number };
};

interface SpotifyPlaylistListProps {
    playlists: SpotifyPlaylist[];
    loading: boolean;
    onRefresh: () => void;
    onPlayPlaylist: (playlist: SpotifyPlaylist) => void;
    currentEmbedId: string | null;
}

export function SpotifyPlaylistList({
    playlists,
    loading,
    onRefresh,
    onPlayPlaylist,
    currentEmbedId,
}: SpotifyPlaylistListProps) {
    const extractPlaylistId = (input: string): string | null => {
        if (!input) return null;
        const trimmed = input.trim();
        const match = trimmed.match(/playlist[:/]([a-zA-Z0-9]+)/);
        if (match) return match[1];
        if (/^[a-zA-Z0-9]{22}$/.test(trimmed)) return trimmed;
        return null;
    };

    return (
        <div className="rounded-lg border bg-muted/40 p-3">
            <div className="mb-2 flex items-center justify-between">
                <p className="text-xs font-medium uppercase text-muted-foreground">
                    Playlist cá nhân
                </p>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-full border border-transparent text-muted-foreground transition hover:border-muted-foreground/40"
                    onClick={onRefresh}
                    disabled={loading}
                >
                    <RefreshCw
                        className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`}
                    />
                </Button>
            </div>

            <div className="max-h-60 space-y-2 overflow-hidden">
                {loading ? (
                    <div className="space-y-2">
                        {Array.from({ length: 3 }).map((_, index) => (
                            <div
                                key={index}
                                className="h-14 w-full animate-pulse rounded-md bg-muted/70"
                            />
                        ))}
                    </div>
                ) : playlists.length === 0 ? (
                    <div className="space-y-1 text-xs text-muted-foreground">
                        <p>Chưa có playlist nào được lấy.</p>
                        <p>Hãy tạo playlist trong Spotify và tải lại.</p>
                    </div>
                ) : (
                    <div className="space-y-2 overflow-y-auto pr-1">
                        {playlists.map((pl) => {
                            const playlistId = extractPlaylistId(pl.uri || pl.id);
                            const isActive = !!playlistId && currentEmbedId === playlistId;
                            return (
                                <div
                                    key={pl.id}
                                    role="button"
                                    tabIndex={0}
                                    onClick={() => onPlayPlaylist(pl)}
                                    onKeyDown={(ev) => {
                                        if (ev.key === 'Enter' || ev.key === ' ') {
                                            ev.preventDefault();
                                            onPlayPlaylist(pl);
                                        }
                                    }}
                                    className={cn(
                                        'group flex w-full items-center gap-3 rounded-xl border px-3 py-2 text-left transition outline-none',
                                        isActive
                                            ? 'border-emerald-400/70 bg-emerald-500/10 shadow-[0_0_0_1px_rgba(16,185,129,0.35)]'
                                            : 'border-transparent bg-background/80 hover:border-emerald-400/50 hover:bg-background',
                                    )}
                                >
                                    <div className="h-12 w-12 overflow-hidden rounded-md bg-muted">
                                        {pl.images?.[0]?.url ? (
                                            <img
                                                src={pl.images[0].url}
                                                alt={pl.name}
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                                                <Music2 className="h-5 w-5" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-medium">
                                            {pl.name}
                                        </p>
                                        <p className="truncate text-xs text-muted-foreground">
                                            {pl.owner?.display_name ?? 'Playlist cá nhân'}
                                        </p>
                                    </div>
                                    {isActive ? (
                                        <Badge variant="secondary" className="text-[10px]">
                                            Đang chọn
                                        </Badge>
                                    ) : null}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
