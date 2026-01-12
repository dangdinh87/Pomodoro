'use client';

import { memo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Play, Pause } from 'lucide-react';
import { ParsedYouTubeUrl, YouTubeSource } from '@/hooks/use-youtube-player';

interface YouTubeInputSectionProps {
  youtubeUrl: string;
  onUrlChange: (url: string) => void;
  parsedUrl: ParsedYouTubeUrl;
  playerStatus: 'stopped' | 'playing' | 'paused' | 'buffering';
  currentSource: YouTubeSource | null;
  onTogglePlayback: () => void;
}

export const YouTubeInputSection = memo(({
  youtubeUrl,
  onUrlChange,
  parsedUrl,
  playerStatus,
  currentSource,
  onTogglePlayback,
}: YouTubeInputSectionProps) => {
  const { videoId, listId, isChannel } = parsedUrl;
  const isValidYouTube = !!youtubeUrl && (!!videoId || !!listId) && !isChannel;

  // Check if the input URL matches the currently playing source
  const isCurrentSourcePlaying = currentSource && (
    (videoId && currentSource.videoId === videoId) ||
    (listId && !videoId && currentSource.listId === listId)
  );

  // Determine actual status for this URL
  const effectiveStatus = isCurrentSourcePlaying ? playerStatus : 'stopped';

  const toggleLabel = isChannel
    ? 'Link kênh'
    : effectiveStatus === 'playing'
      ? 'Tạm dừng'
      : effectiveStatus === 'paused'
        ? 'Phát lại'
        : 'Phát nền';

  return (
    <div className="space-y-2 h-full flex flex-col">
      <div className="flex items-center gap-2">
        <Input
          placeholder="Nhập link YouTube của bạn…"
          value={youtubeUrl}
          onChange={(e) => onUrlChange(e.target.value)}
          className="flex-1 text-sm"
        />
        <Button
          onClick={onTogglePlayback}
          disabled={(!videoId && !listId) || isChannel}
          size="lg"
          className="h-10 px-5 bg-[#ff0000] text-white hover:bg-[#ff0000]/90"
          title={toggleLabel}
        >
          {isChannel || effectiveStatus !== 'playing' ? (
            <Play className="h-4 w-4" />
          ) : (
            <Pause className="h-4 w-4" />
          )}
        </Button>
      </div>
      {!isValidYouTube && youtubeUrl && !isChannel && (
        <div className="text-xs text-destructive">
          Không tìm thấy video hợp lệ.
        </div>
      )}
    </div>
  );
});

YouTubeInputSection.displayName = 'YouTubeInputSection';