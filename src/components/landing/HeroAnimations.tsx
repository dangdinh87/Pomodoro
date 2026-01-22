'use client';

/**
 * Client-side animations for Hero section
 * Loaded after SSR, purely decorative
 */
import { Spotlight } from '@/components/ui/spotlight';

export function HeroAnimations() {
  return (
    <>
      {/* Spotlights - purely decorative, can load after SSR */}
      <Spotlight
        className="-top-40 left-0 md:left-60 md:-top-20 absolute"
        fill="rgba(99, 102, 241, 0.15)"
      />
      <Spotlight
        className="top-10 left-full -translate-x-1/2 opacity-75 absolute"
        fill="rgba(168, 85, 247, 0.12)"
      />
    </>
  );
}
