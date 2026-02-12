'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Play, Pause, SkipForward, SkipBack, Volume2, Radio } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { WaveformVisualizer } from './music-visualizer';
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
  const [shouldAnimate, setShouldAnimate] = useState(true);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setShouldAnimate(!mediaQuery.matches);
    const handleChange = () => setShouldAnimate(!mediaQuery.matches);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className={cn(
            'fixed bottom-4 left-4 right-4 z-50',
            'max-w-3xl mx-auto',
            className
          )}
        >
          {/* Enhanced Glassmorphism Container with depth layers */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-background/90 via-background/85 to-background/80 backdrop-blur-3xl shadow-2xl shadow-black/30 border border-white/10">
            {/* YouTube-themed Aurora Background */}
            {isPlaying && shouldAnimate && (
              <motion.div
                className="absolute inset-0 opacity-[0.15]"
                animate={{
                  background: [
                    'radial-gradient(circle at 0% 0%, #FF0000 0%, transparent 60%)',
                    'radial-gradient(circle at 100% 0%, #FF6B6B 0%, transparent 60%)',
                    'radial-gradient(circle at 100% 100%, #FF0000 0%, transparent 60%)',
                    'radial-gradient(circle at 0% 100%, #CC0000 0%, transparent 60%)',
                    'radial-gradient(circle at 0% 0%, #FF0000 0%, transparent 60%)',
                  ],
                }}
                transition={{
                  duration: 10,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
            )}

            {/* Subtle gradient overlay when playing */}
            {isPlaying && (
              <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 via-transparent to-red-500/5" />
            )}

            {/* Waveform Background */}
            <div className="absolute inset-0 opacity-5">
              <WaveformVisualizer isPlaying={isPlaying} />
            </div>

            {/* Content */}
            <div className="relative px-4 py-3">
              <div className="flex items-center gap-3">
                {/* Enhanced Thumbnail with ultra-smooth animations */}
                <motion.div
                  className="relative w-14 h-14 shrink-0 rounded-xl overflow-visible"
                  whileHover={{ scale: 1.08 }}
                  animate={
                    isPlaying && shouldAnimate
                      ? {
                          scale: [1, 1.02, 1],
                        }
                      : {}
                  }
                  transition={{
                    scale: {
                      duration: 3,
                      repeat: Infinity,
                      ease: [0.4, 0, 0.2, 1], // Smooth cubic-bezier
                    },
                    hover: {
                      type: 'spring',
                      stiffness: 400,
                      damping: 25,
                    },
                  }}
                >
                  {/* Multi-layer glow rings when playing */}
                  {isPlaying && shouldAnimate && (
                    <>
                      {/* Outer glow ring */}
                      <motion.div
                        className="absolute inset-0 rounded-xl"
                        animate={{
                          scale: [1, 1.4, 1],
                          opacity: [0, 0.3, 0],
                        }}
                        transition={{
                          duration: 2.5,
                          repeat: Infinity,
                          ease: 'easeOut',
                        }}
                        style={{
                          background: 'radial-gradient(circle, rgba(255,0,0,0.6) 0%, transparent 70%)',
                          filter: 'blur(15px)',
                        }}
                      />

                      {/* Middle glow ring */}
                      <motion.div
                        className="absolute inset-0 rounded-xl"
                        animate={{
                          scale: [1, 1.25, 1],
                          opacity: [0, 0.4, 0],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: 'easeOut',
                          delay: 0.3,
                        }}
                        style={{
                          background: 'radial-gradient(circle, rgba(255,0,0,0.8) 0%, transparent 60%)',
                          filter: 'blur(10px)',
                        }}
                      />
                    </>
                  )}

                  {/* Main thumbnail container */}
                  <div className="relative w-full h-full rounded-xl overflow-hidden bg-black/50 shadow-lg">
                    {thumbnailUrl ? (
                      <motion.img
                        src={thumbnailUrl}
                        alt={title}
                        className="w-full h-full object-cover"
                        animate={
                          isPlaying && shouldAnimate
                            ? {
                                scale: [1.05, 1.08, 1.05],
                                rotate: [0, 1, 0, -1, 0],
                              }
                            : {
                                scale: 1,
                                filter: 'grayscale(20%)',
                              }
                        }
                        transition={{
                          scale: {
                            duration: 4,
                            repeat: Infinity,
                            ease: 'easeInOut',
                          },
                          rotate: {
                            duration: 5,
                            repeat: Infinity,
                            ease: 'easeInOut',
                          },
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-red-500/20 to-red-600/20">
                        <motion.svg
                          className="w-6 h-6 text-red-500/60"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          animate={
                            isPlaying && shouldAnimate
                              ? {
                                  scale: [1, 1.1, 1],
                                  rotate: [0, 5, 0, -5, 0],
                                }
                              : {}
                          }
                          transition={{
                            duration: 3,
                            repeat: Infinity,
                            ease: 'easeInOut',
                          }}
                        >
                          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                        </motion.svg>
                      </div>
                    )}

                    {/* Enhanced audio visualization overlay */}
                    {isPlaying && (
                      <>
                        {/* Gradient waveform layer */}
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-t from-red-500/40 via-red-500/20 to-transparent"
                          animate={
                            shouldAnimate
                              ? {
                                  opacity: [0.6, 0.9, 0.6],
                                }
                              : {}
                          }
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: 'easeInOut',
                          }}
                        >
                          <WaveformVisualizer isPlaying={isPlaying} className="h-full opacity-80" />
                        </motion.div>

                        {/* Smooth pulsing border */}
                        <motion.div
                          className="absolute inset-0 rounded-xl border-2 border-red-500/70 pointer-events-none"
                          animate={
                            shouldAnimate
                              ? {
                                  opacity: [0.6, 1, 0.6],
                                  scale: [1, 1.01, 1],
                                  boxShadow: [
                                    '0 0 15px rgba(255,0,0,0.3)',
                                    '0 0 25px rgba(255,0,0,0.5)',
                                    '0 0 15px rgba(255,0,0,0.3)',
                                  ],
                                }
                              : {}
                          }
                          transition={{
                            duration: 2.5,
                            repeat: Infinity,
                            ease: [0.4, 0, 0.2, 1],
                          }}
                        />

                        {/* Animated LIVE badge */}
                        <motion.div
                          className="absolute top-1 right-1 px-1.5 py-0.5 rounded-md bg-red-500/95 backdrop-blur-sm flex items-center gap-1 shadow-lg"
                          initial={{ opacity: 0, scale: 0.8, y: -10 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          transition={{
                            type: 'spring',
                            stiffness: 500,
                            damping: 30,
                          }}
                        >
                          <motion.div
                            className="w-1.5 h-1.5 rounded-full bg-white shadow-sm"
                            animate={
                              shouldAnimate
                                ? {
                                    opacity: [1, 0.3, 1],
                                    scale: [1, 0.7, 1],
                                  }
                                : {}
                            }
                            transition={{
                              duration: 1.8,
                              repeat: Infinity,
                              ease: [0.4, 0, 0.2, 1],
                            }}
                          />
                          <span className="text-[8px] font-bold text-white leading-none tracking-wide">
                            LIVE
                          </span>
                        </motion.div>

                        {/* Audio pulse particles */}
                        {shouldAnimate && [0, 1, 2].map((i) => (
                          <motion.div
                            key={i}
                            className="absolute inset-0 rounded-xl border border-red-500/40 pointer-events-none"
                            animate={{
                              scale: [1, 1.5],
                              opacity: [0.6, 0],
                            }}
                            transition={{
                              duration: 2.5,
                              repeat: Infinity,
                              ease: 'easeOut',
                              delay: i * 0.8,
                            }}
                          />
                        ))}
                      </>
                    )}
                  </div>
                </motion.div>

                {/* Enhanced Track Info with better typography */}
                <div className="flex-1 min-w-0 space-y-1">
                  {/* Playing indicator */}
                  {isPlaying && (
                    <motion.div
                      className="flex items-center gap-1.5 mb-0.5"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                    >
                      <Radio className="w-3 h-3 text-red-500" />
                      <motion.span
                        className="text-[9px] font-bold uppercase tracking-wider text-red-500"
                        animate={
                          shouldAnimate
                            ? {
                                opacity: [0.7, 1, 0.7],
                              }
                            : {}
                        }
                        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                      >
                        Now Playing
                      </motion.span>
                    </motion.div>
                  )}

                  {/* Track title */}
                  <motion.p
                    className={cn(
                      "text-sm font-bold truncate leading-tight",
                      isPlaying ? "text-foreground" : "text-foreground/70"
                    )}
                    animate={
                      isPlaying && shouldAnimate
                        ? {
                            opacity: [1, 0.9, 1],
                          }
                        : {}
                    }
                    transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    {title}
                  </motion.p>

                  {/* Status subtitle - only show when paused */}
                  {!isPlaying && (
                    <p className="text-[10px] text-muted-foreground font-medium">
                      Paused
                    </p>
                  )}
                </div>

                {/* Controls */}
                <div className="flex items-center gap-1">
                  {/* Previous Button */}
                  {onPrevious && (
                    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                      <Button
                        variant="ghost"
                        size="icon"
                        className={cn(
                          "h-9 w-9 rounded-full transition-all duration-200",
                          isPlaying
                            ? "hover:bg-red-500/20 hover:text-red-500"
                            : "hover:bg-white/10"
                        )}
                        onClick={onPrevious}
                      >
                        <SkipBack className="h-4 w-4" />
                      </Button>
                    </motion.div>
                  )}

                  {/* Enhanced Play/Pause Button with YouTube branding */}
                  <motion.div
                    className="relative"
                    whileHover={{ scale: 1.12 }}
                    whileTap={{ scale: 0.92 }}
                    animate={
                      isPlaying && shouldAnimate
                        ? {
                            scale: [1, 1.03, 1],
                          }
                        : {}
                    }
                    transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    {/* Glow effect when playing */}
                    {isPlaying && shouldAnimate && (
                      <motion.div
                        className="absolute inset-0 rounded-full bg-red-500/30 blur-xl"
                        animate={{
                          scale: [1, 1.3, 1],
                          opacity: [0.3, 0.6, 0.3],
                        }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                      />
                    )}

                    <Button
                      variant="default"
                      size="icon"
                      className={cn(
                        'relative h-11 w-11 rounded-full shadow-xl transition-all duration-300',
                        isPlaying
                          ? 'bg-gradient-to-br from-red-500 via-red-600 to-red-700 hover:from-red-600 hover:via-red-700 hover:to-red-800 shadow-red-500/30'
                          : 'bg-gradient-to-br from-zinc-700 via-zinc-800 to-zinc-900 hover:from-zinc-600 hover:via-zinc-700 hover:to-zinc-800'
                      )}
                      onClick={onTogglePlay}
                    >
                      {isPlaying ? (
                        <Pause className="h-5 w-5 fill-current drop-shadow-lg" />
                      ) : (
                        <Play className="h-5 w-5 fill-current ml-0.5 drop-shadow-lg" />
                      )}
                    </Button>
                  </motion.div>

                  {/* Next Button */}
                  {onNext && (
                    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                      <Button
                        variant="ghost"
                        size="icon"
                        className={cn(
                          "h-9 w-9 rounded-full transition-all duration-200",
                          isPlaying
                            ? "hover:bg-red-500/20 hover:text-red-500"
                            : "hover:bg-white/10"
                        )}
                        onClick={onNext}
                      >
                        <SkipForward className="h-4 w-4" />
                      </Button>
                    </motion.div>
                  )}
                </div>

                {/* Enhanced Volume Control - Hidden on mobile */}
                <div className="hidden md:flex items-center gap-2.5 w-32">
                  <motion.div
                    animate={
                      isPlaying && shouldAnimate
                        ? {
                            scale: [1, 1.1, 1],
                          }
                        : {}
                    }
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    <Volume2
                      className={cn(
                        "h-4 w-4 shrink-0 transition-colors duration-300",
                        isPlaying ? "text-red-500" : "text-muted-foreground"
                      )}
                    />
                  </motion.div>
                  <Slider
                    value={[volume]}
                    min={0}
                    max={100}
                    step={1}
                    onValueChange={(v) => onVolumeChange(v[0])}
                    className={cn(
                      "flex-1 transition-all duration-300",
                      isPlaying && "[&_[role=slider]]:border-red-500"
                    )}
                  />
                </div>
              </div>
            </div>

            {/* Enhanced animated bottom progress bar */}
            {isPlaying && shouldAnimate && (
              <>
                {/* Main progress bar */}
                <motion.div
                  className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 via-red-400 to-red-500 shadow-[0_0_10px_rgba(255,0,0,0.3)]"
                  animate={{
                    opacity: [0.4, 0.9, 0.4],
                    backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                  }}
                  transition={{
                    duration: 2.5,
                    repeat: Infinity,
                    ease: 'linear',
                  }}
                  style={{ backgroundSize: '200% 100%' }}
                />

                {/* Shimmer effect */}
                <motion.div
                  className="absolute bottom-0 left-0 h-1 w-32 bg-gradient-to-r from-transparent via-white/50 to-transparent blur-sm"
                  animate={{
                    x: ['-100%', '400%'],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'linear',
                  }}
                />
              </>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
