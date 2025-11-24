'use client';

import { useState, useCallback, useMemo, memo, useEffect } from 'react';
import { useAudioStore } from '@/stores/audio-store';
import { useYouTubePlayer, parseYouTubeUrl } from '@/hooks/use-youtube-player';
import { fetchYouTubeOEmbed, YouTubeOEmbedResponse } from '@/lib/youtube-utils';
import { getRandomSuggestion, youtubeSuggestions } from '@/data/youtube-suggestions';
import { YouTubeInputSection } from './youtube-input-section';
import { YouTubePreview } from './youtube-preview';

const YouTubePane = memo(() => {
  // Audio store hooks
  const audioSettings = useAudioStore((state) => state.audioSettings);
  const updateAudioSettings = useAudioStore((state) => state.updateAudioSettings);
  const clearCurrentlyPlaying = useAudioStore((state) => state.clearCurrentlyPlaying);

  const [youtubeUrl, setYoutubeUrl] = useState<string>(audioSettings.youtubeUrl || '');
  const [showPreview, setShowPreview] = useState(!!audioSettings.youtubeUrl);
  const [currentPlayingSuggestion, setCurrentPlayingSuggestion] = useState<string>('');

  // State for currently playing video details
  const [playingVideoDetails, setPlayingVideoDetails] = useState<YouTubeOEmbedResponse | null>(null);

  // YouTube player hook
  const { playerState, togglePlayback } = useYouTubePlayer();

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
    setCurrentPlayingSuggestion('');
    // Save to audio store for persistence
    updateAudioSettings({ youtubeUrl: url });
  }, [updateAudioSettings]);

  // Handle playback toggle
  const handleTogglePlayback = useCallback(() => {
    togglePlayback(videoId, listId, isChannel);
  }, [togglePlayback, videoId, listId, isChannel]);

  // Handle suggestion play
  const handlePlaySuggestion = useCallback((suggestion: typeof youtubeSuggestions[0]) => {
    setYoutubeUrl(suggestion.url);
    setShowPreview(true);
    setCurrentPlayingSuggestion(suggestion.url);

    // Play immediately after a short delay to ensure state is updated
    setTimeout(() => {
      const parsed = parseYouTubeUrl(suggestion.url);
      togglePlayback(parsed.videoId, parsed.listId, parsed.isChannel);
    }, 100);
  }, [togglePlayback]);

  // Handle random suggestion
  const handlePickRandomSuggestion = useCallback(() => {
    const randomSuggestion = getRandomSuggestion();
    setYoutubeUrl(randomSuggestion.url);
    setShowPreview(true);

    // Play immediately if valid
    const parsed = parseYouTubeUrl(randomSuggestion.url);
    if (parsed.videoId || parsed.listId) {
      setTimeout(() => {
        togglePlayback(parsed.videoId, parsed.listId, parsed.isChannel);
      }, 100);
    }
  }, [togglePlayback]);

  // Handle preview toggle
  const handleTogglePreview = useCallback(() => {
    setShowPreview(prev => !prev);
  }, []);

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
              onTogglePlayback={handleTogglePlayback}
            />
          </div>

          {/* Preview Section */}
          {showPreview && (
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

      {/* Suggestions Section */}
      {/* <section className="space-y-4 rounded-xl border bg-background/60 p-4 shadow-sm">
        <YouTubeSuggestions
          suggestions={youtubeSuggestions}
          currentPlayingSuggestion={currentPlayingSuggestion}
          currentYoutubeUrl={youtubeUrl}
          currentSource={playerState.currentSource}
          onPlaySuggestion={handlePlaySuggestion}
          onPickRandomSuggestion={handlePickRandomSuggestion}
        />
      </section> */}
    </div>
  );
});

YouTubePane.displayName = 'YouTubePane';

export default YouTubePane;