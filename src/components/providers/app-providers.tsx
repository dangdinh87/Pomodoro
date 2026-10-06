'use client';

/**
 * Providers of the app itself: the timer stage, its panels and what they share (TanStack Query, the
 * Better Auth session sync, the scene background, motion settings, toasts, tooltips, the route loader).
 * They load with the app's code, after the page has hydrated (AppHomeClientOnly -> app-runtime), so
 * the server-rendered parts of `/` (H1, the 25:00 placeholder, features, FAQ, footer) and the content
 * pages never wait for them. The theme and the saved UI preferences are not here: they style the
 * server HTML too, so the (main) layout applies them on hydration.
 */
import { createPortal } from 'react-dom';
import { QueryProvider } from '@/components/providers/query-provider';
import { AuthSessionSync } from '@/components/providers/auth-session-sync';
import { BackgroundRenderer } from '@/components/background/background-renderer';
import { AudioCleanupProvider } from '@/components/providers/audio-cleanup-provider';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { BackgroundProvider } from '@/contexts/background-context';
import NextTopLoader from 'nextjs-toploader';
import { MotionConfig } from 'motion/react';

interface AppProvidersProps {
  children: React.ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <BackgroundProvider>
      <NextTopLoader
        color="var(--accent-solid)"
        showSpinner={false}
        height={3}
        crawlSpeed={200}
        speed={200}
      />
      <TooltipProvider>
        <QueryProvider>
          <AuthSessionSync />
          <AudioCleanupProvider />
          {/* fixed, -z-10: behind everything wherever it sits in the DOM */}
          <BackgroundRenderer />
          <MotionConfig reducedMotion="user">
            {children}
          </MotionConfig>
          {/* At the end of <body> as before (after the page and its footer in tab order), not inside <main> */}
          {createPortal(<Toaster />, document.body)}
        </QueryProvider>
      </TooltipProvider>
    </BackgroundProvider>
  );
}
