'use client';

import { motion } from 'framer-motion';
import { Flame } from 'lucide-react';
import { useGamificationStore } from '@/stores/gamification-store';
import { getStreakStage, STREAK_STAGES } from '@/config/gamification';
import { cn } from '@/lib/utils';

interface StreakFlameProps {
  size?: 'sm' | 'md' | 'lg';
  showCount?: boolean;
  className?: string;
}

const flameVariants = {
  spark: {
    scale: [1, 1.05, 1],
    transition: { repeat: Infinity, duration: 2 },
  },
  small: {
    scale: [1, 1.1, 1],
    transition: { repeat: Infinity, duration: 1.5 },
  },
  medium: {
    scale: [1, 1.15, 1],
    rotate: [-2, 2, -2],
    transition: { repeat: Infinity, duration: 1 },
  },
  large: {
    scale: [1, 1.2, 1],
    rotate: [-3, 3, -3],
    transition: { repeat: Infinity, duration: 0.8 },
  },
  inferno: {
    scale: [1, 1.25, 1],
    rotate: [-5, 5, -5],
    transition: { repeat: Infinity, duration: 0.6 },
  },
};

const sizeMap = {
  sm: { icon: 'w-5 h-5', text: 'text-sm', wrapper: 'gap-1' },
  md: { icon: 'w-8 h-8', text: 'text-lg', wrapper: 'gap-2' },
  lg: { icon: 'w-12 h-12', text: 'text-2xl', wrapper: 'gap-3' },
};

export function StreakFlame({
  size = 'md',
  showCount = true,
  className,
}: StreakFlameProps) {
  const { currentStreak } = useGamificationStore();
  const stage = getStreakStage(currentStreak);
  const config = STREAK_STAGES[stage];
  const styles = sizeMap[size];

  const shouldFill = stage !== 'spark';

  return (
    <div
      className={cn(
        'relative flex items-center',
        styles.wrapper,
        className
      )}
    >
      <motion.div
        variants={flameVariants}
        animate={stage}
        className="relative"
      >
        <Flame
          className={cn(styles.icon, 'drop-shadow-lg')}
          style={{ color: config.color }}
          fill={shouldFill ? config.color : 'none'}
          strokeWidth={shouldFill ? 1 : 2}
        />
        {/* Glow effect for higher stages */}
        {(stage === 'large' || stage === 'inferno') && (
          <motion.div
            className="absolute inset-0 blur-md opacity-50"
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ repeat: Infinity, duration: 1 }}
          >
            <Flame
              className={styles.icon}
              style={{ color: config.color }}
              fill={config.color}
            />
          </motion.div>
        )}
      </motion.div>
      {showCount && (
        <span className={cn('font-bold tabular-nums', styles.text)}>
          {currentStreak}
        </span>
      )}
    </div>
  );
}
