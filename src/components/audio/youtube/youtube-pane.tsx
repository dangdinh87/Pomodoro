'use client';

import { useState, useCallback, useMemo, memo, useEffect, useRef } from 'react';
import { AnimatePresence } from 'motion/react';
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
import { Play, Pause, DiceThree, CircleNotch, CaretLeft, CaretRight, Flag, Headphones, Coffee, PianoKeys, Planet, Leaf, Code, Timer, Brain, Folder } from '@phosphor-icons/react/dist/ssr';
import type { Icon } from '@phosphor-icons/react';
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

const categoryIcons: Record<string, Icon> = {
  'Chill VN': Flag,
  'Lofi': Headphones,
  'Cafe': Coffee,
  'Piano': PianoKeys,
  'Ambient': Planet,
  'Nature': Leaf,
  'Coding': Code,
  'Pomodoro': Timer,
  'Brainwaves': Brain,
};

const stripTrailingEmoji = (text: string) => {
  const chars = Array.from(text);
  while (chars.length && (chars[chars.length - 1] === ' ' || chars[chars.length - 1].codePointAt(0)! >= 0x2190)) chars.pop();
  return chars.join('');
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
        <div className="bg-surface border border-border rounded-lg overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-2.5 py-1.5 border-b border-border">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-ink-secondary">{t('audio.youtube.library')}</h3>
              <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-surface-raised text-ink-secondary font-semibold tabular-nums">
                {youtubeSuggestions.length}
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handlePickRandomSuggestion}
              className="h-6 gap-1 text-[10px] font-semibold px-2"
            >
              <DiceThree size={12} />
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
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 h-8 w-8 bg-surface hover:bg-surface-hover border border-border"
              >
                <CaretLeft size={16} />
              </Button>
            )}
            {canScrollRight && (
              <Button
                variant="ghost"
                size="icon"
                onClick={scrollRight}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 h-8 w-8 bg-surface hover:bg-surface-hover border border-border"
              >
                <CaretRight size={16} />
              </Button>
            )}
            <div
              ref={scrollRef}
              className="overflow-x-auto p-1.5 scroll-smooth"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}
            >
              <div className="flex gap-2">
                {categories.map((cat) => {
                  const CatIcon = categoryIcons[cat] || Folder;
                  const isActive = selectedCategory === cat;
                  return (
                    <button
                      key={cat}
                      type="button"
                      aria-pressed={isActive}
                      onClick={() => setSelectedCategory(cat)}
                      className={cn(
                        "inline-flex h-8 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border px-3 text-sm outline-none transition-colors duration-[140ms] focus-visible:ring-2 focus-visible:ring-brand",
                        isActive
                          ? "border-transparent bg-primary font-semibold text-white"
                          : "border-border text-ink-secondary hover:bg-surface-hover"
                      )}
                    >
                      <CatIcon size={16} aria-hidden="true" />
                      <span>{t(`audio.youtube.categories.${cat}`)}</span>
                    </button>
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
                  <div className="m-2 overflow-hidden rounded-lg border border-border bg-surface divide-y divide-border">
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
                            "flex items-center gap-2 px-2 py-2 cursor-pointer group relative overflow-hidden",
                            "transition-colors duration-150",
                            isMatch ? "bg-surface-raised" : "hover:bg-surface-hover"
                          )}
                        >
                          {/* Thumbnail */}
                          <div className={cn(
                            "relative w-16 h-9 shrink-0 rounded-md overflow-hidden bg-surface-raised flex items-center justify-center",
                            isMatch && "ring-2 ring-brand"
                          )}>
                            {thumbnailUrl ? (
                              <img
                                src={thumbnailUrl}
                                alt={item.label}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span className="text-[8px] font-mono text-ink-faint">YT</span>
                            )}

                            {/* Animated overlay when playing */}
                            {isPlaying && (
                              <div className="absolute inset-0 z-10 bg-black/30 pointer-events-none text-white">
                                <MusicVisualizer
                                  isPlaying={true}
                                  barCount={3}
                                  className="items-end pb-0.5 h-full w-full px-1.5 opacity-90"
                                />
                              </div>
                            )}

                            {isBuffering && (
                              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                <CircleNotch size={16} className="text-white animate-spin" />
                              </div>
                            )}
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <p className={cn(
                              "text-sm font-medium truncate leading-tight transition-colors duration-200",
                              isMatch ? "text-ink font-semibold" : "text-ink-secondary group-hover:text-ink"
                            )}>
                              {item.label}
                            </p>
                            <p className="text-[11px] text-ink-faint truncate">
                              {stripTrailingEmoji(item.description)}
                            </p>
                          </div>

                          {/* Play/Loading button */}
                          <div
                            className={cn(
                              "flex items-center justify-center w-6 h-6 rounded-full shrink-0",
                              "transition-colors duration-150",
                              isMatch
                                ? "bg-primary text-white"
                                : "opacity-0 group-hover:opacity-100 bg-surface-raised text-ink-secondary"
                            )}
                          >
                            {isBuffering ? (
                              <CircleNotch size={12} className="animate-spin" />
                            ) : isPlaying ? (
                              <Pause size={12} weight="fill" />
                            ) : (
                              <Play size={12} weight="fill" />
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
