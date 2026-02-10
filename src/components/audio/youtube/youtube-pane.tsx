'use client';

import { useState, useCallback, useMemo, memo, useEffect } from 'react';
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
import { ScrollArea } from '@/components/ui/scroll-area';
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

const categoryLabels: Record<string, { label: string; vn: string; icon: string }> = {
  'Lofi': { label: 'Lofi Hip Hop', vn: 'Lofi', icon: '🎧' },
  'Cafe': { label: 'Cafe Ambience', vn: 'Quán Cà Phê', icon: '☕' },
  'Piano': { label: 'Piano & Classical', vn: 'Piano', icon: '🎹' },
  'Ambient': { label: 'Ambient & Flow', vn: 'Không Gian', icon: '🌌' },
  'Nature': { label: 'Nature Sounds', vn: 'Thiên Nhiên', icon: '🌿' },
  'Coding': { label: 'Deep Work', vn: 'Code', icon: '💻' },
  'Pomodoro': { label: 'Pomodoro Sessions', vn: 'Pomodoro', icon: '⏱️' },
  'Brainwaves': { label: 'Brain Waves', vn: 'Sóng Não', icon: '🧠' },
};

const YouTubePane = memo(() => {
  // Audio store hooks
  const audioSettings = useAudioStore((state) => state.audioSettings);
  const updateAudioSettings = useAudioStore((state) => state.updateAudioSettings);

  const [youtubeUrl, setYoutubeUrl] = useState<string>(audioSettings.youtubeUrl || '');
  const [selectedCategory, setSelectedCategory] = useState<string>('Lofi');

  // State for currently playing video details
  const [playingVideoDetails, setPlayingVideoDetails] = useState<YouTubeOEmbedResponse | null>(null);

  // YouTube player hook
  const { playerState, togglePlayback, createOrUpdatePlayer } = useYouTubePlayer();

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

  return (
    <div className="flex flex-col gap-3 h-full">
      {/* Now Playing Badge */}
      {(playerState.status === 'playing' || playerState.status === 'paused') && playerState.currentSource && (
        <div className="flex items-center justify-between gap-2 px-3 py-2 bg-red-500/10 border border-red-500/20 rounded-lg">
          <div className="flex items-center gap-2 min-w-0">
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500/20 shrink-0">
              <YouTubeIcon className="h-3 w-3 text-red-500 fill-current" />
            </div>
            <p className="text-[10px] font-medium text-foreground truncate">
              {playingVideoDetails ? playingVideoDetails.title : 'YouTube'}
            </p>
          </div>
          {playerState.status === 'playing' && (
            <div className="flex gap-0.5 h-2.5 items-end shrink-0">
              <span className="w-0.5 h-1.5 bg-red-500 animate-pulse" />
              <span className="w-0.5 h-2.5 bg-red-500 animate-pulse [animation-delay:0.2s]" />
              <span className="w-0.5 h-1 bg-red-500 animate-pulse [animation-delay:0.4s]" />
            </div>
          )}
        </div>
      )}

      {/* URL Input */}
      <div className="bg-background/40 border rounded-lg p-3">
        <YouTubeInputSection
          youtubeUrl={youtubeUrl}
          onUrlChange={handleUrlChange}
          parsedUrl={parsedUrl}
          playerStatus={playerState.status}
          currentSource={playerState.currentSource}
          onTogglePlayback={handleTogglePlayback}
        />
      </div>

      {/* Library Section with Category Tabs */}
      <div className="flex-1 flex flex-col bg-background/40 border rounded-lg overflow-hidden">
        <div className="flex items-center justify-between px-3 py-2 border-b bg-background/60">
          <div className="flex items-center gap-2">
            <h3 className="text-xs font-bold text-foreground/90">Thư viện</h3>
            <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary font-semibold">
              {youtubeSuggestions.length}
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handlePickRandomSuggestion}
            className="h-6 gap-1 text-[9px] font-semibold hover:bg-primary/10 hover:text-primary px-2"
          >
            <Dice3 className="h-3 w-3" />
            Random
          </Button>
        </div>

        <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="flex-1 flex flex-col">
          <div className="border-b bg-background/30">
            <ScrollArea className="w-full">
              <TabsList className="w-full h-auto justify-start rounded-none bg-transparent p-0">
                {categories.map((cat) => {
                  const catInfo = categoryLabels[cat] || { label: cat, vn: cat, icon: '📁' };
                  return (
                    <TabsTrigger
                      key={cat}
                      value={cat}
                      className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-primary/5 px-3 py-2 text-[10px] font-medium gap-1"
                    >
                      <span>{catInfo.icon}</span>
                      <span className="hidden sm:inline">{catInfo.label}</span>
                      <span className="sm:hidden">{catInfo.vn}</span>
                    </TabsTrigger>
                  );
                })}
              </TabsList>
            </ScrollArea>
          </div>

          <div className="flex-1 overflow-hidden">
            {categories.map((cat) => (
              <TabsContent key={cat} value={cat} className="h-full m-0 p-0">
                <ScrollArea className="h-full">
                  <div className="grid grid-cols-1 gap-1.5 p-2">
                    {filteredSuggestions.map((item) => {
                      const isMatch = isSuggestionPlaying(item.url);
                      const isPlaying = isMatch && playerState.status === 'playing';
                      const parsed = parseYouTubeUrl(item.url);
                      const thumbnailUrl = parsed.videoId ? getYouTubeThumbnailUrl(parsed.videoId) : null;

                      return (
                        <div
                          key={item.url}
                          onClick={() => handlePlaySuggestion(item)}
                          className={cn(
                            "flex items-center gap-2 p-2 rounded-lg border transition-all cursor-pointer group",
                            isMatch
                              ? "bg-primary/10 border-primary/30 shadow-sm"
                              : "bg-background/40 border-border/30 hover:bg-background/60 hover:border-primary/20"
                          )}
                        >
                          {/* Thumbnail */}
                          <div className={cn(
                            "relative w-16 h-9 shrink-0 rounded overflow-hidden bg-black/40 flex items-center justify-center",
                            isMatch ? "ring-1 ring-primary/30" : ""
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
                            {isPlaying && (
                              <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                                <div className="flex gap-0.5 h-2 items-end">
                                  <span className="w-0.5 h-1.5 bg-white animate-pulse" />
                                  <span className="w-0.5 h-2 bg-white animate-pulse [animation-delay:0.2s]" />
                                  <span className="w-0.5 h-1 bg-white animate-pulse [animation-delay:0.4s]" />
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <p className={cn(
                              "text-[11px] font-medium truncate leading-tight",
                              isMatch ? "text-primary" : "text-foreground/90"
                            )}>
                              {item.label}
                            </p>
                            <p className="text-[9px] text-muted-foreground/60 truncate">
                              {item.description}
                            </p>
                          </div>

                          {/* Play button */}
                          <div className={cn(
                            "flex items-center justify-center w-6 h-6 rounded-full transition-all shrink-0",
                            isMatch
                              ? "bg-primary text-primary-foreground"
                              : "bg-transparent opacity-0 group-hover:opacity-100 group-hover:bg-primary/10"
                          )}>
                            {isPlaying ? (
                              <Pause className="h-3 w-3 fill-current" />
                            ) : (
                              <Play className="h-3 w-3 fill-current" />
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              </TabsContent>
            ))}
          </div>
        </Tabs>
      </div>
    </div>
  );
});

YouTubePane.displayName = 'YouTubePane';

export default YouTubePane;
