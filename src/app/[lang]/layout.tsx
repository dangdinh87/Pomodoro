/**
 * Root layout, one per language (`/`, `/vi`, `/ja`; English is served from `/en` via the proxy
 * rewrite). The language comes from the route param, never from a cookie or header, so every
 * page under it can be generated at build time. `generateStaticParams` + `dynamicParams = false`
 * make any other first segment a 404.
 * Providers other than i18n live in the group layouts ((main), (landing)).
 * Metadata common to all languages (title template, icons, manifest) is in the pass-through
 * `app/layout.tsx`; each page builds its own with `buildPageMetadata`. This layout deliberately
 * sets no `title`: a title object here would reset the root `%s | Study Bro` template for every page.
 */
import { I18nProvider } from '@/contexts/i18n-context';
import { JsonLd } from '@/components/seo/json-ld';
import { LanguageSuggestion } from '@/components/layout/language-suggestion';
import { GoogleAnalytics } from '@/components/trackings/ga';
import { loadMessages } from '@/lib/i18n/messages';
import { SUPPORTED_LANGS } from '@/lib/i18n/negotiate-locale';
import { routeLang, type LangParams } from '@/lib/i18n/route-lang';
import { organizationJsonLd, webSiteJsonLd } from '@/lib/seo/json-ld';
import { Analytics } from '@vercel/analytics/next';
import { fontVariables } from '../fonts';
import '../globals.css';

export const dynamicParams = false;

export function generateStaticParams() {
  return SUPPORTED_LANGS.map((lang) => ({ lang }));
}

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
} & LangParams) {
  const lang = await routeLang(params);
  const messages = await loadMessages(lang);

  return (
    <html lang={lang} suppressHydrationWarning className={fontVariables}>
      <body>
        {/* Site-wide structured data, once per page. The app itself (WebApplication) is described on the home page only. */}
        <JsonLd data={webSiteJsonLd()} />
        <JsonLd data={organizationJsonLd()} />
        <GoogleAnalytics />
        <I18nProvider locale={lang} messages={messages}>
          {children}
          <LanguageSuggestion />
        </I18nProvider>
        <Analytics />
      </body>
    </html>
  );
}
