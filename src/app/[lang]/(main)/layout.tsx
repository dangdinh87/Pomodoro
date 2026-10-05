/**
 * The app page (`/`, `/vi`, `/ja`). Server component: the skip link is in the server HTML in the route's
 * language, and only the theme and the saved UI preferences hydrate with the page. The app's providers
 * (query client, auth session, scene, toasts...) load with the app itself, after hydration
 * (AppHomeClientOnly -> app-runtime), so the SSR content never waits for them.
 */
import { SKIP_LINK_CLASS } from '@/components/layout/skip-link';
import { ThemeProvider } from '@/components/layout/theme-provider';
import { ThemeRestorer } from '@/components/providers/theme-restorer';
import { routeLang, type LangParams } from '@/lib/i18n/route-lang';
import { getT } from '@/lib/server-translations';

export default async function MainLayout({
  children,
  params,
}: {
  children: React.ReactNode;
} & LangParams) {
  const lang = await routeLang(params);
  const t = getT(lang);
  return (
    <ThemeProvider attribute="data-theme" defaultTheme="light" enableSystem disableTransitionOnChange>
      <ThemeRestorer />
      <a href="#main-content" className={SKIP_LINK_CLASS}>
        {t('skipLink.label')}
      </a>
      <main id="main-content" tabIndex={-1} className="focus:outline-none">
        {children}
      </main>
    </ThemeProvider>
  );
}
