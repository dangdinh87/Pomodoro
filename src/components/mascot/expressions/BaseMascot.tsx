'use client';

import { motion, type Variants } from 'framer-motion';
import { ReactNode } from 'react';
import { useMascotStore } from '@/stores/mascot-store';

interface BaseMascotProps {
  children: ReactNode;
  className?: string;
  bodyAnimation?: Variants;
  earAnimation?: Variants;
}

// Studie the Shiba Inu color palette
export const MASCOT_COLORS = {
  mainFur: '#FFB347', // warm orange-tan
  chestAccent: '#FFF5E6', // cream
  details: '#1C1917', // eyes, nose
  blush: '#FFCBA4', // cheeks when happy
  innerEar: '#FFCBA4', // inner ear pink
} as const;

// Default subtle idle animation
const defaultBodyAnimation: Variants = {
  initial: { scale: 0.95, opacity: 0 },
  animate: {
    scale: 1,
    opacity: 1,
    transition: { duration: 0.3, ease: 'easeOut' },
  },
};

export function BaseMascot({
  children,
  className,
  bodyAnimation = defaultBodyAnimation,
  earAnimation,
}: BaseMascotProps) {
  const reducedMotion = useMascotStore((state) => state.reducedMotion);

  return (
    <motion.svg
      viewBox="0 0 120 120"
      className={className}
      variants={reducedMotion ? undefined : bodyAnimation}
      initial="initial"
      animate="animate"
    >
      {/* Body - shared across expressions */}
      <g id="body">
        {/* Main body */}
        <ellipse cx="60" cy="85" rx="35" ry="25" fill={MASCOT_COLORS.mainFur} />
        {/* Chest/belly accent */}
        <ellipse cx="60" cy="82" rx="25" ry="18" fill={MASCOT_COLORS.chestAccent} />
      </g>

      {/* Head */}
      <g id="head">
        {/* Main head shape */}
        <ellipse cx="60" cy="50" rx="38" ry="32" fill={MASCOT_COLORS.mainFur} />
        {/* Face mask (lighter area) */}
        <path
          d="M60 30 Q75 45 70 65 Q60 75 50 65 Q45 45 60 30"
          fill={MASCOT_COLORS.chestAccent}
        />
      </g>

      {/* Ears */}
      <motion.g
        id="ears"
        variants={reducedMotion ? undefined : earAnimation}
        initial="initial"
        animate="animate"
      >
        {/* Left ear */}
        <path d="M25 35 L35 12 L50 40 Z" fill={MASCOT_COLORS.mainFur} />
        <path d="M30 33 L37 17 L47 38 Z" fill={MASCOT_COLORS.innerEar} />
        {/* Right ear */}
        <path d="M95 35 L85 12 L70 40 Z" fill={MASCOT_COLORS.mainFur} />
        <path d="M90 33 L83 17 L73 38 Z" fill={MASCOT_COLORS.innerEar} />
      </motion.g>

      {/* Face container - children render expressions here */}
      <g id="face" transform="translate(30, 35)">
        {children}
      </g>
    </motion.svg>
  );
}

// Export common face elements for reuse
export function Nose() {
  return <ellipse cx="30" cy="28" rx="5" ry="4" fill={MASCOT_COLORS.details} />;
}

export function Blush({ opacity = 0.6 }: { opacity?: number }) {
  return (
    <>
      <circle cx="8" cy="30" r="6" fill={MASCOT_COLORS.blush} opacity={opacity} />
      <circle cx="52" cy="30" r="6" fill={MASCOT_COLORS.blush} opacity={opacity} />
    </>
  );
}
