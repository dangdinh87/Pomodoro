'use client';

import { useState, useCallback, useMemo, memo, useEffect } from 'react';
import { useAudioStore } from '@/stores/audio-store';
import { useYouTubePlayer, parseYouTubeUrl } from '@/hooks/use-youtube-player';
import { fetchYouTubeOEmbed, YouTubeOEmbedResponse } from '@/lib/youtube-utils';
import { getRandomSuggestion, youtubeSuggestions, getYouTubeThumbnailUrl } from '@/data/youtube-suggestions';
import { YouTubeInputSection } from './youtube-input-section';
import { Button } from '@/components/ui/button';
import { Play, Pause, Dice3 } from 'lucide-react';
import { cn } from '@/lib/utils';

const YouTubeIcon = ({ className }: { className?: string }) => (
  <svg
    role="img"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    fill="currentColor"
  >
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
  </svg>
);

const YouTubePane = memo(() => {
  // Audio store hooks
  const audioSettings = useAudioStore((state) => state.audioSettings);
  const updateAudioSettings = useAudioStore((state) => state.updateAudioSettings);

  const [youtubeUrl, setYoutubeUrl] = useState<string>(audioSettings.youtubeUrl || '');

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
    updateAudioSettings({ youtubeUrl: randomSuggestion.url });

    // Always play the new video/playlist directly
    if (parsed.listId && !parsed.videoId) {
      await createOrUpdatePlayer(parsed.listId, true, { isPlaylist: true });
    } else if (parsed.videoId) {
      await createOrUpdatePlayer(parsed.videoId, true);
    }
  }, [createOrUpdatePlayer, updateAudioSettings]);

  // Check if a suggestion is currently playing
  const isSuggestionPlaying = useCallback((suggestionUrl: string): boolean => {
    const parsed = parseYouTubeUrl(suggestionUrl);
    const source = playerState.currentSource;
    if (!source) return false;

    if (parsed.videoId && source.videoId === parsed.videoId) return true;
    if (parsed.listId && source.listId === parsed.listId) return true;
    return false;
  }, [playerState.currentSource]);

  return (
    <div className="flex flex-col gap-4">
      {/* Input & Preview Section */}
      <section className="space-y-4 rounded-xl border bg-background/60 p-4 shadow-sm">
        {/* Sticky Now Playing Badge */}
        {(playerState.status === 'playing' || playerState.status === 'paused') && playerState.currentSource && (
          <div className="flex items-center justify-between gap-3 px-4 py-2 bg-primary/10 border border-primary/20 rounded-lg mb-2">
            <div className="flex items-center gap-2 min-w-0">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-red-500/10 shrink-0">
                <YouTubeIcon className="h-3.5 w-3.5 text-red-500 fill-current" />
              </div>
              <p className="text-[11px] font-medium text-foreground truncate">
                <span className="text-muted-foreground mr-1.5 font-normal">Đang phát:</span>
                {playingVideoDetails ? (
                  playingVideoDetails.title
                ) : (
                  playerState.currentSource.videoId ? (
                    `Video ${playerState.currentSource.videoId}`
                  ) : playerState.currentSource.listId ? (
                    `Playlist ${playerState.currentSource.listId}`
                  ) : 'YouTube'
                )}
              </p>
            </div>

            {playerState.status === 'playing' && (
              <div className="flex gap-0.5 h-3 items-end shrink-0 px-1 text-primary">
                <span className="w-0.5 h-2 bg-current animate-pulse" />
                <span className="w-0.5 h-3 bg-current animate-pulse [animation-delay:0.2s]" />
                <span className="w-0.5 h-1.5 bg-current animate-pulse [animation-delay:0.4s]" />
              </div>
            )}
          </div>
        )}

        <div className="flex flex-col gap-4">
          <YouTubeInputSection
            youtubeUrl={youtubeUrl}
            onUrlChange={handleUrlChange}
            parsedUrl={parsedUrl}
            playerStatus={playerState.status}
            currentSource={playerState.currentSource}
            onTogglePlayback={handleTogglePlayback}
          />
        </div>
      </section>

      {/* YouTube Suggestions - Ultra Simplified List View */}
      <section className="space-y-3 rounded-xl border bg-background/40 p-1 shadow-sm overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-3 pt-3 pb-1">
          <div className="flex flex-col gap-0.5">
            <h3 className="text-sm font-bold tracking-tight text-foreground/90">Thư viện</h3>
            <p className="text-[10px] text-muted-foreground/60 font-medium uppercase tracking-wider">
              {youtubeSuggestions.length} bài tuyển chọn
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handlePickRandomSuggestion}
            className="h-7 gap-1.5 text-[10px] font-semibold hover:bg-primary/10 hover:text-primary hover:border-primary/30 transition-all bg-white/5 border-white/10 rounded-full px-3 shadow-sm"
          >
            <Dice3 className="h-3.5 w-3.5" />
            <span>Random</span>
          </Button>
        </div>

        <div className="overflow-hidden rounded-lg bg-black/5 mx-1 mb-1">
          <div className="divide-y divide-border/30 max-h-[450px] overflow-y-auto custom-scrollbar">
            {youtubeSuggestions.map((item) => {
              const isMatch = isSuggestionPlaying(item.url);
              const isPlaying = isMatch && playerState.status === 'playing';
              const isBuffering = isMatch && playerState.status === 'buffering';
              const parsed = parseYouTubeUrl(item.url);
              const thumbnailUrl = parsed.videoId ? getYouTubeThumbnailUrl(parsed.videoId) : null;

              return (
                <div
                  key={item.url}
                  className={cn(
                    "flex items-center justify-between gap-3 p-3 rounded-xl border transition-all group relative mb-2 mx-1",
                    "backdrop-blur-sm",
                    isMatch
                      ? "bg-primary/10 border-primary/20 shadow-[0_0_15px_-3px_rgba(var(--primary),0.15)]"
                      : "bg-background/40 border-white/5 hover:bg-background/60 hover:border-white/10 hover:translate-x-1"
                  )}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {/* Thumbnail */}
                    <div className={cn(
                      "relative w-14 h-10 shrink-0 rounded-lg overflow-hidden bg-black/40 border border-white/5 shadow-sm flex items-center justify-center transition-all group-hover:shadow-md",
                      isMatch ? "ring-2 ring-primary/20" : "group-hover:border-primary/20"
                    )}>
                      {thumbnailUrl ? (
                        <>
                          <img
                            src={thumbnailUrl}
                            alt={item.label}
                            className={cn(
                              "w-full h-full object-cover transition-transform duration-700",
                              isMatch ? "scale-110" : "group-hover:scale-110"
                            )}
                          />
                          {!isPlaying && !isBuffering && (
                            <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                              <Play className="h-4 w-4 text-white fill-current drop-shadow-md" />
                            </div>
                          )}
                        </>
                      ) : (
                        <span className="text-[9px] font-mono text-muted-foreground/40 font-bold">YT</span>
                      )}
                      {isPlaying && (
                        <div className="absolute inset-0 bg-primary/20 backdrop-blur-[1px] flex items-center justify-center">
                          <div className="flex gap-0.5 h-3 items-end pb-1">
                            <span className="w-0.5 h-2 bg-white animate-pulse" />
                            <span className="w-0.5 h-3 bg-white animate-pulse [animation-delay:0.2s]" />
                            <span className="w-0.5 h-1.5 bg-white animate-pulse [animation-delay:0.4s]" />
                          </div>
                        </div>
                      )}
                      {isBuffering && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                          <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col min-w-0 flex-1 justify-center gap-0.5">
                      <span className={cn(
                        "truncate text-sm font-medium leading-none transition-colors",
                        isMatch ? "text-primary" : "text-foreground/90 group-hover:text-foreground"
                      )}>
                        {item.label}
                      </span>
                      <span className="truncate text-[11px] text-muted-foreground/60 font-medium group-hover:text-muted-foreground/80 transition-colors">
                        {item.description}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handlePlaySuggestion(item)}
                      className={cn(
                        "h-8 w-8 rounded-full border transition-all duration-300",
                        isMatch
                          ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-md border-primary/20"
                          : "bg-white/5 text-muted-foreground border-transparent opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100 hover:bg-primary/10 hover:text-primary hover:border-primary/20"
                      )}
                    >
                      {isPlaying ? (
                        <Pause className="h-3.5 w-3.5 fill-current" />
                      ) : (
                        <Play className="h-3.5 w-3.5 fill-current ml-0.5" />
                      )}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
});

YouTubePane.displayName = 'YouTubePane';

export default YouTubePane;
