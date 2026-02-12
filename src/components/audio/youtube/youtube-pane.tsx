'use client';

import { useState, useCallback, useMemo, memo, useEffect, useRef } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useAudioStore } from '@/stores/audio-store';
import { useYouTubePlayer, parseYouTubeUrl } from '@/hooks/use-youtube-player';
import { fetchYouTubeOEmbed, YouTubeOEmbedResponse } from '@/lib/youtube-utils';
import {
  getRandomSuggestion,
  youtubeSuggestions,
  getYouTubeThumbnailUrl,
  getCategories,
  getSuggestionsByCategory
} from '@/data/youtube-suggestions';
import { YouTubeInputSection } from './youtube-input-section';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Play, Pause, Dice3, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { MusicVisualizer } from './music-visualizer';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/contexts/i18n-context';

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

const categoryLabels: Record<string, { icon: string }> = {
  'Chill VN': { icon: '🇻🇳' },
  'Lofi': { icon: '🎧' },
  'Cafe': { icon: '☕' },
  'Piano': { icon: '🎹' },
  'Ambient': { icon: '🌌' },
  'Nature': { icon: '🌿' },
  'Coding': { icon: '💻' },
  'Pomodoro': { icon: '⏱️' },
  'Brainwaves': { icon: '🧠' },
};

