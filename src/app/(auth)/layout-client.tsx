'use client';

/**
 * Auth Layout Client Component
 * Handles animations and theme toggle
 */
import { AnimatedThemeToggler } from '@/components/ui/animated-theme-toggler';
import { BackgroundBeamsWithCollision } from '@/components/ui/background-beams-with-collision';

export function AuthLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative h-screen w-full overflow-hidden bg-neutral-950">
      <AnimatedThemeToggler className="absolute right-4 top-4 z-50 rounded-full border border-white/20 bg-black/30 p-2 text-white backdrop-blur md:right-8 md:top-8" />
      <BackgroundBeamsWithCollision className="h-full w-full bg-gradient-to-b from-white via-neutral-100 to-neutral-200 dark:from-neutral-950 dark:via-neutral-950/80 dark:to-neutral-900">
        <div className="relative z-10 flex h-full w-full items-center justify-center px-4 overflow-y-auto">
          {children}
        </div>
      </BackgroundBeamsWithCollision>
    </div>
  );
}
