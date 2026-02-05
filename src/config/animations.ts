import { type Variants } from 'framer-motion';

// =============================================================================
// ANIMATION DURATIONS
// =============================================================================

export const ANIMATION_DURATIONS = {
  fast: 0.15,
  normal: 0.3,
  slow: 0.5,
  celebration: 2,
} as const;

// =============================================================================
// ANIMATION EASINGS
// =============================================================================

export const ANIMATION_EASINGS = {
  bounce: [0.34, 1.56, 0.64, 1],
  smooth: [0.4, 0, 0.2, 1],
  spring: { type: 'spring' as const, stiffness: 300, damping: 20 },
} as const;

// =============================================================================
// BUTTON VARIANTS
// =============================================================================

export const buttonVariants: Variants = {
  initial: { y: 0 },
  hover: { y: -2 },
  tap: { y: 0, scale: 0.98 },
};

// =============================================================================
// CARD VARIANTS
// =============================================================================

export const cardVariants: Variants = {
  initial: { scale: 1 },
  hover: { scale: 1.01 },
};

// =============================================================================
// BADGE UNLOCK VARIANTS
// =============================================================================

export const badgeUnlockVariants: Variants = {
  initial: { scale: 0, rotate: -180 },
  animate: {
    scale: [0, 1.2, 1],
    rotate: 0,
    transition: { duration: 0.5, ease: 'easeOut' },
  },
};

// =============================================================================
// XP FLY VARIANTS
// =============================================================================

export const xpFlyVariants: Variants = {
  initial: { opacity: 1, y: 0 },
  animate: {
    opacity: 0,
    y: -30,
    transition: { duration: 1, ease: 'easeOut' },
  },
};

// =============================================================================
// COIN EARN VARIANTS
// =============================================================================

export const coinEarnVariants: Variants = {
  initial: { scale: 1, rotate: 0 },
  animate: {
    scale: [1, 1.3, 1],
    rotate: 360,
    transition: { duration: 0.6 },
  },
};

// =============================================================================
// MASCOT ANIMATION VARIANTS
// =============================================================================

export const mascotAnimations = {
  happy: {
    body: { y: [0, -8, 0] },
    tail: { rotate: [-10, 15, -10] },
    transition: { duration: 0.6, repeat: 2 },
  },
  focused: {
    body: { scale: [1, 1.02, 1] },
    eyes: { scaleY: [1, 0.7, 1] },
    transition: { duration: 2, repeat: Infinity },
  },
  encouraging: {
    paw: { rotate: [0, 15, 0, 15, 0] },
    body: { x: [0, 2, -2, 0] },
    transition: { duration: 0.8 },
  },
  sleepy: {
    body: { scale: [1, 1.03, 1] },
    eyes: { scaleY: [1, 0.2, 0.2, 1] },
    transition: { duration: 3, repeat: Infinity },
  },
  excited: {
    body: { y: [0, -15, 0], rotate: [-5, 5, -5, 5, 0] },
    transition: { duration: 0.5 },
  },
  worried: {
    body: { x: [-1, 1, -1, 1, 0] },
    sweat: { opacity: [0, 1] },
    transition: { duration: 0.3, repeat: 3 },
  },
  sad: {
    ears: { rotate: [0, -15] },
    body: { y: [0, 5] },
    transition: { duration: 0.5 },
  },
  celebrating: {
    body: { rotate: [0, 360], scale: [1, 1.1, 1] },
    transition: { duration: 1 },
  },
} as const;

// =============================================================================
// LEVEL UP VARIANTS
// =============================================================================

export const levelUpVariants: Variants = {
  initial: { scale: 0.5, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
  exit: { scale: 1.5, opacity: 0 },
};

export const glowRingVariants: Variants = {
  initial: { scale: 0.5, opacity: 1 },
  animate: { scale: 3, opacity: 0 },
};

// =============================================================================
// CONFETTI COLORS
// =============================================================================

export const CONFETTI_COLORS = ['#4ADE80', '#FB923C', '#2DD4BF', '#FBBF24', '#F472B6'] as const;
