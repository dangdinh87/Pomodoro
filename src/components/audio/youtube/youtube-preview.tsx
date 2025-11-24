'use client';

import { memo, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ParsedYouTubeUrl } from '@/hooks/use-youtube-player';
import { getYouTubeThumbnailUrl } from '@/data/youtube-suggestions';
import { fetchYouTubeOEmbed, YouTubeOEmbedResponse } from '@/lib/youtube-utils';
import { Loader2 } from 'lucide-react';

interface YouTubePreviewProps {
  showPreview: boolean;
  onTogglePreview: () => void;
  parsedUrl: ParsedYouTubeUrl;
}

export const YouTubePreview = memo(({
  showPreview,
  onTogglePreview,
  parsedUrl,
}: YouTubePreviewProps) => {
  const { videoId, listId, isChannel } = parsedUrl;

  const [oEmbedData, setOEmbedData] = useState<YouTubeOEmbedResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Construct URL for oEmbed
  const constructUrl = () => {
    if (videoId) return `https://www.youtube.com/watch?v=${videoId}`;
    if (listId) return `https://www.youtube.com/playlist?list=${listId}`;
    return '';
  };

  useEffect(() => {
    const url = constructUrl();
    if (!url || !showPreview) {
      setOEmbedData(null);
      return;
    }

    const fetchData = async () => {
      setIsLoading(true);
      const data = await fetchYouTubeOEmbed(url);
      setOEmbedData(data);
      setIsLoading(false);
    };

    fetchData();
  }, [videoId, listId, showPreview]);

  const youtubeThumbUrl = videoId ? getYouTubeThumbnailUrl(videoId) : oEmbedData?.thumbnail_url;
  const hasValidContent = (videoId || listId) && !isChannel;

  return (
    <div className="space-y-2">
      {!showPreview ? (
        <div className="rounded-lg border bg-muted/10 p-4 text-sm text-muted-foreground flex items-center justify-between">
          <div>
            {videoId || listId
              ? 'Nhấn "Xem trước" để hiển thị preview cho link hiện tại.'
              : 'Chưa có link YouTube.'}
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={onTogglePreview}
            disabled={!hasValidContent}
          >
            Xem trước
          </Button>
        </div>
      ) : (
        <div className="rounded-lg border overflow-hidden bg-muted/20 w-full">
          <div className="aspect-video bg-muted relative group">
            {isLoading ? (
              <div className="w-full h-full flex items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : youtubeThumbUrl ? (
              <>
                <img
                  src={youtubeThumbUrl}
                  alt={oEmbedData?.title || "YouTube thumbnail"}
                  className="w-full h-full object-cover"
                />
                {/* Overlay with Title */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                  {oEmbedData ? (
                    <div className="text-white">
                      <div className="font-medium line-clamp-2">{oEmbedData.title}</div>
                      <div className="text-xs text-white/80 mt-1">{oEmbedData.author_name}</div>
                    </div>
                  ) : (
                    <div className="text-white text-sm">
                      {videoId ? 'Video YouTube' : 'Playlist YouTube'}
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">
                {listId
                  ? 'Playlist đã chọn'
                  : isChannel
                    ? 'Link kênh (không thể preview)'
                    : 'Dán link YouTube để xem trước'}
              </div>
            )}
          </div>
          {/* Always show title below if available */}
          {oEmbedData && !isLoading && (
            <div className="p-3 bg-card border-t">
              <div className="font-medium text-sm line-clamp-1" title={oEmbedData.title}>
                {oEmbedData.title}
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">
                {oEmbedData.author_name}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
});

YouTubePreview.displayName = 'YouTubePreview';