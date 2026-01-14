'use client';

import { useState, useCallback, useMemo, memo, useEffect } from 'react';
import { useAudioStore } from '@/stores/audio-store';
import { useYouTubePlayer, parseYouTubeUrl } from '@/hooks/use-youtube-player';
import { fetchYouTubeOEmbed, YouTubeOEmbedResponse } from '@/lib/youtube-utils';
import { getRandomSuggestion, youtubeSuggestions, getYouTubeThumbnailUrl } from '@/data/youtube-suggestions';
import { YouTubeInputSection } from './youtube-input-section';
import { YouTubePreview } from './youtube-preview';
import { Button } from '@/components/ui/button';
import { Play, Pause, Dice3 } from 'lucide-react';
import { cn } from '@/lib/utils';

const YouTubePane = memo(() => {
  // Audio store hooks
  const audioSettings = useAudioStore((state) => state.audioSettings);
  const updateAudioSettings = useAudioStore((state) => state.updateAudioSettings);

  const [youtubeUrl, setYoutubeUrl] = useState<string>(audioSettings.youtubeUrl || '');
  const [showPreview, setShowPreview] = useState(!!audioSettings.youtubeUrl);

  // State for currently playing video details
  const [playingVideoDetails, setPlayingVideoDetails] = useState<YouTubeOEmbedResponse | null>(null);

  // YouTube player hook
  const { playerState, togglePlayback, createOrUpdatePlayer } = useYouTubePlayer();

  // Parse YouTube URL
  const parsedUrl = useMemo(() => parseYouTubeUrl(youtubeUrl), [youtubeUrl]);
  const { videoId, listId, isChannel } = parsedUrl;

  // Fetch details for currently playing video
  useEffect(() => {
    const fetchDetails = async () => {
      const source = playerState.currentSource;
      if (!source) {
        setPlayingVideoDetails(null);
        return;
      }

      let url = '';
      if (source.videoId) {
        url = `https://www.youtube.com/watch?v=${source.videoId}`;
      } else if (source.listId) {
        url = `https://www.youtube.com/playlist?list=${source.listId}`;
      }

      if (url) {
        const data = await fetchYouTubeOEmbed(url);
        if (data) {
          setPlayingVideoDetails(data);

          // Update store with real title if it's different
          const currentStoreAudio = useAudioStore.getState().currentlyPlaying;
          if (currentStoreAudio && currentStoreAudio.type === 'youtube' && currentStoreAudio.name !== data.title) {
            useAudioStore.getState().setCurrentlyPlaying({
              ...currentStoreAudio,
              name: data.title
            });
          }
        }
      }
    };

    fetchDetails();
  }, [playerState.currentSource]);

  // Handle URL change
  const handleUrlChange = useCallback((url: string) => {
    setYoutubeUrl(url);
    setShowPreview(true);
    // Save to audio store for persistence
    updateAudioSettings({ youtubeUrl: url });
  }, [updateAudioSettings]);

  // Handle playback toggle for input URL
  const handleTogglePlayback = useCallback(() => {
    togglePlayback(videoId, listId, isChannel);
  }, [togglePlayback, videoId, listId, isChannel]);

  // Handle suggestion play - ALWAYS play the new video, don't toggle
  const handlePlaySuggestion = useCallback(async (suggestion: typeof youtubeSuggestions[0]) => {
    const parsed = parseYouTubeUrl(suggestion.url);

    // Update URL state
    setYoutubeUrl(suggestion.url);
    setShowPreview(true);
    updateAudioSettings({ youtubeUrl: suggestion.url });

    // Always play the new video/playlist directly
    if (parsed.listId && !parsed.videoId) {
      await createOrUpdatePlayer(parsed.listId, true, { isPlaylist: true });
    } else if (parsed.videoId) {
      await createOrUpdatePlayer(parsed.videoId, true);
    }
  }, [createOrUpdatePlayer, updateAudioSettings]);

  // Handle random suggestion
  const handlePickRandomSuggestion = useCallback(async () => {
    const randomSuggestion = getRandomSuggestion();
    const parsed = parseYouTubeUrl(randomSuggestion.url);

    // Update URL state
    setYoutubeUrl(randomSuggestion.url);
    setShowPreview(true);
    updateAudioSettings({ youtubeUrl: randomSuggestion.url });

    // Always play the new video/playlist directly
    if (parsed.listId && !parsed.videoId) {
      await createOrUpdatePlayer(parsed.listId, true, { isPlaylist: true });
    } else if (parsed.videoId) {
      await createOrUpdatePlayer(parsed.videoId, true);
    }
  }, [createOrUpdatePlayer, updateAudioSettings]);

  // Handle preview toggle
  const handleTogglePreview = useCallback(() => {
    setShowPreview(prev => !prev);
  }, []);

  // Extract video ID from URL for thumbnail
  const getVideoIdFromUrl = (url: string): string | null => {
    const parsed = parseYouTubeUrl(url);
    return parsed.videoId || null;
  };

  // Check if a suggestion is currently playing
  const isSuggestionPlaying = (suggestionUrl: string): boolean => {
    const parsed = parseYouTubeUrl(suggestionUrl);
    const source = playerState.currentSource;
    if (!source) return false;

    if (parsed.videoId && source.videoId === parsed.videoId) return true;
    if (parsed.listId && source.listId === parsed.listId) return true;
    return false;
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Input & Preview Section */}
      <section className="space-y-4 rounded-xl border bg-background/60 p-4 shadow-sm">
        {/* Currently playing badge */}
        {(playerState.status === 'playing' || playerState.status === 'paused') && playerState.currentSource && (
          <div className="text-xs text-muted-foreground">
            Đang phát nền:{' '}
            <span className="font-medium text-foreground">
              {playingVideoDetails ? (
                playingVideoDetails.title
              ) : (
                playerState.currentSource.videoId ? (
                  `Video ${playerState.currentSource.videoId}`
                ) : playerState.currentSource.listId ? (
                  `Playlist ${playerState.currentSource.listId}`
                ) : 'YouTube'
              )}
            </span>
          </div>
        )}

        <div className="flex flex-col gap-4">
          {/* Input Section */}
          <div className="w-full">
            <p className="text-sm text-muted-foreground mb-2">
              Dán link YouTube hoặc chọn từ gợi ý có sẵn.
            </p>
            <YouTubeInputSection
              youtubeUrl={youtubeUrl}
              onUrlChange={handleUrlChange}
              parsedUrl={parsedUrl}
              playerStatus={playerState.status}
              currentSource={playerState.currentSource}
              onTogglePlayback={handleTogglePlayback}
            />
          </div>

          {/* Preview Section - Full Width */}
          {showPreview && (videoId || listId) && (
            <div className="w-full">
              <YouTubePreview
                showPreview={showPreview}
                onTogglePreview={handleTogglePreview}
                parsedUrl={parsedUrl}
              />
            </div>
          )}
        </div>
      </section>

      {/* YouTube Suggestions with Thumbnails */}
      <section className="space-y-3 rounded-xl border bg-background/60 p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Gợi ý nhạc chill</p>
            <p className="text-xs text-muted-foreground">Chọn để phát ngay</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handlePickRandomSuggestion}
            className="h-8 gap-1.5"
          >
            <Dice3 className="h-4 w-4" />
            Random
          </Button>
        </div>

        {/* Grid of suggestions with thumbnails */}
        <div className="grid grid-cols-2 gap-3">
          {youtubeSuggestions.slice(0, 6).map((item) => {
            const itemVideoId = getVideoIdFromUrl(item.url);
            const thumbnail = itemVideoId ? getYouTubeThumbnailUrl(itemVideoId) : null;
            const isPlaying = isSuggestionPlaying(item.url);

            return (
              <button
                key={item.url}
                type="button"
                onClick={() => handlePlaySuggestion(item)}
                className={cn(
                  "group relative overflow-hidden rounded-lg border text-left transition-all hover:border-[#ff0000]/50 hover:shadow-md",
                  isPlaying ? "border-[#ff0000] ring-1 ring-[#ff0000]/30" : "border-border/50"
                )}
              >
                {/* Thumbnail */}
                <div className="relative aspect-video w-full overflow-hidden bg-muted">
                  {thumbnail ? (
                    <img
                      src={thumbnail}
                      alt={item.label}
                      className="h-full w-full object-cover transition-transform group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#ff0000]/20 to-[#ff0000]/5">
                      <Play className="h-8 w-8 text-[#ff0000]/50" />
                    </div>
                  )}

                  {/* Play overlay */}
                  <div className={cn(
                    "absolute inset-0 flex items-center justify-center bg-black/40 transition-opacity",
                    isPlaying ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                  )}>
                    <div className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-full bg-[#ff0000] text-white shadow-lg",
                      isPlaying && "animate-pulse"
                    )}>
                      {isPlaying ? (
                        <Pause className="h-5 w-5" />
                      ) : (
                        <Play className="h-5 w-5 ml-0.5" />
                      )}
                    </div>
                  </div>

                  {/* Playing indicator */}
                  {isPlaying && (
                    <div className="absolute top-2 right-2">
                      <span className="flex items-center gap-1 rounded-full bg-[#ff0000] px-2 py-0.5 text-[10px] font-medium text-white">
                        <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                        Đang phát
                      </span>
                    </div>
                  )}
                </div>

                {/* Title */}
                <div className="p-2">
                  <p className="text-xs font-medium line-clamp-2 leading-tight">
                    {item.label}
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-1 line-clamp-1">
                    {item.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        <p className="text-[10px] text-muted-foreground text-center">
          🎧 Nhạc phát nền - không bị gián đoạn khi làm việc
        </p>
      </section>
    </div>
  );
});

YouTubePane.displayName = 'YouTubePane';

export default YouTubePane;
