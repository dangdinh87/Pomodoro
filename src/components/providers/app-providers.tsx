'use client';

/**
 * Consolidated app providers wrapper
 * Used for authenticated app sections (main, auth) - NOT for landing page
 * This allows landing page to be SSR while app sections remain CSR
 */
import { ThemeProvider } from '@/components/layout/theme-provider';
import { QueryProvider } from '@/components/providers/query-provider';
import { I18nProvider } from '@/contexts/i18n-context';
import { SupabaseAuthProvider } from '@/components/providers/supabase-auth-provider';
import { BackgroundRenderer } from '@/components/background/background-renderer';
import { Toaster } from 'sonner';
import NextTopLoader from 'nextjs-toploader';

interface AppProvidersProps {
  children: React.ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <NextTopLoader
        color="hsl(var(--primary))"
        showSpinner={false}
        height={3}
        crawlSpeed={200}
        speed={200}
      />
      <I18nProvider>
        <QueryProvider>
          <SupabaseAuthProvider />
          <BackgroundRenderer />
          {children}
          <Toaster />
        </QueryProvider>
      </I18nProvider>
    </ThemeProvider>
  );
}
