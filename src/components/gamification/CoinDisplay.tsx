'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Coins } from 'lucide-react';
import { useGamificationStore } from '@/stores/gamification-store';
import { cn } from '@/lib/utils';
import { useState, useEffect, useRef } from 'react';

interface CoinDisplayProps {
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  animate?: boolean;
  className?: string;
}

const sizeStyles = {
  sm: { icon: 'w-4 h-4', text: 'text-sm', gap: 'gap-1' },
  md: { icon: 'w-5 h-5', text: 'text-base', gap: 'gap-1.5' },
  lg: { icon: 'w-6 h-6', text: 'text-lg', gap: 'gap-2' },
};

export function CoinDisplay({
  size = 'md',
  showLabel = false,
  animate = true,
  className,
}: CoinDisplayProps) {
  const coins = useGamificationStore((state) => state.coins);
  const styles = sizeStyles[size];
  const prevCoins = useRef(coins);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (animate && coins > prevCoins.current) {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 600);
      return () => clearTimeout(timer);
    }
    prevCoins.current = coins;
  }, [coins, animate]);

  return (
    <div
      className={cn(
        'flex items-center',
        styles.gap,
        className
      )}
    >
      <motion.div
        animate={isAnimating ? { rotate: 360, scale: [1, 1.2, 1] } : {}}
        transition={{ duration: 0.6 }}
      >
        <Coins className={cn(styles.icon, 'text-yellow-500')} />
      </motion.div>
      <AnimatePresence mode="popLayout">
        <motion.span
          key={coins}
          className={cn('font-bold tabular-nums', styles.text)}
          initial={animate ? { y: -10, opacity: 0 } : false}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 10, opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {coins.toLocaleString()}
        </motion.span>
      </AnimatePresence>
      {showLabel && (
        <span className="text-muted-foreground text-sm">coins</span>
      )}
    </div>
  );
}
