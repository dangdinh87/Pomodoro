'use client';

import { useState, useEffect } from 'react';

/**
 * Hook to detect user's reduced motion preference.
 * Returns true if the user prefers reduced motion.
 *
 * @example
 * const reducedMotion = useReducedMotion();
 * if (reducedMotion) {
 *   // Skip animations
 * }
 */
export function useReducedMotion(): boolean {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    // Check if matchMedia is available (not on server)
    if (typeof window === 'undefined' || !window.matchMedia) {
      return;
    }

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);

    const handler = (event: MediaQueryListEvent) => {
      setReducedMotion(event.matches);
    };

    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  return reducedMotion;
}
