'use client';

import { motion, AnimatePresence } from 'motion/react';
import { Play, Pause, SkipForward, SkipBack, SpeakerHigh } from '@phosphor-icons/react/dist/ssr';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { MusicVisualizer } from './music-visualizer';
import { cn } from '@/lib/utils';

interface FloatingPlayerBarProps {
  isVisible: boolean;
  title: string;
  thumbnailUrl?: string;
  isPlaying: boolean;
  volume: number;
  onTogglePlay: () => void;
  onVolumeChange: (volume: number) => void;
  onNext?: () => void;
  onPrevious?: () => void;
  className?: string;
}

export function FloatingPlayerBar({
  isVisible,
  title,
  thumbnailUrl,
  isPlaying,
  volume,
  onTogglePlay,
  onVolumeChange,
  onNext,
  onPrevious,
  className = '',
}: FloatingPlayerBarProps) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 320, damping: 26 }}
          className={cn('fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-3xl', className)}
        >
          <div className="rounded-lg border border-border bg-surface/80 px-4 py-3 shadow-[0_4px_20px_-8px_rgba(0,0,0,0.06)] backdrop-blur-md">
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  'relative h-12 w-12 shrink-0 overflow-hidden rounded-md bg-surface-raised',
                  isPlaying && 'ring-2 ring-brand',
                )}
              >
                {thumbnailUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={thumbnailUrl} alt={title} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-ink-faint">
                    <Play size={20} weight="fill" aria-hidden="true" />
                  </div>
                )}
              </div>

              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex h-3 items-center gap-1.5">
                  {isPlaying ? (
                    <>
                      <div className="h-3 w-4 text-brand">
                        <MusicVisualizer isPlaying barCount={4} />
                      </div>
                      <span className="text-[0.6875rem] font-semibold uppercase tracking-[0.05em] text-brand">
                        Now Playing
                      </span>
                    </>
                  ) : (
                    <span className="text-[0.6875rem] font-semibold uppercase tracking-[0.05em] text-ink-muted">
                      Paused
                    </span>
                  )}
                </div>
                <p className={cn('truncate text-sm font-semibold leading-tight', isPlaying ? 'text-ink' : 'text-ink-secondary')}>
                  {title}
                </p>
              </div>

              <div className="flex items-center gap-1">
                {onPrevious && (
                  <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full" onClick={onPrevious} aria-label="Previous">
                    <SkipBack size={16} weight="fill" />
                  </Button>
                )}
                <Button
                  size="icon"
                  className="h-11 w-11 rounded-full"
                  onClick={onTogglePlay}
                  aria-label={isPlaying ? 'Pause' : 'Play'}
                >
                  {isPlaying ? <Pause size={20} weight="fill" /> : <Play size={20} weight="fill" />}
                </Button>
                {onNext && (
                  <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full" onClick={onNext} aria-label="Next">
                    <SkipForward size={16} weight="fill" />
                  </Button>
                )}
              </div>

              <div className="hidden w-32 items-center gap-2.5 md:flex">
                <SpeakerHigh size={16} className="shrink-0 text-ink-muted" />
                <Slider
                  value={[volume]}
                  min={0}
                  max={100}
                  step={1}
                  onValueChange={(v) => onVolumeChange(v[0])}
                  className="flex-1"
                />
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
