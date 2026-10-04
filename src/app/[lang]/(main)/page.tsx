/**
 * `/` (and `/vi`, `/ja`) is the app. Below the timer, the server renders content (features, how
 * it works, FAQ) for search engines and first-time users. It is the same HTML for everyone, so
 * the page is static; signed-in members get it hidden on the client (GuestOnly).
 */
import { FeaturesSSR } from '@/components/landing/FeaturesSSR';
import { Footer } from '@/components/landing/Footer';
import { FAQ } from '@/components/landing/FAQ';
import { getFaqItems } from '@/components/landing/faq-items';
import { GuestOnly } from '@/components/landing/guest-only';
import { HowItWorks } from '@/components/landing/HowItWorks';
import { Metadata } from 'next';
import { JsonLd } from '@/components/seo/json-ld';
import { routeLang, type LangParams } from '@/lib/i18n/route-lang';
import { faqPageJsonLd, webApplicationJsonLd } from '@/lib/seo/json-ld';
import { buildPageMetadata } from '@/lib/seo/page-metadata';
import { getT } from '@/lib/server-translations';
import { AppHomeClientOnly } from '@/features/app-shell/app-home-client-only';
import { getGoogleCredentials } from '@/lib/auth/providers';

// SEO metadata in the route's language. Copy only claims features that ship today.
export async function generateMetadata({ params }: LangParams): Promise<Metadata> {
  const locale = await routeLang(params);
  const t = getT(locale);
  return buildPageMetadata({
    locale,
    path: '/',
    title: t('site.meta.home.title'),
    description: t('site.meta.home.description'),
    // The title already ends with the brand; do not let the root template add it twice
    titleAbsolute: true,
  });
}

export default async function HomePage({ params }: LangParams) {
  const lang = await routeLang(params);
  const t = getT(lang);

  return (
    <>
      {/* The one H1 of the page, in the server HTML. Visually hidden: the timer card is the first thing people see. */}
      <h1 className="sr-only">{t('shell.homeHeading')}</h1>
      {/* The app, in this language. Only the home describes it: WebApplication is not sitewide. */}
      <JsonLd data={webApplicationJsonLd(lang, t)} />
      <AppHomeClientOnly googleEnabled={Boolean(getGoogleCredentials())} />
      {/* Below the app: the same paper as the body (stage tint + doodle), opaque so a scene behind never shows through the text. */}
      <GuestOnly>
        <div className="paper-bg relative z-10 bg-(--stage-tint)">
          {/* Same items as the visible FAQ, so the structured data never drifts from the page */}
          <JsonLd data={faqPageJsonLd(lang, getFaqItems(t))} />
          <FeaturesSSR lang={lang} />
          <HowItWorks lang={lang} />
          <FAQ lang={lang} />
          <Footer lang={lang} />
        </div>
      </GuestOnly>
    </>
  );
}
