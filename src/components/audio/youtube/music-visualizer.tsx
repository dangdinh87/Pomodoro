'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface MusicVisualizerProps {
  isPlaying: boolean;
  barCount?: number;
  className?: string;
}

export function MusicVisualizer({ isPlaying, barCount = 5, className = '' }: MusicVisualizerProps) {
  const [shouldAnimate, setShouldAnimate] = useState(true);

  // Respect prefers-reduced-motion
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setShouldAnimate(!mediaQuery.matches);

    const handleChange = () => setShouldAnimate(!mediaQuery.matches);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return (
    <div className={`flex items-center justify-center gap-0.5 h-full ${className}`}>
      {Array.from({ length: barCount }).map((_, i) => (
        <motion.div
          key={i}
          className="w-0.5 bg-gradient-to-t from-primary via-primary/80 to-primary/40 rounded-full"
          initial={{ height: '20%' }}
          animate={
            isPlaying && shouldAnimate
              ? {
                height: ['20%', '100%', '30%', '90%', '20%'], // More dramatic changes
                opacity: [0.6, 1, 0.7, 1, 0.6], // Brighter
              }
              : { height: '20%', opacity: 0.5 }
          }
          transition={{
            duration: 0.6 + i * 0.1, // Faster duration (was 1 + ...)
            repeat: Infinity,
            ease: 'easeInOut',
            delay: i * 0.05, // Shorter delay
          }}
        />
      ))}
    </div>
  );
}

interface WaveformVisualizerProps {
  isPlaying: boolean;
  className?: string;
}

export function WaveformVisualizer({ isPlaying, className = '' }: WaveformVisualizerProps) {
  const [shouldAnimate, setShouldAnimate] = useState(true);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setShouldAnimate(!mediaQuery.matches);
    const handleChange = () => setShouldAnimate(!mediaQuery.matches);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const bars = Array.from({ length: 40 });

  return (
    <div className={`flex items-center justify-center gap-[2px] h-full overflow-hidden ${className}`}>
      {bars.map((_, i) => {
        const delay = (i * 0.05) % 1.5;
        const duration = 0.8 + (i % 5) * 0.1;
        const heights = ['30%', '80%', '50%', '90%', '40%', '70%', '30%'];

        return (
          <motion.div
            key={i}
            className="w-[2px] bg-gradient-to-t from-primary/40 via-primary to-primary/60 rounded-full"
            initial={{ height: '30%' }}
            animate={
              isPlaying && shouldAnimate
                ? {
                  height: heights,
                  opacity: [0.4, 1, 0.6, 1, 0.5, 0.8, 0.4],
                }
                : { height: '30%', opacity: 0.3 }
            }
            transition={{
              duration,
              repeat: Infinity,
              ease: 'easeInOut',
              delay,
            }}
          />
        );
      })}
    </div>
  );
}
