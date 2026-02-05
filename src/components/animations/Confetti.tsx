'use client';

import { useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { CONFETTI_COLORS } from '@/config/animations';

interface ConfettiProps {
  trigger: boolean;
  onComplete?: () => void;
  intensity?: 'low' | 'medium' | 'high';
}

const INTENSITY_CONFIG = {
  low: { particleCount: 2, duration: 1500 },
  medium: { particleCount: 3, duration: 2000 },
  high: { particleCount: 5, duration: 3000 },
};

export function Confetti({ trigger, onComplete, intensity = 'medium' }: ConfettiProps) {
  const reducedMotion = useReducedMotion();
  const rafIdRef = useRef<number | null>(null);

  useEffect(() => {
    if (!trigger) return;

    if (reducedMotion) {
      onComplete?.();
      return;
    }

    const config = INTENSITY_CONFIG[intensity];
    const end = Date.now() + config.duration;

    function frame() {
      confetti({
        particleCount: config.particleCount,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.8 },
        colors: [...CONFETTI_COLORS],
        zIndex: 9999,
      });
      confetti({
        particleCount: config.particleCount,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.8 },
        colors: [...CONFETTI_COLORS],
        zIndex: 9999,
      });

      if (Date.now() < end) {
        rafIdRef.current = requestAnimationFrame(frame);
      } else {
        onComplete?.();
      }
    }

    frame();

    return () => {
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
    };
  }, [trigger, reducedMotion, onComplete, intensity]);

  return null;
}

// Utility function for one-shot confetti
export function fireConfetti(options?: {
  intensity?: 'low' | 'medium' | 'high';
  colors?: string[];
}) {
  const intensity = options?.intensity || 'medium';
  const colors = options?.colors || [...CONFETTI_COLORS];
  const config = INTENSITY_CONFIG[intensity];

  const duration = config.duration;
  const end = Date.now() + duration;

  (function frame() {
    confetti({
      particleCount: config.particleCount,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.8 },
      colors,
      zIndex: 9999,
    });
    confetti({
      particleCount: config.particleCount,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.8 },
      colors,
      zIndex: 9999,
    });

    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  })();
}
