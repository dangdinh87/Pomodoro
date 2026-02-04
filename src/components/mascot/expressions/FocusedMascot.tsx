'use client';

import { motion, type Variants } from 'framer-motion';
import { BaseMascot, Nose, MASCOT_COLORS } from './BaseMascot';
import { useMascotStore } from '@/stores/mascot-store';

const pulseVariants: Variants = {
  initial: { scale: 1 },
  animate: {
    scale: [1, 1.02, 1],
    transition: { repeat: Infinity, duration: 2, ease: 'easeInOut' },
  },
};

export function FocusedMascot({ className }: { className?: string }) {
  const reducedMotion = useMascotStore((state) => state.reducedMotion);

  return (
    <BaseMascot className={className} bodyAnimation={reducedMotion ? undefined : pulseVariants}>
      {/* Determined squinting eyes */}
      <ellipse cx="18" cy="16" rx="6" ry="4" fill={MASCOT_COLORS.details} />
      <ellipse cx="42" cy="16" rx="6" ry="4" fill={MASCOT_COLORS.details} />

      {/* Eye shine */}
      <circle cx="20" cy="15" r="1.5" fill="white" />
      <circle cx="44" cy="15" r="1.5" fill="white" />

      {/* Determined eyebrows (angled down toward center) */}
      <motion.path
        d="M10 8 L24 12"
        stroke={MASCOT_COLORS.mainFur}
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
        animate={reducedMotion ? {} : { y: [0, -0.5, 0] }}
        transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
      />
      <motion.path
        d="M50 8 L36 12"
        stroke={MASCOT_COLORS.mainFur}
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
        animate={reducedMotion ? {} : { y: [0, -0.5, 0] }}
        transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
      />

      {/* Nose */}
      <Nose />

      {/* Firm determined line mouth */}
      <path
        d="M22 38 L38 38"
        stroke={MASCOT_COLORS.details}
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
      />

      {/* Static tail */}
      <path d="M95 75 Q110 65 105 80 Q100 90 90 85" fill={MASCOT_COLORS.mainFur} />
    </BaseMascot>
  );
}
