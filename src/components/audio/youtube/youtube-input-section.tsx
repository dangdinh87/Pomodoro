'use client';

import { memo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Play, Pause, Loader2, X } from 'lucide-react';
import { MusicVisualizer } from './music-visualizer';
import { ParsedYouTubeUrl, YouTubeSource } from '@/hooks/use-youtube-player';
import { YouTubeOEmbedResponse } from '@/lib/youtube-utils';
import { motion, AnimatePresence } from 'framer-motion';
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
      {/* Enhanced YouTube Thumbnail with smooth animations */}
      <motion.div
        className="relative w-10 h-10 shrink-0 rounded-lg overflow-visible cursor-pointer group"
        onClick={onInputClick}
        whileHover={{ scale: 1.05 }}
        transition={{
          type: 'spring',
          stiffness: 400,
          damping: 30,
        }}
      >
        {/* Subtle glow ring when playing */}
        {isPlaying && (
          <motion.div
            className="absolute inset-0 rounded-lg"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0, 0.3, 0],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: [0.4, 0, 0.2, 1],
            }}
            style={{
              background: 'radial-gradient(circle, rgba(255,0,0,0.6) 0%, transparent 70%)',
              filter: 'blur(12px)',
            }}
          />
        )}

        {/* Main thumbnail */}
        <div className="relative w-full h-full rounded-lg overflow-hidden bg-black/40 shadow-md">
          {thumbnailUrl ? (
            <motion.img
              src={thumbnailUrl}
              alt="YouTube Thumbnail"
              className="w-full h-full object-cover"
              animate={
                isPlaying
                  ? {
                      scale: [1.03, 1.05, 1.03],
                    }
                  : {
                      scale: 1,
                    }
              }
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: [0.45, 0, 0.55, 1],
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-red-500/20 to-red-600/20">
              <svg className="w-4 h-4 text-red-500/60" viewBox="0 0 24 24" fill="currentColor">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
            </div>
          )}

          {/* Enhanced playing state overlay */}
          {isPlaying && (
            <>
              {/* Subtle waveform overlay */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-t from-red-500/30 via-red-500/15 to-transparent pointer-events-none z-10"
                animate={{
                  opacity: [0.7, 1, 0.7],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: [0.4, 0, 0.2, 1],
                }}
              >
                <MusicVisualizer
                  isPlaying={isPlaying}
                  barCount={4}
                  className="items-end pb-1 h-full w-full px-2 opacity-70"
                />
              </motion.div>

              {/* Smooth pulsing border */}
              <motion.div
                className="absolute inset-0 rounded-lg border border-red-500/60 pointer-events-none z-10"
                animate={{
                  opacity: [0.5, 0.8, 0.5],
                  borderColor: ['rgba(239, 68, 68, 0.4)', 'rgba(239, 68, 68, 0.7)', 'rgba(239, 68, 68, 0.4)'],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: [0.4, 0, 0.2, 1],
                }}
              />
            </>
          )}

          {/* Toggle overlay on hover */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 z-20">
            <span className="text-[8px] text-white font-bold uppercase tracking-wide">{t('common.edit')}</span>
          </div>
        </div>
      </motion.div>

      {/* Enhanced Info Section */}
      <div className="flex-1 min-w-0 flex flex-col justify-center cursor-pointer" onClick={onInputClick}>
        {/* Enhanced Playing Status */}
        <div className="flex items-center gap-2 mb-0.5">
          <motion.span
            className={cn(
              "text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5",
              isPlaying ? "text-red-500" : "text-muted-foreground"
            )}
            animate={
              isPlaying
                ? {
                    opacity: [0.85, 1, 0.85],
                  }
                : {}
            }
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: [0.4, 0, 0.2, 1],
            }}
          >
            {isPlaying && (
              <span className="relative flex h-2 w-2">
                <motion.span
                  className="absolute inline-flex h-full w-full rounded-full bg-red-500"
                  animate={{
                    scale: [1, 2, 1],
                    opacity: [0.6, 0, 0.6],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: [0.4, 0, 0.6, 1],
                  }}
                />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500 shadow-[0_0_6px_rgba(255,0,0,0.5)]"></span>
              </span>
            )}
            {isPlaying ? t('audio.youtube.status.playing') : t('audio.youtube.status.paused')}
          </motion.span>
        </div>

        {/* Title with smooth styling */}
        <p
          className={cn(
            "text-xs font-semibold truncate leading-tight transition-all duration-300",
            isPlaying ? "text-foreground" : "text-foreground/70 group-hover:text-foreground"
          )}
        >
          {isPlaying ? t('audio.youtube.nowPlaying') : t('audio.youtube.soundSettings')}
        </p>
      </div>

      {/* Enhanced Controls */}
      <div className="flex items-center gap-1">
        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "h-8 w-8 shrink-0 rounded-full transition-all duration-200",
              isPlaying
                ? "hover:bg-red-500/20 hover:text-red-500 text-red-500"
                : "hover:bg-primary/10 hover:text-primary"
            )}
            onClick={onToggle}
            title={isPlaying ? t('common.pause') : t('common.play')}
          >
            {isPlaying ? (
              <Pause className="h-4 w-4 fill-current" />
            ) : (
              <Play className="h-4 w-4 fill-current ml-0.5" />
            )}
          </Button>
        </motion.div>

        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0 hover:bg-destructive/10 hover:text-destructive rounded-full"
            onClick={onStop}
            title={t('audio.youtube.close')}
          >
            <X className="h-4 w-4" />
          </Button>
        </motion.div>
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
        'relative rounded-lg overflow-hidden border bg-background/40 transition-all duration-300 ease-in-out focus-within:outline-none focus-within:ring-0',
        PLAYER_HEIGHT,
        isPlaying
          ? "border-primary/50 shadow-[0_0_15px_-3px_rgba(225,29,72,0.15)] bg-gradient-to-r from-background/40 via-primary/5 to-background/40"
          : "border-border focus-within:border-border focus-within:shadow-none"
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
                  className="w-full h-full text-sm border-0 focus-visible:ring-0 focus-visible:ring-offset-0 focus:outline-none focus:ring-0 focus:border-0 px-3 bg-transparent shadow-none"
                />
              </div>

              <Button
                onClick={onTogglePlayback}
                disabled={(!videoId && !listId) || isChannel}
                size="sm"
                className={cn(
                  "h-full px-4 rounded-md transition-all",
                  (!videoId && !listId) || isChannel
                    ? "bg-muted text-muted-foreground"
                    : "bg-[#ff0000] text-white hover:bg-[#ff0000]/90 shadow-sm"
                )}
                title={toggleLabel}
              >
                {isBuffering ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Play className="h-4 w-4 fill-current ml-0.5" />
                )}
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Error feedback */}
      {!isValidYouTube && youtubeUrl && !isChannel && !showNowPlaying && (
        <div className="text-xs text-destructive mt-1 px-1">
          {t('audio.youtube.invalidLink')}
        </div>
      )}
    </div>
  );
});

YouTubeInputSection.displayName = 'YouTubeInputSection';