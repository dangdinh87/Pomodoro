'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { xpFlyVariants } from '@/config/animations';

interface XPFlyNumberProps {
  amount: number;
  show: boolean;
  onComplete?: () => void;
  className?: string;
}

export function XPFlyNumber({ amount, show, onComplete, className }: XPFlyNumberProps) {
  const reducedMotion = useReducedMotion();

  if (amount <= 0) return null;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className={className}
          variants={xpFlyVariants}
          initial={reducedMotion ? { opacity: 1 } : 'initial'}
          animate={reducedMotion ? { opacity: 0 } : 'animate'}
          exit={{ opacity: 0 }}
          onAnimationComplete={onComplete}
        >
          <span className="text-lg font-bold text-primary">
            +{amount} XP
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

interface CoinFlyNumberProps {
  amount: number;
  show: boolean;
  onComplete?: () => void;
  className?: string;
}

export function CoinFlyNumber({ amount, show, onComplete, className }: CoinFlyNumberProps) {
  const reducedMotion = useReducedMotion();

  if (amount <= 0) return null;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className={className}
          variants={xpFlyVariants}
          initial={reducedMotion ? { opacity: 1 } : 'initial'}
          animate={reducedMotion ? { opacity: 0 } : 'animate'}
          exit={{ opacity: 0 }}
          onAnimationComplete={onComplete}
        >
          <span className="text-lg font-bold text-yellow-500">
            +{amount} coins
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
