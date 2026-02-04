'use client';

import { motion, type Variants } from 'framer-motion';
import { BaseMascot, Nose, Blush, MASCOT_COLORS } from './BaseMascot';
import { useMascotStore } from '@/stores/mascot-store';

const waveVariants: Variants = {
  initial: { rotate: 0 },
  animate: {
    rotate: [-15, 15, -15],
    transition: { repeat: Infinity, duration: 0.5, ease: 'easeInOut' },
  },
};

export function EncouragingMascot({ className }: { className?: string }) {
  const reducedMotion = useMascotStore((state) => state.reducedMotion);

  return (
    <BaseMascot className={className}>
      {/* Friendly open eyes */}
      <ellipse cx="18" cy="16" rx="5" ry="5" fill={MASCOT_COLORS.details} />
      <ellipse cx="42" cy="16" rx="5" ry="5" fill={MASCOT_COLORS.details} />

      {/* Eye shine (larger for encouraging look) */}
      <circle cx="20" cy="14" r="2" fill="white" />
      <circle cx="44" cy="14" r="2" fill="white" />

      {/* Raised friendly eyebrows */}
      <path
        d="M10 6 Q17 2 24 6"
        stroke={MASCOT_COLORS.mainFur}
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M36 6 Q43 2 50 6"
        stroke={MASCOT_COLORS.mainFur}
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
      />

      {/* Blush */}
      <Blush opacity={0.5} />

      {/* Nose */}
      <Nose />

      {/* Encouraging smile */}
      <path
        d="M18 36 Q30 46 42 36"
        stroke={MASCOT_COLORS.details}
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
      />

      {/* Paw up (thumbs up gesture) - positioned to right side */}
      <motion.g
        variants={reducedMotion ? undefined : waveVariants}
        initial="initial"
        animate="animate"
        style={{ transformOrigin: '85px 70px' }}
      >
        {/* Paw */}
        <ellipse cx="95" cy="55" rx="10" ry="8" fill={MASCOT_COLORS.mainFur} />
        {/* Paw pad */}
        <ellipse cx="95" cy="56" rx="6" ry="5" fill={MASCOT_COLORS.chestAccent} />
        {/* Paw beans */}
        <circle cx="92" cy="53" r="2" fill={MASCOT_COLORS.blush} />
        <circle cx="98" cy="53" r="2" fill={MASCOT_COLORS.blush} />
        <circle cx="95" cy="58" r="2.5" fill={MASCOT_COLORS.blush} />
      </motion.g>

      {/* Tail */}
      <path d="M95 75 Q110 65 105 80 Q100 90 90 85" fill={MASCOT_COLORS.mainFur} />
    </BaseMascot>
  );
}
