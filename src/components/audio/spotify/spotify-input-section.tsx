'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface SpotifyInputSectionProps {
    onPlayCustomPlaylist: (url: string) => void;
}

export function SpotifyInputSection({ onPlayCustomPlaylist }: SpotifyInputSectionProps) {
    const [customPlaylistUrl, setCustomPlaylistUrl] = useState<string>('');

    const handlePlay = () => {
        onPlayCustomPlaylist(customPlaylistUrl);
    };

    return (
        <section className="space-y-4 rounded-xl border bg-background/60 p-4 shadow-sm">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium">Nguồn nhạc</p>
                    <p className="text-xs text-muted-foreground">
                        Dán link bất kỳ hoặc chọn playlist đã lưu.
                    </p>
                </div>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
                <Input
                    placeholder="Dán link playlist / track Spotify..."
                    value={customPlaylistUrl}
                    onChange={(e) => setCustomPlaylistUrl(e.target.value)}
                    className="flex-1 text-sm"
                />
                <Button
                    size="lg"
                    className="h-10 px-5 bg-emerald-500 text-emerald-50 hover:bg-emerald-500/90 dark:bg-emerald-500 dark:hover:bg-emerald-500/90"
                    onClick={handlePlay}
                    disabled={!customPlaylistUrl.trim()}
                >
                    Phát
                </Button>
            </div>
        </section>
    );
}
