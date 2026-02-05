'use client';

import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import { useGamificationStore } from '@/stores/gamification-store';
import { getLevelTitle } from '@/config/gamification';
import { cn } from '@/lib/utils';

interface LevelBadgeProps {
  size?: 'sm' | 'md' | 'lg';
  showTitle?: boolean;
  className?: string;
}

const sizeStyles = {
  sm: {
    wrapper: 'w-8 h-8',
    text: 'text-xs',
    icon: 'w-3 h-3',
  },
  md: {
    wrapper: 'w-12 h-12',
    text: 'text-sm',
    icon: 'w-4 h-4',
  },
  lg: {
    wrapper: 'w-16 h-16',
    text: 'text-base',
    icon: 'w-5 h-5',
  },
};

export function LevelBadge({
  size = 'md',
  showTitle = false,
  className,
}: LevelBadgeProps) {
  const { level } = useGamificationStore();
  const title = getLevelTitle(level, 'vi');
  const styles = sizeStyles[size];

  // Color progression based on level tiers
  const getBadgeColor = (lvl: number) => {
    if (lvl >= 51) return 'from-purple-500 to-pink-500'; // Legendary
    if (lvl >= 31) return 'from-yellow-500 to-orange-500'; // Master
    if (lvl >= 21) return 'from-blue-500 to-cyan-500'; // Pro
    if (lvl >= 11) return 'from-green-500 to-emerald-500'; // Warrior
    if (lvl >= 6) return 'from-teal-500 to-green-500'; // Apprentice
    return 'from-slate-400 to-slate-500'; // Rookie
  };

  return (
    <div className={cn('flex flex-col items-center gap-1', className)}>
      <motion.div
        className={cn(
          'relative rounded-full flex items-center justify-center',
          'bg-gradient-to-br shadow-lg',
          getBadgeColor(level),
          styles.wrapper
        )}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <span className={cn('font-bold text-white', styles.text)}>
          {level}
        </span>
        {/* Decorative stars for milestone levels */}
        {level >= 10 && (
          <Star
            className={cn(
              'absolute -top-1 -right-1 text-yellow-400 fill-yellow-400',
              styles.icon
            )}
          />
        )}
      </motion.div>
      {showTitle && (
        <span className="text-xs text-muted-foreground text-center">
          {title}
        </span>
      )}
    </div>
  );
}
