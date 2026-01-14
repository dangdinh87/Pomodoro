'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ExternalLink } from 'lucide-react';
import { PlayerStatus } from '@/hooks/use-spotify-player';

interface SpotifyEmbedProps {
    embedContainerId: string;
    embedHeight: number;
    playerStatus: PlayerStatus;
    isVisible: boolean;
}

export function SpotifyEmbed({
    embedContainerId,
    embedHeight,
    playerStatus,
    isVisible,
}: SpotifyEmbedProps) {
    const embedDocsUrl = 'https://developer.spotify.com/documentation/embeds';

    return (
        <div
            className={cn(
                "rounded-xl border bg-background/60 p-4 shadow-sm transition-all duration-300",
                isVisible ? "opacity-100 block" : "opacity-0 hidden"
            )}
        >
            <div className="flex items-center justify-between mb-2">
                <div>
                    <p className="text-sm font-semibold">Trình phát nhúng</p>
                    <p className="text-xs text-muted-foreground">
                        Spotify Embed chỉ hỗ trợ phát và dừng nhạc.
                    </p>
                </div>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() =>
                        window.open(embedDocsUrl, '_blank', 'noopener,noreferrer')
                    }
                >
                    <ExternalLink className="h-4 w-4" />
                </Button>
            </div>
            <div
                className="relative w-full overflow-hidden rounded-xl border border-white/5 bg-muted/40"
                style={{ height: embedHeight }}
            >
                <div
                    id={embedContainerId}
                    className={cn(
                        'h-full w-full transition-opacity duration-300',
                        playerStatus === 'loading' ? 'opacity-60' : 'opacity-100',
                    )}
                />
                {playerStatus === 'loading' ? (
                    <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-background/60 text-xs font-medium text-foreground">
                        Đang khởi tạo Spotify Embed...
                    </div>
                ) : null}
            </div>
        </div>
    );
}
