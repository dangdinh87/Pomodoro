'use client';

import { motion, type Variants } from 'framer-motion';
import { BaseMascot, Nose, Blush, MASCOT_COLORS } from './BaseMascot';
import { useMascotStore } from '@/stores/mascot-store';

const jumpVariants: Variants = {
  initial: { y: 0, rotate: 0 },
  animate: {
    y: [-5, 0, -5],
    rotate: [-2, 2, -2],
    transition: { repeat: Infinity, duration: 0.4, ease: 'easeInOut' },
  },
};

const sparkleVariants: Variants = {
  initial: { scale: 0, opacity: 0 },
  animate: {
    scale: [0, 1.2, 0],
    opacity: [0, 1, 0],
    transition: { repeat: Infinity, duration: 0.8, ease: 'easeOut' },
  },
};

export function ExcitedMascot({ className }: { className?: string }) {
  const reducedMotion = useMascotStore((state) => state.reducedMotion);

  return (
    <BaseMascot className={className} bodyAnimation={reducedMotion ? undefined : jumpVariants}>
      {/* Wide excited eyes (large circles) */}
      <circle cx="18" cy="16" r="7" fill="white" />
      <circle cx="42" cy="16" r="7" fill="white" />
      <circle cx="18" cy="16" r="5" fill={MASCOT_COLORS.details} />
      <circle cx="42" cy="16" r="5" fill={MASCOT_COLORS.details} />

      {/* Star sparkle in eyes */}
      <circle cx="20" cy="14" r="2" fill="white" />
      <circle cx="44" cy="14" r="2" fill="white" />

      {/* Raised excited eyebrows */}
      <path
        d="M8 4 Q18 -2 26 6"
        stroke={MASCOT_COLORS.mainFur}
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M52 4 Q42 -2 34 6"
        stroke={MASCOT_COLORS.mainFur}
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
      />

      {/* Blush (intense) */}
      <Blush opacity={0.8} />

      {/* Nose */}
      <Nose />

      {/* Open excited mouth */}
      <ellipse cx="30" cy="40" rx="10" ry="8" fill={MASCOT_COLORS.details} />
      {/* Tongue */}
      <ellipse cx="30" cy="44" rx="6" ry="4" fill="#E57373" />

      {/* Sparkles around head */}
      <motion.g
        variants={reducedMotion ? undefined : sparkleVariants}
        initial="initial"
        animate="animate"
      >
        <polygon points="-5,5 -3,0 -1,5 -6,2 0,2" fill="#FFD700" transform="translate(0, -15)" />
      </motion.g>
      <motion.g
        variants={reducedMotion ? undefined : sparkleVariants}
        initial="initial"
        animate="animate"
        style={{ animationDelay: '0.3s' }}
      >
        <polygon points="55,0 57,-5 59,0 54,-3 60,-3" fill="#FFD700" transform="translate(0, -10)" />
      </motion.g>
      <motion.g
        variants={reducedMotion ? undefined : sparkleVariants}
        initial="initial"
        animate="animate"
        style={{ animationDelay: '0.6s' }}
      >
        <polygon points="65,15 67,10 69,15 64,12 70,12" fill="#FFD700" />
      </motion.g>

      {/* Excited wagging tail */}
      <motion.path
        d="M95 75 Q120 55 110 78 Q105 95 88 85"
        fill={MASCOT_COLORS.mainFur}
        animate={reducedMotion ? {} : { rotate: [-20, 20, -20] }}
        transition={{ repeat: Infinity, duration: 0.3, ease: 'easeInOut' }}
        style={{ transformOrigin: '95px 80px' }}
      />
    </BaseMascot>
  );
}
