/**
 * Landing Layout - with client providers for interactive components
 * SSR components use server-side translations
 * Client components (HowItWorks, Pricing, FAQ, etc.) use I18nProvider
 */
import { ThemeProvider } from '@/components/layout/theme-provider';
import { I18nProvider } from '@/contexts/i18n-context';
import { t } from '@/lib/server-translations';

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      forcedTheme="dark"
      enableSystem={false}
      disableTransitionOnChange
    >
      <I18nProvider>
        <div className="min-h-screen relative">
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:fixed focus:left-2 focus:top-2 focus:z-[100] focus:rounded-md focus:bg-background focus:px-3 focus:py-2 focus:text-sm focus:font-medium focus:shadow"
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
