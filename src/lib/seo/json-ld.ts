/**
 * schema.org structured data builders. Plain objects in, so tests can check the shape without
 * rendering; `serializeJsonLd` is what ends up in the <script type="application/ld+json">.
 *
 *   every page   WebSite + Organization   ([lang]/layout.tsx)
 *   home         WebApplication + FAQPage  (one per language, in that language)
 *   guide        HowTo
 *
 * WebApplication is deliberately NOT sitewide: it describes the app, which is the home page.
 */
import { SITE_URL } from '@/config/site';
import { SUPPORTED_LANGS, type Lang } from '@/lib/i18n/negotiate-locale';
import { SITE_NAME } from './page-metadata';
import { ogImageUrl, pageUrl } from './urls';

const CONTEXT = 'https://schema.org';
export const ORGANIZATION_ID = `${SITE_URL}/#organization`;
export const WEBSITE_ID = `${SITE_URL}/#website`;

const FEATURE_KEYS = ['timer', 'tasks', 'stats', 'sound', 'scene', 'arcade', 'account'] as const;

export function organizationJsonLd() {
  return {
    '@context': CONTEXT,
    '@type': 'Organization',
    '@id': ORGANIZATION_ID,
    name: SITE_NAME,
    url: SITE_URL,
    logo: { '@type': 'ImageObject', url: `${SITE_URL}/icons/icon-512x512.png`, width: 512, height: 512 },
  };
}

export function webSiteJsonLd() {
  return {
    '@context': CONTEXT,
    '@type': 'WebSite',
    '@id': WEBSITE_ID,
    name: SITE_NAME,
    url: SITE_URL,
    inLanguage: [...SUPPORTED_LANGS],
    publisher: { '@id': ORGANIZATION_ID },
  };
}

/** The app itself, described on the home page of each language. */
export function webApplicationJsonLd(locale: Lang, t: (key: string) => string) {
  const url = pageUrl(locale, '/');
  return {
    '@context': CONTEXT,
    '@type': 'WebApplication',
    '@id': `${url}#webapp`,
    name: SITE_NAME,
    url,
    description: t('site.meta.home.description'),
    inLanguage: locale,
    applicationCategory: 'EducationalApplication',
    operatingSystem: 'Any',
    browserRequirements: 'Requires JavaScript',
    isAccessibleForFree: true,
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    featureList: FEATURE_KEYS.map((key) => t(`site.features.${key}.title`)),
    image: ogImageUrl(locale),
    publisher: { '@id': ORGANIZATION_ID },
    isPartOf: { '@id': WEBSITE_ID },
  };
}

export function faqPageJsonLd(locale: Lang, items: { question: string; answer: string }[]) {
  return {
    '@context': CONTEXT,
    '@type': 'FAQPage',
    url: pageUrl(locale, '/'),
    inLanguage: locale,
    mainEntity: items.map(({ question, answer }) => ({
      '@type': 'Question',
      name: question,
      acceptedAnswer: { '@type': 'Answer', text: answer },
    })),
  };
}

export function howToJsonLd(locale: Lang, { name, description, steps }: { name: string; description: string; steps: string[] }) {
  return {
    '@context': CONTEXT,
    '@type': 'HowTo',
    name,
    description,
    url: pageUrl(locale, '/guide'),
    inLanguage: locale,
    step: steps.map((text, i) => ({
      '@type': 'HowToStep',
      position: i + 1,
      text: text.replaceAll('**', ''),
    })),
  };
}

/** JSON for a <script type="application/ld+json">; `<` is escaped so text can never close the tag. */
export function serializeJsonLd(data: object): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}
