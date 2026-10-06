import { SITE_URL } from '@/config/site';
import { SUPPORTED_LANGS } from '@/lib/i18n/negotiate-locale';
import { INDEXABLE_PAGES, PAGE_UPDATED } from '@/lib/seo/pages';
import { pageUrl } from '@/lib/seo/urls';
import sitemap from './sitemap';

describe('sitemap', () => {
  const entries = sitemap();
  const byUrl = new Map(entries.map((entry) => [entry.url, entry]));

  it('lists every indexable page in every language, once', () => {
    expect(entries).toHaveLength(INDEXABLE_PAGES.length * SUPPORTED_LANGS.length);
    expect(byUrl.size).toBe(entries.length);
    for (const { path } of INDEXABLE_PAGES) {
      for (const lang of SUPPORTED_LANGS) expect(byUrl.has(pageUrl(lang, path))).toBe(true);
    }
  });

  it('spells the known URLs the way the pages declare them as canonical', () => {
    expect([...byUrl.keys()].sort()).toEqual(
      [
        SITE_URL,
        `${SITE_URL}/guide`,
        `${SITE_URL}/privacy`,
        `${SITE_URL}/terms`,
        `${SITE_URL}/vi`,
        `${SITE_URL}/vi/guide`,
        `${SITE_URL}/vi/privacy`,
        `${SITE_URL}/vi/terms`,
        `${SITE_URL}/ja`,
        `${SITE_URL}/ja/guide`,
        `${SITE_URL}/ja/privacy`,
        `${SITE_URL}/ja/terms`,
      ].sort(),
    );
  });

  it('gives every URL the full hreflang cluster, itself included, plus x-default = English', () => {
    for (const { path } of INDEXABLE_PAGES) {
      for (const lang of SUPPORTED_LANGS) {
        const entry = byUrl.get(pageUrl(lang, path))!;
        expect(entry.alternates?.languages).toEqual({
          en: pageUrl('en', path),
          vi: pageUrl('vi', path),
          ja: pageUrl('ja', path),
          'x-default': pageUrl('en', path),
        });
      }
    }
  });

  it('reports a fixed lastmod per page (the same in every language), never the build time', () => {
    for (const { path, lastModified } of INDEXABLE_PAGES) {
      expect(lastModified).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      for (const lang of SUPPORTED_LANGS) expect(byUrl.get(pageUrl(lang, path))?.lastModified).toBe(lastModified);
    }
    expect(sitemap().map((e) => e.lastModified)).toEqual(entries.map((e) => e.lastModified));
    expect(byUrl.get(`${SITE_URL}/guide`)?.lastModified).toBe(PAGE_UPDATED.guide);
    expect(byUrl.get(`${SITE_URL}/vi/terms`)?.lastModified).toBe(PAGE_UPDATED.legal);
  });

  it('never dates a page in the future (a typo like 2027 would make Google distrust the file)', () => {
    const oneDay = 24 * 60 * 60 * 1000; // dates are written in local time, Date.now() is UTC
    for (const { lastModified } of INDEXABLE_PAGES) expect(Date.parse(lastModified)).toBeLessThanOrEqual(Date.now() + oneDay);
  });

  it('keeps the home first and highest priority', () => {
    expect(entries[0].url).toBe(SITE_URL);
    expect(Math.max(...entries.map((e) => e.priority ?? 0))).toBe(1);
  });
});
