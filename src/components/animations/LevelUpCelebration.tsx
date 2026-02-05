'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { Confetti } from './Confetti';
import { levelUpVariants, glowRingVariants, ANIMATION_DURATIONS } from '@/config/animations';
import { getLevelTitle } from '@/config/gamification';

interface LevelUpCelebrationProps {
  show: boolean;
  level: number;
  onComplete: () => void;
}

export function LevelUpCelebration({ show, level, onComplete }: LevelUpCelebrationProps) {
  const reducedMotion = useReducedMotion();
  const title = getLevelTitle(level, 'vi');

  return (
    <AnimatePresence>
      {show && (
        <>
          <Confetti trigger={show} intensity="high" />
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Semi-transparent backdrop */}
            <motion.div
              className="absolute inset-0 bg-black/30"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />

            {/* Celebration content */}
            <motion.div
              className="relative text-center z-10"
              variants={levelUpVariants}
              initial={reducedMotion ? { opacity: 0 } : 'initial'}
              animate={reducedMotion ? { opacity: 1 } : 'animate'}
              exit="exit"
              transition={{ duration: ANIMATION_DURATIONS.slow }}
              onAnimationComplete={() => {
                // Auto-close after animation
                setTimeout(onComplete, ANIMATION_DURATIONS.celebration * 1000);
              }}
            >
              {/* Level number */}
              <motion.div
                className="text-7xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent"
                animate={reducedMotion ? {} : { scale: [1, 1.2, 1] }}
                transition={{ duration: 0.3, delay: 0.3 }}
              >
                Level {level}
              </motion.div>

              {/* Level title */}
              <motion.p
                className="text-xl text-foreground mt-2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                {title}
              </motion.p>

              {/* Congratulations text */}
              <motion.p
                className="text-muted-foreground mt-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
              >
                Chúc mừng! Tiếp tục cố gắng nhé!
              </motion.p>

              {/* Glow ring effect */}
              {!reducedMotion && (
                <motion.div
                  className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full border-4 border-primary"
                  variants={glowRingVariants}
                  initial="initial"
                  animate="animate"
                  transition={{ duration: 1, ease: 'easeOut' }}
                />
              )}
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
