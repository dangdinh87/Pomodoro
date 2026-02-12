'use client';

/**
 * Auth Layout Client Component
 * Handles animations
 */
import { BackgroundBeamsWithCollision } from '@/components/ui/background-beams-with-collision';

export function AuthLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative h-screen w-full overflow-hidden bg-neutral-950">
      <BackgroundBeamsWithCollision className="h-full w-full bg-gradient-to-b from-white via-neutral-100 to-neutral-200 dark:from-neutral-950 dark:via-neutral-950/80 dark:to-neutral-900">
        <div className="relative z-10 flex h-full w-full items-center justify-center px-4 overflow-y-auto">
          {children}
        </div>
      </BackgroundBeamsWithCollision>
    </div>
  );
}
