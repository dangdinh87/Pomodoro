'use client';

import { motion, type Variants } from 'framer-motion';
import { BaseMascot, Nose, MASCOT_COLORS } from './BaseMascot';
import { useMascotStore } from '@/stores/mascot-store';

const breathingVariants: Variants = {
  initial: { scale: 1 },
  animate: {
    scale: [1, 1.03, 1],
    transition: { repeat: Infinity, duration: 3, ease: 'easeInOut' },
  },
};

const zzzVariants: Variants = {
  initial: { opacity: 0, y: 0 },
  animate: {
    opacity: [0, 1, 1, 0],
    y: [0, -15],
    transition: { repeat: Infinity, duration: 2, ease: 'easeOut' },
  },
};

export function SleepyMascot({ className }: { className?: string }) {
  const reducedMotion = useMascotStore((state) => state.reducedMotion);

  return (
    <BaseMascot className={className} bodyAnimation={reducedMotion ? undefined : breathingVariants}>
      {/* Droopy closed eyes */}
      <path
        d="M12 18 Q18 22 24 18"
        stroke={MASCOT_COLORS.details}
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M36 18 Q42 22 48 18"
        stroke={MASCOT_COLORS.details}
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
      />

      {/* Droopy eyebrows */}
      <path
        d="M10 10 Q17 14 24 12"
        stroke={MASCOT_COLORS.mainFur}
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M50 10 Q43 14 36 12"
        stroke={MASCOT_COLORS.mainFur}
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
      />

      {/* Nose */}
      <Nose />

      {/* Yawning mouth (open oval) */}
      <ellipse cx="30" cy="40" rx="8" ry="6" fill={MASCOT_COLORS.details} />
      {/* Tongue hint */}
      <ellipse cx="30" cy="43" rx="5" ry="3" fill="#E57373" />

      {/* ZZZ animation */}
      <motion.text
        x="55"
        y="5"
        fill={MASCOT_COLORS.details}
        fontSize="10"
        fontWeight="bold"
        variants={reducedMotion ? undefined : zzzVariants}
        initial="initial"
        animate="animate"
      >
        z
      </motion.text>
      <motion.text
        x="62"
        y="-2"
        fill={MASCOT_COLORS.details}
        fontSize="12"
        fontWeight="bold"
        variants={reducedMotion ? undefined : zzzVariants}
        initial="initial"
        animate="animate"
        style={{ animationDelay: '0.3s' }}
      >
        Z
      </motion.text>
      <motion.text
        x="70"
        y="-10"
        fill={MASCOT_COLORS.details}
        fontSize="14"
        fontWeight="bold"
        variants={reducedMotion ? undefined : zzzVariants}
        initial="initial"
        animate="animate"
        style={{ animationDelay: '0.6s' }}
      >
        Z
      </motion.text>

      {/* Relaxed tail (curled, not animated) */}
      <path d="M95 80 Q105 75 102 85 Q98 92 90 88" fill={MASCOT_COLORS.mainFur} />
    </BaseMascot>
  );
}
