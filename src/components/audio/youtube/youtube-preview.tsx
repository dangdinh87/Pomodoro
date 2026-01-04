'use client';

import { memo, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ParsedYouTubeUrl } from '@/hooks/use-youtube-player';
import { getYouTubeThumbnailUrl } from '@/data/youtube-suggestions';
import { fetchYouTubeOEmbed, YouTubeOEmbedResponse } from '@/lib/youtube-utils';
import { Loader2, X, ExternalLink } from 'lucide-react';

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

  // Original YouTube URL
  const originalUrl = constructUrl();

  if (!showPreview) {
    return null;
  }

  return (
    <div className="w-full rounded-xl border overflow-hidden bg-card shadow-sm">
      {/* Thumbnail Section - Full Width */}
      <div className="relative aspect-video w-full bg-muted">
        {isLoading ? (
          <div className="w-full h-full flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : youtubeThumbUrl ? (
          <>
            <img
              src={youtubeThumbUrl}
              alt={oEmbedData?.title || "YouTube thumbnail"}
              className="w-full h-full object-cover"
            />
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

            {/* YouTube logo badge */}
            <div className="absolute top-3 left-3">
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-[#ff0000] text-white text-xs font-medium">
                <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
                YouTube
              </div>
            </div>

            {/* Close button */}
            <button
              onClick={onTogglePreview}
              className="absolute top-3 right-3 h-8 w-8 rounded-full bg-black/50 hover:bg-black/70 flex items-center justify-center text-white transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground gap-2">
            <svg className="h-12 w-12 opacity-30" viewBox="0 0 24 24" fill="currentColor">
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
            </svg>
            <span className="text-sm">
              {listId ? 'Playlist đã chọn' : isChannel ? 'Link kênh (không thể preview)' : 'Không có preview'}
            </span>
          </div>
        )}
      </div>

      {/* Info Section */}
      {oEmbedData && !isLoading && (
        <div className="p-4 border-t bg-card">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-sm line-clamp-2" title={oEmbedData.title}>
                {oEmbedData.title}
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                {oEmbedData.author_name}
              </p>
            </div>
            {originalUrl && (
              <a
                href={originalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 h-8 w-8 rounded-lg bg-muted hover:bg-muted/80 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                title="Mở trên YouTube"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
});

YouTubePreview.displayName = 'YouTubePreview';
