import type { Metadata } from 'next';
import { SITE_URL } from '@/config/site';
import { SUPPORTED_LANGS, type Lang } from '@/lib/i18n/negotiate-locale';
import { getT } from '@/lib/server-translations';
import { buildPageMetadata } from './page-metadata';

const input = { path: '/guide', title: 'Guide', description: 'How it works' };
const build = (locale: Lang, extra: Partial<Parameters<typeof buildPageMetadata>[0]> = {}) =>
  buildPageMetadata({ ...input, locale, ...extra });

const ogImages = (meta: Metadata) => [meta.openGraph?.images].flat().filter(Boolean) as { url: string; alt?: string }[];

describe('buildPageMetadata: canonical', () => {
  it('is the absolute URL of the page in its own language, never the English one', () => {
    expect(build('en').alternates?.canonical).toBe(`${SITE_URL}/guide`);
    expect(build('vi').alternates?.canonical).toBe(`${SITE_URL}/vi/guide`);
    expect(build('ja').alternates?.canonical).toBe(`${SITE_URL}/ja/guide`);
  });

  it('uses the language home without a trailing slash', () => {
    expect(build('ja', { path: '/' }).alternates?.canonical).toBe(`${SITE_URL}/ja`);
    expect(build('vi', { path: '/' }).alternates?.canonical).toBe(`${SITE_URL}/vi`);
    expect(build('en', { path: '/' }).alternates?.canonical).toBe(SITE_URL);
  });

  it('is repeated as og:url', () => {
    for (const locale of SUPPORTED_LANGS) {
      expect(build(locale).openGraph?.url).toBe(build(locale).alternates?.canonical);
    }
  });
});

describe('buildPageMetadata: hreflang', () => {
  it('lists en, vi, ja and x-default (= English) on every page of every language', () => {
    for (const locale of SUPPORTED_LANGS) {
      expect(build(locale).alternates?.languages).toEqual({
        en: `${SITE_URL}/guide`,
        vi: `${SITE_URL}/vi/guide`,
        ja: `${SITE_URL}/ja/guide`,
        'x-default': `${SITE_URL}/guide`,
      });
    }
  });

  it('is reciprocal and self-referencing: each page lists itself and every sibling lists the same set', () => {
    const sets = SUPPORTED_LANGS.map((locale) => build(locale).alternates?.languages);
    expect(new Set(sets.map((s) => JSON.stringify(s))).size).toBe(1);
    for (const locale of SUPPORTED_LANGS) {
      const meta = build(locale);
      expect((meta.alternates?.languages as Record<string, string>)[locale]).toBe(meta.alternates?.canonical);
    }
  });
});

describe('buildPageMetadata: title and description', () => {
  it('passes a plain title through so the root template adds the brand', () => {
    expect(build('en').title).toBe('Guide');
    expect(build('en').description).toBe('How it works');
  });

  it('can skip the template when the title already carries the brand (home)', () => {
    expect(build('en', { titleAbsolute: true }).title).toEqual({ absolute: 'Guide' });
  });

  it('gives social cards the full title, brand included, in both modes', () => {
    expect(build('en').openGraph?.title).toBe('Guide | Study Bro');
    expect(build('en').twitter?.title).toBe('Guide | Study Bro');
    expect(build('en', { titleAbsolute: true }).openGraph?.title).toBe('Guide');
  });

  it('does not emit the meta keywords tag (search engines ignore it)', () => {
    expect(build('vi')).not.toHaveProperty('keywords');
  });
});

describe('buildPageMetadata: Open Graph and Twitter', () => {
  it('sets og:locale per language and lists the other two as alternates', () => {
    const vi = build('vi').openGraph as { locale?: string; alternateLocale?: string[] };
    expect(vi.locale).toBe('vi_VN');
    expect(vi.alternateLocale).toEqual(['en_US', 'ja_JP']);
    const en = build('en').openGraph as { locale?: string; alternateLocale?: string[] };
    expect(en.locale).toBe('en_US');
    expect(en.alternateLocale).toEqual(['vi_VN', 'ja_JP']);
    expect((build('ja').openGraph as { locale?: string }).locale).toBe('ja_JP');
  });

  it('is a website card named Study Bro', () => {
    const og = build('en').openGraph as { type?: string; siteName?: string };
    expect(og.type).toBe('website');
    expect(og.siteName).toBe('Study Bro');
  });

  it('points og:image and twitter:image at the image of that language, with a translated alt', () => {
    for (const [locale, url] of [
      ['en', `${SITE_URL}/opengraph-image`],
      ['vi', `${SITE_URL}/vi/opengraph-image`],
      ['ja', `${SITE_URL}/ja/opengraph-image`],
    ] as const) {
      const meta = build(locale);
      const [image] = ogImages(meta);
      expect(ogImages(meta)).toHaveLength(1);
      expect(image.url).toBe(url);
      expect(image.alt).toBe(getT(locale)('site.meta.og.alt'));
      expect(meta.twitter).toMatchObject({ card: 'summary_large_image', images: [url] });
    }
  });

  it('declares the 1200x630 size of the image', () => {
    expect(ogImages(build('en'))[0]).toMatchObject({ width: 1200, height: 630 });
  });
});
