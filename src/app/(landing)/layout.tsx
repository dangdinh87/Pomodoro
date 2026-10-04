/**
 * Standalone content pages (guide, privacy, terms). Server components use
 * server-side translations; client parts use I18nProvider.
 */
import { Footer } from '@/components/landing/Footer';
import { SiteHeader } from '@/components/landing/site-header';
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
      defaultTheme="light"
      enableSystem
      disableTransitionOnChange
    >
      <I18nProvider>
        <div className="min-h-screen relative text-ink">
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-3 focus:z-100 focus:rounded-xl focus:border-2 focus:border-outline focus:bg-surface focus:px-4 focus:py-2 focus:font-heading focus:text-sm focus:font-bold focus:text-ink focus:shadow-sticker-sm focus:outline-3 focus:outline-offset-2 focus:outline-brand"
          >
            {t('skipLink.label')}
          </a>
          <SiteHeader />
          <main
            id="main-content"
            tabIndex={-1}
            className="relative z-10 focus:outline-hidden"
          >
            {children}
          </main>
          <Footer />
        </div>
      </I18nProvider>
    </ThemeProvider>
  );
}