const YouTubePane = memo(() => {
  const { t } = useTranslation();
  // Audio store hooks
  const audioSettings = useAudioStore((state) => state.audioSettings);
  const updateAudioSettings = useAudioStore((state) => state.updateAudioSettings);

  const [youtubeUrl, setYoutubeUrl] = useState<string>(audioSettings.youtubeUrl || '');
  const [selectedCategory, setSelectedCategory] = useState<string>('Chill VN');

  // State for currently playing video details
  const [playingVideoDetails, setPlayingVideoDetails] = useState<YouTubeOEmbedResponse | null>(null);

  // Scroll state for category tabs
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // YouTube player hook
  const { playerState, togglePlayback, stopPlayback, createOrUpdatePlayer } = useYouTubePlayer();

  // Parse YouTube URL
  const parsedUrl = useMemo(() => parseYouTubeUrl(youtubeUrl), [youtubeUrl]);
  const { videoId, listId, isChannel } = parsedUrl;

  // Get categories
  const categories = useMemo(() => getCategories(), []);

  // Get filtered suggestions
  const filteredSuggestions = useMemo(() =>
    getSuggestionsByCategory(selectedCategory),
    [selectedCategory]
  );

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
    updateAudioSettings({ youtubeUrl: url });
  }, [updateAudioSettings]);

  // Handle playback toggle for input URL
  const handleTogglePlayback = useCallback(() => {
    togglePlayback(videoId, listId, isChannel);
  }, [togglePlayback, videoId, listId, isChannel]);

  // Handle suggestion play
  const handlePlaySuggestion = useCallback(async (suggestion: typeof youtubeSuggestions[0]) => {
    const parsed = parseYouTubeUrl(suggestion.url);

    // Check if this is the currently playing source
    const isCurrentlyPlaying = playerState.currentSource && (
      (parsed.videoId && playerState.currentSource.videoId === parsed.videoId) ||
      (parsed.listId && !parsed.videoId && playerState.currentSource.listId === parsed.listId)
    );

    // If it's already playing, toggle pause/play
    if (isCurrentlyPlaying) {
      await togglePlayback(parsed.videoId, parsed.listId, parsed.isChannel);
      return;
    }

    // Update URL state
    setYoutubeUrl(suggestion.url);
    updateAudioSettings({ youtubeUrl: suggestion.url });

    // Play the new video/playlist
    if (parsed.listId && !parsed.videoId) {
      await createOrUpdatePlayer(parsed.listId, true, { isPlaylist: true });
    } else if (parsed.videoId) {
      await createOrUpdatePlayer(parsed.videoId, true);
    }
  }, [createOrUpdatePlayer, updateAudioSettings, togglePlayback, playerState.currentSource]);

  // Handle random suggestion
  const handlePickRandomSuggestion = useCallback(async () => {
    const randomSuggestion = getRandomSuggestion();
    const parsed = parseYouTubeUrl(randomSuggestion.url);

    // Update URL state and category
    setYoutubeUrl(randomSuggestion.url);
    setSelectedCategory(randomSuggestion.category);
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

  // Check scroll position for category tabs
  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 1);
  }, []);

  const scrollLeft = useCallback(() => {
    scrollRef.current?.scrollBy({ left: -200, behavior: 'smooth' });
  }, []);

  const scrollRight = useCallback(() => {
    scrollRef.current?.scrollBy({ left: 200, behavior: 'smooth' });
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    checkScroll();
    el.addEventListener('scroll', checkScroll);
    window.addEventListener('resize', checkScroll);
    return () => {
      el.removeEventListener('scroll', checkScroll);
      window.removeEventListener('resize', checkScroll);
    };
  }, [checkScroll]);

  // Check if something is currently playing
  const isCurrentlyPlaying = playerState.currentSource && playerState.status !== 'stopped';
  const currentThumbnail = playerState.currentSource?.videoId
    ? getYouTubeThumbnailUrl(playerState.currentSource.videoId)
    : undefined;

  return (
    <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="flex flex-col h-full min-h-0">
      {/* Fixed Header - URL Input + Library (no scroll) */}
      <div className="shrink-0 space-y-3 pb-3">
        {/* URL Input / Now Playing - Sticky at top */}
        <YouTubeInputSection
          youtubeUrl={youtubeUrl}
          onUrlChange={handleUrlChange}
          parsedUrl={parsedUrl}
          playerStatus={playerState.status}
          currentSource={playerState.currentSource}
          onTogglePlayback={handleTogglePlayback}
          onStop={stopPlayback}
          playingVideoDetails={playingVideoDetails}
          thumbnailUrl={currentThumbnail || undefined}
        />

        {/* Library Card - Preset Style */}
        <div className="bg-background/40 border rounded-lg overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-2.5 py-1.5 border-b bg-background/60">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-foreground/90">{t('audio.youtube.library')}</h3>
              <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary font-semibold">
                {youtubeSuggestions.length}
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handlePickRandomSuggestion}
              className="h-6 gap-1 text-[10px] font-semibold hover:bg-primary/10 hover:text-primary px-2"
            >
              <Dice3 className="h-3 w-3" />
              {t('audio.youtube.random')}
            </Button>
          </div>
          {/* Scrollable chips with arrows */}
          <div className="relative">
            {canScrollLeft && (
              <Button
                variant="ghost"
                size="icon"
                onClick={scrollLeft}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 h-8 w-8 bg-background/80 hover:bg-background shadow-sm"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            )}
            {canScrollRight && (
              <Button
                variant="ghost"
                size="icon"
                onClick={scrollRight}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 h-8 w-8 bg-background/80 hover:bg-background shadow-sm"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            )}
            <div
              ref={scrollRef}
              className="overflow-x-auto p-1.5 scroll-smooth"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}
            >
              <div className="flex gap-2">
                {categories.map((cat) => {
                  const catInfo = categoryLabels[cat] || { icon: '📁' };
                  const isActive = selectedCategory === cat;
                  return (
                    <Button
                      key={cat}
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedCategory(cat)}
                      className={cn(
                        "h-8 px-3 text-sm font-medium whitespace-nowrap transition-all border shrink-0",
                        isActive
                          ? "bg-primary text-primary-foreground hover:bg-primary/90 border-primary shadow-md"
                          : "hover:bg-accent hover:text-accent-foreground border-input"
                      )}
                    >
                      <span>{catInfo.icon}</span>
                      <span>{t(`audio.youtube.categories.${cat}`)}</span>
                    </Button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scrollable Content: Video List */}
      <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
        <AnimatePresence mode="wait">
          {categories.map((cat) => (
            cat === selectedCategory && (
              <TabsContent key={cat} value={cat} className="h-full min-h-0 m-0 p-0 flex flex-col">
                <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden custom-scrollbar min-h-[120px]">
                  <div className="grid grid-cols-1 gap-1.5 p-2">
                    {filteredSuggestions.map((item, index) => {
                      const isMatch = isSuggestionPlaying(item.url);
                      const isPlaying = isMatch && playerState.status === 'playing';
                      const isBuffering = isMatch && playerState.status === 'buffering';
                      const parsed = parseYouTubeUrl(item.url);
                      const thumbnailUrl = parsed.videoId ? getYouTubeThumbnailUrl(parsed.videoId) : null;

                      return (
                        <div
                          key={item.url}
                          onClick={() => handlePlaySuggestion(item)}
                          className={cn(
                            "flex items-center gap-2 p-2 rounded-lg border cursor-pointer group relative overflow-hidden",
                            "transition-colors duration-150",
                            isMatch
                              ? "bg-primary/10 border-primary/30 shadow-md"
                              : "bg-background/40 border-border/30 hover:bg-background/60 hover:border-primary/20 hover:shadow-sm"
                          )}
                        >
                          {/* Thumbnail */}
                          <div className={cn(
                            "relative w-16 h-9 shrink-0 rounded overflow-hidden bg-black/40 flex items-center justify-center",
                            "transition-colors duration-150",
                            isMatch ? "ring-2 ring-primary/40 shadow-lg" : "group-hover:ring-1 group-hover:ring-primary/20"
                          )}>
                            {thumbnailUrl ? (
                              <img
                                src={thumbnailUrl}
                                alt={item.label}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span className="text-[8px] font-mono text-muted-foreground/40">YT</span>
                            )}

                            {/* Animated overlay when playing */}
                            {isPlaying && (
                              <div className="absolute inset-0 z-10 bg-black/20 pointer-events-none">
                                <MusicVisualizer
                                  isPlaying={true}
                                  barCount={3}
                                  className="items-end pb-0.5 h-full w-full px-1.5 opacity-90"
                                />
                              </div>
                            )}

                            {isBuffering && (
                              <div className="absolute inset-0 bg-primary/20 flex items-center justify-center backdrop-blur-sm">
                                <Loader2 className="h-4 w-4 text-white animate-spin" />
                              </div>
                            )}
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <p className={cn(
                              "text-sm font-medium truncate leading-tight transition-colors duration-200",
                              isMatch ? "text-primary" : "text-foreground/90 group-hover:text-foreground"
                            )}>
                              {item.label}
                            </p>
                            <p className="text-[11px] text-muted-foreground/70 truncate">
                              {item.description}
                            </p>
                          </div>

                          {/* Play/Loading button */}
                          <div
                            className={cn(
                              "flex items-center justify-center w-6 h-6 rounded-full shrink-0",
                              "transition-colors duration-150",
                              isMatch
                                ? "bg-primary text-primary-foreground shadow-md"
                                : "bg-transparent opacity-0 group-hover:opacity-100 group-hover:bg-primary/10"
                            )}
                          >
                            {isBuffering ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : isPlaying ? (
                              <Pause className="h-3 w-3 fill-current" />
                            ) : (
                              <Play className="h-3 w-3 fill-current" />
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </TabsContent>
            )
          ))}
        </AnimatePresence>
      </div>
    </Tabs>
  );
});

YouTubePane.displayName = 'YouTubePane';

export default YouTubePane;
