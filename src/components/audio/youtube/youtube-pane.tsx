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
import { YouTubeThumbnail } from './youtube-thumbnail';
import { Button } from '@/components/ui/button';
import { FilterChip } from '@/components/ui/filter-chip';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { Play, Pause, DiceThree, CircleNotch, CaretLeft, CaretRight, Flag, Headphones, Coffee, PianoKeys, Planet, Leaf, Code, Timer, Brain, Folder } from '@phosphor-icons/react/dist/ssr';
import type { Icon } from '@phosphor-icons/react';
import { MusicVisualizer } from './music-visualizer';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/contexts/i18n-context';

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
  const { playerState, togglePlayback, stopPlayback, play } = useYouTubePlayer();

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
      await play({ listId: parsed.listId });
    } else if (parsed.videoId) {
      await play({ videoId: parsed.videoId });
    }
  }, [play, updateAudioSettings, togglePlayback, playerState.currentSource]);

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
      await play({ listId: parsed.listId });
    } else if (parsed.videoId) {
      await play({ videoId: parsed.videoId });
    }
  }, [play, updateAudioSettings]);

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

  const currentThumbnail = playerState.currentSource?.videoId
    ? getYouTubeThumbnailUrl(playerState.currentSource.videoId)
    : undefined;

  return (
    <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="flex flex-col h-full min-h-0">
      {/* Fixed Header - URL Input + Library (no scroll) */}
      <div className="shrink-0 space-y-3 px-1.5 pb-3 pt-1 -mx-1.5">
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

        {/* Library card: category chips (same pattern as the sound presets) */}
        <section aria-label={t('audio.youtube.library')} className="sticker-sm overflow-hidden">
          <div className="flex items-center justify-between gap-2 px-3 pb-1 pt-3">
            <div className="flex items-center gap-2">
              <h3 className="font-heading text-[1.0625rem] font-bold text-ink">{t('audio.youtube.library')}</h3>
              <span className="rounded-full bg-surface-raised px-2 py-0.5 text-xs font-bold tabular-nums text-ink-secondary">
                {youtubeSuggestions.length}
              </span>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={handlePickRandomSuggestion}
              className="gap-1"
            >
              <DiceThree size={14} weight="bold" aria-hidden="true" />
              {t('audio.youtube.random')}
            </Button>
          </div>
          {/* Scrollable chips with arrows */}
          <div className="relative">
            {canScrollLeft && (
              <Button
                variant="secondary"
                size="icon"
                onClick={scrollLeft}
                aria-label={t('audio.scrollLeft')}
                className="absolute left-1 top-1/2 z-10 size-8 -translate-y-1/2"
              >
                <CaretLeft size={16} weight="bold" aria-hidden="true" />
              </Button>
            )}
            {canScrollRight && (
              <Button
                variant="secondary"
                size="icon"
                onClick={scrollRight}
                aria-label={t('audio.scrollRight')}
                className="absolute right-1 top-1/2 z-10 size-8 -translate-y-1/2"
              >
                <CaretRight size={16} weight="bold" aria-hidden="true" />
              </Button>
            )}
            <div
              ref={scrollRef}
              role="group"
              aria-label={t('audio.youtube.library')}
              className="flex items-center gap-2 overflow-x-auto scroll-smooth px-3 py-2.5 scrollbar-hide"
            >
              {categories.map((cat) => {
                const CatIcon = categoryIcons[cat] || Folder;
                return (
                  <FilterChip
                    key={cat}
                    active={selectedCategory === cat}
                    onClick={() => setSelectedCategory(cat)}
                  >
                    <CatIcon size={16} aria-hidden="true" />
                    <span>{t(`audio.youtube.categories.${cat}`)}</span>
                  </FilterChip>
                );
              })}
            </div>
          </div>
        </section>
      </div>

      {/* Scrollable Content: Video List */}
      <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
        <AnimatePresence mode="wait">
          {categories.map((cat) => (
            cat === selectedCategory && (
              <TabsContent key={cat} value={cat} className="h-full min-h-0 m-0 p-0 flex flex-col">
                <div className="-mx-1.5 min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-1.5 pb-3 pt-1 custom-scrollbar">
                  <ul className="sticker-sm divide-y-2 divide-border overflow-hidden">
                    {filteredSuggestions.map((item) => {
                      const isMatch = isSuggestionPlaying(item.url);
                      const isPlaying = isMatch && playerState.status === 'playing';
                      const isBuffering = isMatch && playerState.status === 'buffering';
                      const parsed = parseYouTubeUrl(item.url);
                      const thumbnailUrl = parsed.videoId ? getYouTubeThumbnailUrl(parsed.videoId) : null;
                      const rowLabel = isPlaying ? `${t('common.pause')}: ${item.label}` : `${t('common.play')}: ${item.label}`;

                      return (
                        <li key={item.url}>
                          <button
                            type="button"
                            onClick={() => handlePlaySuggestion(item)}
                            aria-label={rowLabel}
                            aria-pressed={isMatch}
                            className={cn(
                              "focus-ring group relative flex w-full items-center gap-3 px-3 py-2.5 text-left focus-visible:outline-offset-[-3px]",
                              "transition-colors duration-150",
                              isMatch ? "bg-surface-raised" : "hover:bg-surface-hover"
                            )}
                          >
                            {/* Thumbnail */}
                            <div className="relative flex h-9 w-16 shrink-0 items-center justify-center overflow-hidden rounded-[8px] border-2 border-outline bg-surface-raised">
                              <YouTubeThumbnail
                                src={thumbnailUrl}
                                className="h-full w-full object-cover"
                                fallback={<span className="font-mono text-[8px] text-ink-muted">YT</span>}
                              />

                              {/* Animated overlay when playing */}
                              {isPlaying && (
                                <div className="pointer-events-none absolute inset-0 z-10 bg-black/40 text-white">
                                  <MusicVisualizer
                                    isPlaying={true}
                                    barCount={3}
                                    className="h-full w-full items-end px-1.5 pb-0.5 opacity-90"
                                  />
                                </div>
                              )}

                              {isBuffering && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                                  <CircleNotch size={16} className="animate-spin text-white" />
                                </div>
                              )}
                            </div>

                            {/* Info */}
                            <div className="min-w-0 flex-1">
                              <p className={cn(
                                "truncate text-sm leading-tight",
                                isMatch ? "font-bold text-ink" : "font-semibold text-ink-secondary group-hover:text-ink"
                              )}>
                                {item.label}
                              </p>
                              <p className="truncate text-xs text-ink-muted">
                                {stripTrailingEmoji(item.description)}
                              </p>
                            </div>

                            {/* Play/Loading state */}
                            <span
                              aria-hidden="true"
                              className={cn(
                                "flex size-8 shrink-0 items-center justify-center rounded-full border-2 border-outline transition-colors duration-150",
                                isMatch
                                  ? "bg-primary text-on-accent shadow-sticker-sm"
                                  : "bg-surface text-ink-secondary"
                              )}
                            >
                              {isBuffering ? (
                                <CircleNotch size={14} className="animate-spin" />
                              ) : isPlaying ? (
                                <Pause size={14} weight="fill" />
                              ) : (
                                <Play size={14} weight="fill" />
                              )}
                            </span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
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
