'use client';

import { motion, type Variants } from 'framer-motion';
import { BaseMascot, Nose, MASCOT_COLORS } from './BaseMascot';
import { useMascotStore } from '@/stores/mascot-store';

const trembleVariants: Variants = {
  initial: { x: 0 },
  animate: {
    x: [-1, 1, -1, 1, 0],
    transition: { repeat: Infinity, duration: 0.5, ease: 'easeInOut' },
  },
};

const earDroopVariants: Variants = {
  initial: { rotate: 0 },
  animate: {
    rotate: 15,
    transition: { duration: 0.3 },
  },
};

const sweatDropVariants: Variants = {
  initial: { y: 0, opacity: 1 },
  animate: {
    y: [0, 5, 10],
    opacity: [1, 1, 0],
    transition: { repeat: Infinity, duration: 1.5, ease: 'easeIn' },
  },
};

export function WorriedMascot({ className }: { className?: string }) {
  const reducedMotion = useMascotStore((state) => state.reducedMotion);

  return (
    <BaseMascot
      className={className}
      bodyAnimation={reducedMotion ? undefined : trembleVariants}
      earAnimation={reducedMotion ? undefined : earDroopVariants}
    >
      {/* Worried eyes (looking up) */}
      <ellipse cx="18" cy="18" rx="5" ry="6" fill="white" />
      <ellipse cx="42" cy="18" rx="5" ry="6" fill="white" />
      <ellipse cx="18" cy="16" rx="4" ry="4" fill={MASCOT_COLORS.details} />
      <ellipse cx="42" cy="16" r="4" fill={MASCOT_COLORS.details} />

      {/* Eye shine (upper) */}
      <circle cx="19" cy="14" r="1.5" fill="white" />
      <circle cx="43" cy="14" r="1.5" fill="white" />

      {/* Worried eyebrows (angled up in center) */}
      <path
        d="M10 10 Q17 6 24 10"
        stroke={MASCOT_COLORS.mainFur}
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M36 10 Q43 6 50 10"
        stroke={MASCOT_COLORS.mainFur}
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
      />

      {/* Nose */}
      <Nose />

      {/* Worried frown */}
      <path
        d="M22 42 Q30 36 38 42"
        stroke={MASCOT_COLORS.details}
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
      />

      {/* Sweat drop */}
      <motion.path
        d="M55 8 Q58 12 55 16 Q52 12 55 8"
        fill="#87CEEB"
        variants={reducedMotion ? undefined : sweatDropVariants}
        initial="initial"
        animate="animate"
      />

      {/* Tucked tail (nervous) */}
      <path d="M90 82 Q95 85 92 90 Q88 92 85 88" fill={MASCOT_COLORS.mainFur} />
    </BaseMascot>
  );
}
