/**
 * Landing Layout - with client providers for interactive components
 * SSR components use server-side translations
 * Client components (HowItWorks, Pricing, FAQ, etc.) use I18nProvider
 */
import { ThemeProvider } from '@/components/layout/theme-provider';
import { I18nProvider } from '@/contexts/i18n-context';
import { getT } from '@/lib/server-translations';

export default async function LandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const t = await getT();
  return (
    <ThemeProvider
      attribute="data-theme"
      defaultTheme="dark"
      forcedTheme="dark"
      enableSystem={false}
      disableTransitionOnChange
    >
      <I18nProvider>
        <div className="min-h-screen relative bg-surface-page text-ink">
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-3 focus:z-[100] focus:rounded-md focus:bg-surface focus:px-3 focus:py-2 focus:text-sm focus:font-semibold focus:text-ink focus:ring-2 focus:ring-brand"
          >
            {t('skipLink.label')}
          </a>
          <main
            id="main-content"
            tabIndex={-1}
            className="relative z-10 focus:outline-none"
          >
            {children}
          </main>
        </div>
      </I18nProvider>
    </ThemeProvider>
  );
}
