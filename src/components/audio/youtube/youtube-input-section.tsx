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
const PLAYER_HEIGHT = 'min-h-[56px]';

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
    <div className="flex h-full w-full items-center gap-3 px-2.5 py-2">
      <button
        type="button"
        onClick={onInputClick}
        aria-label={t('audio.youtube.close')}
        className="focus-ring group relative h-10 w-14 shrink-0 overflow-hidden rounded-[8px] border-2 border-outline bg-surface-raised"
      >
        {thumbnailUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={thumbnailUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-ink-muted">
            <Play size={16} weight="fill" aria-hidden="true" />
          </div>
        )}
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/60 opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
          <span className="text-[0.6875rem] font-bold text-white">{t('common.edit')}</span>
        </div>
      </button>

      {/* Playing status + what is on */}
      <div className="flex min-w-0 flex-1 flex-col justify-center">
        <span
          className={cn(
            "mb-0.5 flex items-center gap-1.5 text-xs font-bold",
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
        <p className="truncate text-xs font-semibold leading-tight text-ink">
          {isPlaying ? t('audio.youtube.nowPlaying') : t('audio.youtube.soundSettings')}
        </p>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-1.5">
        <Button
          variant={isPlaying ? 'default' : 'secondary'}
          size="icon"
          className="size-9 shrink-0 rounded-full"
          onClick={onToggle}
          aria-label={isPlaying ? t('common.pause') : t('common.play')}
        >
          {isPlaying ? <Pause size={16} weight="fill" /> : <Play size={16} weight="fill" />}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="size-9 shrink-0 rounded-full hover:text-danger-ink"
          onClick={onStop}
          aria-label={t('audio.youtube.close')}
        >
          <X size={16} weight="bold" />
        </Button>
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
        'relative flex items-center transition-colors duration-300',
        PLAYER_HEIGHT,
        showNowPlaying && 'sticker-sm overflow-hidden',
        showNowPlaying && isPlaying && 'bg-brand-soft'
      )}>
        <AnimatePresence mode="wait" initial={false}>
          {showNowPlaying ? (
            <motion.div
              key="now-playing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="w-full relative"
            >
              <NowPlayingCompact
                thumbnailUrl={thumbnailUrl}
                isPlaying={isPlaying}
                onToggle={onTogglePlayback}
                onStop={onStop}
                onInputClick={onStop} // Clicking the thumbnail also stops, to edit the link
              />
            </motion.div>
          ) : (
            <motion.div
              key="input-section"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.2 }}
              className="flex w-full items-center gap-2"
            >
              <Input
                placeholder={t('audio.youtube.placeholder')}
                aria-label={t('audio.youtube.placeholder')}
                aria-invalid={!isValidYouTube && !!youtubeUrl && !isChannel ? true : undefined}
                value={youtubeUrl}
                onChange={(e) => onUrlChange(e.target.value)}
                disabled={isBuffering}
                className="min-w-0 flex-1"
              />

              <Button
                onClick={onTogglePlayback}
                disabled={(!videoId && !listId) || isChannel}
                size="icon"
                className="shrink-0"
                title={toggleLabel}
                aria-label={toggleLabel}
              >
                {isBuffering ? (
                  <CircleNotch size={18} className="animate-spin" />
                ) : (
                  <Play size={18} weight="fill" />
                )}
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Error feedback */}
      {!isValidYouTube && youtubeUrl && !isChannel && !showNowPlaying && (
        <div role="alert" className="mt-2 px-1 text-xs font-semibold text-danger-ink">
          {t('audio.youtube.invalidLink')}
        </div>
      )}
    </div>
  );
});

YouTubeInputSection.displayName = 'YouTubeInputSection';
