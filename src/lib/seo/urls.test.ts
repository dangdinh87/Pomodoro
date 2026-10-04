import { SITE_URL } from '@/config/site';
import { SUPPORTED_LANGS } from '@/lib/i18n/negotiate-locale';
import { languageAlternates, OG_LOCALE, ogImageUrl, pageUrl } from './urls';

describe('pageUrl', () => {
  it('is absolute, built from the canonical origin, English without a prefix', () => {
    expect(pageUrl('en', '/')).toBe(SITE_URL);
    expect(pageUrl('en', '/guide')).toBe(`${SITE_URL}/guide`);
    expect(pageUrl('vi', '/')).toBe(`${SITE_URL}/vi`);
    expect(pageUrl('vi', '/guide')).toBe(`${SITE_URL}/vi/guide`);
    expect(pageUrl('ja', '/privacy')).toBe(`${SITE_URL}/ja/privacy`);
  });

  it('never ends with a slash (the sitemap, canonical and hreflang must spell a URL the same way)', () => {
    for (const lang of SUPPORTED_LANGS) {
      for (const path of ['/', '/guide', '/privacy', '/terms']) {
        expect(pageUrl(lang, path).endsWith('/')).toBe(false);
      }
    }
  });
});

describe('languageAlternates', () => {
  it('lists every language plus x-default, and x-default is the English URL', () => {
    expect(languageAlternates('/guide')).toEqual({
      en: `${SITE_URL}/guide`,
      vi: `${SITE_URL}/vi/guide`,
      ja: `${SITE_URL}/ja/guide`,
      'x-default': `${SITE_URL}/guide`,
    });
    expect(languageAlternates('/')['x-default']).toBe(SITE_URL);
  });
});

describe('share image and og:locale', () => {
  it('has one share image per language, English unprefixed', () => {
    expect(ogImageUrl('en')).toBe(`${SITE_URL}/opengraph-image`);
    expect(ogImageUrl('vi')).toBe(`${SITE_URL}/vi/opengraph-image`);
    expect(ogImageUrl('ja')).toBe(`${SITE_URL}/ja/opengraph-image`);
  });

  it('uses language_TERRITORY locales as Open Graph requires', () => {
    expect(OG_LOCALE).toEqual({ en: 'en_US', vi: 'vi_VN', ja: 'ja_JP' });
  });
});
