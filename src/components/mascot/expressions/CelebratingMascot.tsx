'use client';

import { motion, type Variants } from 'framer-motion';
import { BaseMascot, Nose, Blush, MASCOT_COLORS } from './BaseMascot';
import { useMascotStore } from '@/stores/mascot-store';

const spinVariants: Variants = {
  initial: { rotate: 0, scale: 1 },
  animate: {
    rotate: [0, -5, 5, -5, 0],
    scale: [1, 1.05, 1, 1.05, 1],
    transition: { repeat: Infinity, duration: 0.8, ease: 'easeInOut' },
  },
};

const confettiVariants = (delay: number): Variants => ({
  initial: { y: -20, opacity: 0, rotate: 0 },
  animate: {
    y: [-20, 60],
    opacity: [0, 1, 1, 0],
    rotate: [0, 360],
    transition: {
      repeat: Infinity,
      duration: 2,
      delay,
      ease: 'linear',
    },
  },
});

const partyHatColors = ['#FF6B6B', '#4ECDC4', '#FFE66D', '#95E1D3'];

export function CelebratingMascot({ className }: { className?: string }) {
  const reducedMotion = useMascotStore((state) => state.reducedMotion);

  return (
    <BaseMascot className={className} bodyAnimation={reducedMotion ? undefined : spinVariants}>
      {/* Party hat */}
      <g transform="translate(15, -35)">
        {/* Hat cone */}
        <polygon points="15,-5 0,25 30,25" fill="#FF6B6B" />
        {/* Hat stripes */}
        <polygon points="15,-5 5,15 10,15" fill="#FFE66D" />
        <polygon points="15,-5 20,15 25,15" fill="#4ECDC4" />
        {/* Hat pom pom */}
        <circle cx="15" cy="-8" r="5" fill="#FFE66D" />
        {/* Hat band */}
        <rect x="0" y="22" width="30" height="4" fill="#4ECDC4" />
      </g>

      {/* Super excited eyes (stars!) */}
      <g transform="translate(18, 16)">
        <polygon points="0,-6 2,-2 6,-2 3,1 4,5 0,3 -4,5 -3,1 -6,-2 -2,-2" fill="#FFD700" />
      </g>
      <g transform="translate(42, 16)">
        <polygon points="0,-6 2,-2 6,-2 3,1 4,5 0,3 -4,5 -3,1 -6,-2 -2,-2" fill="#FFD700" />
      </g>

      {/* Raised celebration eyebrows */}
      <path
        d="M6 2 Q18 -4 26 4"
        stroke={MASCOT_COLORS.mainFur}
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M54 2 Q42 -4 34 4"
        stroke={MASCOT_COLORS.mainFur}
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
      />

      {/* Intense blush */}
      <Blush opacity={0.9} />

      {/* Nose */}
      <Nose />

      {/* Big celebration smile with teeth */}
      <path
        d="M16 36 Q30 52 44 36"
        stroke={MASCOT_COLORS.details}
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
      />
      {/* Teeth hint */}
      <rect x="24" y="38" width="12" height="6" rx="2" fill="white" />

      {/* Confetti particles */}
      {!reducedMotion && (
        <>
          {partyHatColors.map((color, i) => (
            <motion.rect
              key={`confetti-${i}`}
              x={-10 + i * 20}
              y="-30"
              width="6"
              height="6"
              rx="1"
              fill={color}
              variants={confettiVariants(i * 0.3)}
              initial="initial"
              animate="animate"
            />
          ))}
          {partyHatColors.map((color, i) => (
            <motion.circle
              key={`confetti-circle-${i}`}
              cx={5 + i * 15}
              cy="-25"
              r="3"
              fill={partyHatColors[(i + 2) % 4]}
              variants={confettiVariants(i * 0.2 + 0.5)}
              initial="initial"
              animate="animate"
            />
          ))}
        </>
      )}

      {/* Excited wagging tail */}
      <motion.path
        d="M95 72 Q125 50 115 78 Q108 98 85 85"
        fill={MASCOT_COLORS.mainFur}
        animate={reducedMotion ? {} : { rotate: [-25, 25, -25] }}
        transition={{ repeat: Infinity, duration: 0.25, ease: 'easeInOut' }}
        style={{ transformOrigin: '95px 80px' }}
      />
    </BaseMascot>
  );
}
