'use client';

import { motion } from 'framer-motion';
import { useGamificationStore } from '@/stores/gamification-store';
import { getLevelTitle } from '@/config/gamification';
import { cn } from '@/lib/utils';

interface XPProgressProps {
  showLabel?: boolean;
  showLevel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function XPProgress({
  showLabel = true,
  showLevel = true,
  size = 'md',
  className,
}: XPProgressProps) {
  const { level, currentXP, xpForNextLevel } = useGamificationStore();
  const progress = (currentXP / xpForNextLevel) * 100;
  const title = getLevelTitle(level, 'vi');

  const sizeStyles = {
    sm: 'h-1.5',
    md: 'h-2',
    lg: 'h-3',
  };

  return (
    <div className={cn('space-y-1', className)}>
      {(showLabel || showLevel) && (
        <div className="flex justify-between items-center text-sm">
          {showLevel && (
            <span className="font-medium">
              Lv.{level} - {title}
            </span>
          )}
          {showLabel && (
            <span className="text-muted-foreground">
              {currentXP}/{xpForNextLevel} XP
            </span>
          )}
        </div>
      )}
      <div
        className={cn(
          'w-full bg-muted rounded-full overflow-hidden',
          sizeStyles[size]
        )}
      >
        <motion.div
          className="h-full bg-gradient-to-r from-primary to-primary/80 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}
