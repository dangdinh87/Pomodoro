import { renderToStaticMarkup } from 'react-dom/server';
import { SITE_URL } from '@/config/site';
import { SUPPORTED_LANGS } from '@/lib/i18n/negotiate-locale';
import { getT } from '@/lib/server-translations';
import { jsonLdOf, typesOf } from '@/test-utils/json-ld';

// The panel link is a client component that needs the router and the i18n provider
vi.mock('@/components/landing/panel-link', () => ({ PanelLink: ({ children }: { children: React.ReactNode }) => <a href="#panel">{children}</a> }));

import GuidePage, { generateMetadata as guideMetadata } from './guide/page';
import PrivacyPage, { generateMetadata as privacyMetadata } from './privacy/page';
import TermsPage, { generateMetadata as termsMetadata } from './terms/page';

const params = (lang: string) => ({ params: Promise.resolve({ lang }) });

describe.each([
  ['guide', '/guide', guideMetadata],
  ['privacy', '/privacy', privacyMetadata],
  ['terms', '/terms', termsMetadata],
] as const)('%s metadata', (page, path, generateMetadata) => {
  it.each(SUPPORTED_LANGS)('is in %s: translated title and description, self canonical, full hreflang', async (lang) => {
    const meta = await generateMetadata(params(lang));
    const t = getT(lang);
    // Bare title: the root template adds " | Study Bro"
    expect(meta.title).toBe(t(`site.meta.${page}.title`));
    expect(meta.description).toBe(t(`site.meta.${page}.description`));
    expect(meta.alternates?.canonical).toBe(`${SITE_URL}${lang === 'en' ? '' : `/${lang}`}${path}`);
    expect(Object.keys(meta.alternates?.languages ?? {})).toEqual(['en', 'vi', 'ja', 'x-default']);
    expect(meta.alternates?.languages).toMatchObject({ 'x-default': `${SITE_URL}${path}` });
    expect(meta.openGraph).toMatchObject({ locale: { en: 'en_US', vi: 'vi_VN', ja: 'ja_JP' }[lang] });
  });
});

describe('structured data on the content pages', () => {
  it.each(SUPPORTED_LANGS)('guide (%s) carries a HowTo in its language and no WebApplication', async (lang) => {
    const html = renderToStaticMarkup(await GuidePage(params(lang)));
    expect(typesOf(html)).toEqual(['HowTo']);
    const [howTo] = jsonLdOf(html) as { inLanguage: string; url: string; step: unknown[] }[];
    expect(howTo.inLanguage).toBe(lang);
    expect(howTo.url).toBe(`${SITE_URL}${lang === 'en' ? '' : `/${lang}`}/guide`);
    expect(howTo.step).toHaveLength(6);
  });

  it.each([
    ['privacy', PrivacyPage],
    ['terms', TermsPage],
  ] as const)('%s has no structured data of its own (no WebApplication on legal pages)', async (_name, Page) => {
    for (const lang of SUPPORTED_LANGS) {
      const html = renderToStaticMarkup(await Page(params(lang)));
      expect(jsonLdOf(html)).toEqual([]);
      expect(html).not.toContain('WebApplication');
    }
  });

  it('dates the guide and the legal pages from the same constants as the sitemap', async () => {
    expect(renderToStaticMarkup(await GuidePage(params('en')))).toContain('dateTime="2026-10-05"');
    expect(renderToStaticMarkup(await PrivacyPage(params('en')))).toContain('dateTime="2026-10-02"');
  });
});
