'use client';

import { memo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Play, Pause, CircleNotch, X } from '@phosphor-icons/react/dist/ssr';
import { MusicVisualizer } from './music-visualizer';
import { ParsedYouTubeUrl, YouTubeSource } from '@/hooks/use-youtube-player';
import { YouTubeOEmbedResponse } from '@/lib/youtube-utils';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/contexts/i18n-context';

interface YouTubeInputSectionProps {
  youtubeUrl: string;
  onUrlChange: (url: string) => void;
  parsedUrl: ParsedYouTubeUrl;
  playerStatus: 'stopped' | 'playing' | 'paused' | 'buffering';
  currentSource: YouTubeSource | null;
  onTogglePlayback: () => void;
  onStop: () => void;
  playingVideoDetails?: YouTubeOEmbedResponse | null;
  thumbnailUrl?: string; // New prop for the thumbnail
}

// Fixed height so the row doesn't jump
const PLAYER_HEIGHT = 'h-[52px]';

// Extract the compact NowPlaying UI to a sub-component for clarity
const NowPlayingCompact = ({
  thumbnailUrl,
  isPlaying,
  onToggle,
  onStop,
  onInputClick,
}: {
  thumbnailUrl?: string;
  isPlaying: boolean;
  onToggle: () => void;
  onStop: () => void;
  onInputClick?: () => void;
}) => {
  const { t } = useTranslation();
  return (
    <div className="flex items-center gap-3 w-full h-full px-1">
      <div
        className={cn(
          'group relative h-10 w-10 shrink-0 cursor-pointer overflow-hidden rounded-md bg-surface-raised',
          isPlaying && 'ring-2 ring-brand'
        )}
        onClick={onInputClick}
      >
        {thumbnailUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={thumbnailUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-ink-faint">
            <Play size={16} weight="fill" aria-hidden="true" />
          </div>
        )}
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/60 opacity-0 transition-opacity group-hover:opacity-100">
          <span className="text-[0.6875rem] font-semibold uppercase tracking-wider text-white">{t('common.edit')}</span>
        </div>
      </div>

      {/* Enhanced Info Section */}
      <div className="flex-1 min-w-0 flex flex-col justify-center cursor-pointer" onClick={onInputClick}>
        {/* Enhanced Playing Status */}
        <div className="flex items-center gap-2 mb-0.5">
          <span
            className={cn(
              "flex items-center gap-1.5 text-[0.6875rem] font-semibold uppercase tracking-wider",
              isPlaying ? "text-brand" : "text-ink-muted"
            )}
          >
            {isPlaying && (
              <span className="h-3 w-4">
                <MusicVisualizer isPlaying barCount={4} />
              </span>
            )}
            {isPlaying ? t('audio.youtube.status.playing') : t('audio.youtube.status.paused')}
          </span>
        </div>

        {/* Title with smooth styling */}
        <p
          className={cn(
            "text-xs font-semibold truncate leading-tight transition-all duration-300",
            isPlaying ? "text-ink" : "text-ink-secondary group-hover:text-ink"
          )}
        >
          {isPlaying ? t('audio.youtube.nowPlaying') : t('audio.youtube.soundSettings')}
        </p>
      </div>

      {/* Enhanced Controls */}
      <div className="flex items-center gap-1">
        <div>
          <Button
            variant="ghost"
            size="icon"
            className={cn("h-8 w-8 shrink-0 rounded-full", isPlaying && "text-brand")}
            onClick={onToggle}
            title={isPlaying ? t('common.pause') : t('common.play')}
          >
            {isPlaying ? (
              <Pause size={16} weight="fill" />
            ) : (
              <Play size={16} weight="fill" />
            )}
          </Button>
        </div>

        <div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0 rounded-full hover:text-danger"
            onClick={onStop}
            title={t('audio.youtube.close')}
          >
            <X size={16} />
          </Button>
        </div>
      </div>
    </div>
  );
};

export const YouTubeInputSection = memo(({
  youtubeUrl,
  onUrlChange,
  parsedUrl,
  playerStatus,
  currentSource,
  onTogglePlayback,
  onStop,
  playingVideoDetails,
  // Destructure new prop
  thumbnailUrl,
}: YouTubeInputSectionProps) => {
  const { t } = useTranslation();
  const { videoId, listId, isChannel } = parsedUrl;
  const isValidYouTube = !!youtubeUrl && (!!videoId || !!listId) && !isChannel;

  const isCurrentSourcePlaying = currentSource && (
    (videoId && currentSource.videoId === videoId) ||
    (listId && !videoId && currentSource.listId === listId)
  );

  const effectiveStatus = isCurrentSourcePlaying ? playerStatus : 'stopped';
  const isPlaying = effectiveStatus === 'playing';
  const isPaused = effectiveStatus === 'paused';
  const isBuffering = effectiveStatus === 'buffering';
  // Khóa input chỉ khi đang phát hoặc đang load
  const isLocked = isPlaying || isBuffering;
  const isActive = isPlaying || isPaused || isBuffering;

  const toggleLabel = isChannel
    ? t('audio.youtube.channelLink')
    : isPlaying
      ? t('common.pause')
      : isPaused
        ? t('common.play')
        : t('audio.youtube.playBackground');

  // We consider "active" for the UI transformation if we have valid video details AND
  // we are in a state that implies user engagement (playing, paused, buffering)
  // OR if we just have a valid active source loaded.
  const showNowPlaying = isActive && playingVideoDetails;

  return (
    <div className="flex flex-col">
      <div className={cn(
        'relative rounded-lg overflow-hidden border bg-surface transition-all duration-300 ease-in-out focus-within:outline-hidden focus-within:ring-0',
        PLAYER_HEIGHT,
        isPlaying
          ? "border-[color-mix(in_srgb,var(--accent)_50%,var(--border))]"
          : "border-border"
      )}>
        <AnimatePresence mode="wait">
          {showNowPlaying ? (
            <motion.div
              key="now-playing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="w-full h-full relative"
            >
              <NowPlayingCompact
                thumbnailUrl={thumbnailUrl}
                isPlaying={isPlaying}
                onToggle={onTogglePlayback}
                onStop={onStop}
                onInputClick={onStop} // Clicking text/thumb also stops to edit
              />
            </motion.div>
          ) : (
            <motion.div
              key="input-section"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-2 w-full h-full p-1.5"
            >
              <div className="relative flex-1 h-full">
                <Input
                  placeholder={t('audio.youtube.placeholder')}
                  value={youtubeUrl}
                  onChange={(e) => onUrlChange(e.target.value)}
                  disabled={isBuffering}
                  className="w-full h-full text-sm border-0 focus-visible:ring-0 focus-visible:ring-offset-0 focus:outline-hidden focus:ring-0 focus:border-0 px-3 bg-transparent shadow-none"
                />
              </div>

              <Button
                onClick={onTogglePlayback}
                disabled={(!videoId && !listId) || isChannel}
                size="sm"
                className="h-full px-4"
                title={toggleLabel}
              >
                {isBuffering ? (
                  <CircleNotch size={16} className="animate-spin" />
                ) : (
                  <Play size={16} weight="fill" />
                )}
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Error feedback */}
      {!isValidYouTube && youtubeUrl && !isChannel && !showNowPlaying && (
        <div className="text-xs text-danger mt-1 px-1">
          {t('audio.youtube.invalidLink')}
        </div>
      )}
    </div>
  );
});

YouTubeInputSection.displayName = 'YouTubeInputSection';