'use client';

/**
 * Consolidated app providers wrapper
 * Used for authenticated app sections (main, auth) - NOT for landing page
 * This allows landing page to be SSR while app sections remain CSR
 */
import { ThemeProvider } from '@/components/layout/theme-provider';
import { QueryProvider } from '@/components/providers/query-provider';
import { AuthSessionSync } from '@/components/providers/auth-session-sync';
import { BackgroundRenderer } from '@/components/background/background-renderer';
import { ThemeRestorer } from '@/components/providers/theme-restorer';
import { AudioCleanupProvider } from '@/components/providers/audio-cleanup-provider';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NextTopLoader from 'nextjs-toploader';
import { MotionConfig } from 'motion/react';

interface AppProvidersProps {
  children: React.ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <ThemeProvider
      attribute="data-theme"
      defaultTheme="light"
      enableSystem
      disableTransitionOnChange
    >
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
          <ThemeRestorer />
          <AudioCleanupProvider />
          <BackgroundRenderer />
          <MotionConfig reducedMotion="user">
            {children}
          </MotionConfig>
          <Toaster />
        </QueryProvider>
      </TooltipProvider>
    </ThemeProvider>
  );
}
