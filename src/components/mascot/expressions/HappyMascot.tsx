'use client';

import { motion, type Variants } from 'framer-motion';
import { BaseMascot, Nose, Blush, MASCOT_COLORS } from './BaseMascot';
import { useMascotStore } from '@/stores/mascot-store';

const tailWagVariants: Variants = {
  initial: { rotate: -10 },
  animate: {
    rotate: [-10, 15, -10],
    transition: { repeat: Infinity, duration: 0.6, ease: 'easeInOut' },
  },
};

const bounceVariants: Variants = {
  initial: { y: 0 },
  animate: {
    y: [-2, 0, -2],
    transition: { repeat: Infinity, duration: 0.8, ease: 'easeInOut' },
  },
};

export function HappyMascot({ className }: { className?: string }) {
  const reducedMotion = useMascotStore((state) => state.reducedMotion);

  return (
    <BaseMascot className={className} bodyAnimation={reducedMotion ? undefined : bounceVariants}>
      {/* Happy curved eyes (closed, smiling) */}
      <path
        d="M15 18 Q20 13 25 18"
        stroke={MASCOT_COLORS.details}
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M35 18 Q40 13 45 18"
        stroke={MASCOT_COLORS.details}
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
      />

      {/* Blush cheeks */}
      <Blush opacity={0.7} />

      {/* Nose */}
      <Nose />

      {/* Happy smile */}
      <path
        d="M20 38 Q30 48 40 38"
        stroke={MASCOT_COLORS.details}
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
      />

      {/* Tail (animated) */}
      <motion.path
        d="M95 75 Q115 60 108 78 Q102 92 90 85"
        fill={MASCOT_COLORS.mainFur}
        variants={reducedMotion ? undefined : tailWagVariants}
        initial="initial"
        animate="animate"
        style={{ transformOrigin: '95px 80px' }}
      />
    </BaseMascot>
  );
}
