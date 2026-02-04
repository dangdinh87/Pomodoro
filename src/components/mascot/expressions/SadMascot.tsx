'use client';

import { motion, type Variants } from 'framer-motion';
import { BaseMascot, Nose, MASCOT_COLORS } from './BaseMascot';
import { useMascotStore } from '@/stores/mascot-store';

const droopVariants: Variants = {
  initial: { y: 0 },
  animate: {
    y: [0, 2, 0],
    transition: { repeat: Infinity, duration: 3, ease: 'easeInOut' },
  },
};

const tearVariants: Variants = {
  initial: { y: 0, opacity: 0 },
  animate: {
    y: [0, 15, 25],
    opacity: [0, 1, 0],
    transition: { repeat: Infinity, duration: 2, ease: 'easeIn' },
  },
};

export function SadMascot({ className }: { className?: string }) {
  const reducedMotion = useMascotStore((state) => state.reducedMotion);

  return (
    <BaseMascot className={className} bodyAnimation={reducedMotion ? undefined : droopVariants}>
      {/* Sad droopy eyes (half-closed, looking down) */}
      <ellipse cx="18" cy="18" rx="5" ry="3" fill="white" />
      <ellipse cx="42" cy="18" rx="5" ry="3" fill="white" />
      <ellipse cx="18" cy="19" rx="3" ry="2" fill={MASCOT_COLORS.details} />
      <ellipse cx="42" cy="19" rx="3" ry="2" fill={MASCOT_COLORS.details} />

      {/* Watery eye shine */}
      <circle cx="20" cy="17" r="1" fill="white" />
      <circle cx="44" cy="17" r="1" fill="white" />

      {/* Sad drooping eyebrows */}
      <path
        d="M10 14 Q17 8 24 14"
        stroke={MASCOT_COLORS.mainFur}
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M36 14 Q43 8 50 14"
        stroke={MASCOT_COLORS.mainFur}
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
      />

      {/* Nose */}
      <Nose />

      {/* Sad frown */}
      <path
        d="M20 44 Q30 36 40 44"
        stroke={MASCOT_COLORS.details}
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
      />

      {/* Tear drops */}
      <motion.ellipse
        cx="24"
        cy="24"
        rx="2"
        ry="3"
        fill="#87CEEB"
        variants={reducedMotion ? undefined : tearVariants}
        initial="initial"
        animate="animate"
      />
      <motion.ellipse
        cx="48"
        cy="24"
        rx="2"
        ry="3"
        fill="#87CEEB"
        variants={reducedMotion ? undefined : tearVariants}
        initial="initial"
        animate="animate"
        style={{ animationDelay: '0.5s' }}
      />

      {/* Droopy ears effect handled by ear transform in base */}

      {/* Tucked sad tail */}
      <path d="M88 85 Q90 88 87 92 Q83 90 85 86" fill={MASCOT_COLORS.mainFur} />
    </BaseMascot>
  );
}
