/**
 * Standalone content pages (guide, privacy, terms). Server components get their language as a
 * prop; client parts read it from the I18nProvider the `[lang]` layout provides.
 */
import { Footer } from '@/components/landing/Footer';
import { SiteHeader } from '@/components/landing/site-header';
import { SKIP_LINK_CLASS } from '@/components/layout/skip-link';
import { ThemeProvider } from '@/components/layout/theme-provider';
import { routeLang, type LangParams } from '@/lib/i18n/route-lang';
import { getT } from '@/lib/server-translations';

export default async function LandingLayout({
  children,
  params,
}: {
  children: React.ReactNode;
} & LangParams) {
  const lang = await routeLang(params);
  const t = getT(lang);
  return (
    <ThemeProvider
      attribute="data-theme"
      defaultTheme="light"
      enableSystem
      disableTransitionOnChange
    >
      <div className="min-h-screen relative text-ink">
        <a
          href="#main-content"
          className={SKIP_LINK_CLASS}
        >
          {t('skipLink.label')}
        </a>
        <SiteHeader lang={lang} />
        <main
          id="main-content"
          tabIndex={-1}
          className="relative z-10 focus:outline-hidden"
        >
          {children}
        </main>
        <Footer lang={lang} />
      </div>
    </ThemeProvider>
  );
}
