import { buildPageMetadata } from './page-metadata';

const input = { path: '/guide', title: 'Guide', description: 'How it works' };

describe('buildPageMetadata', () => {
  it('points the canonical and og:url at the page in its own language', () => {
    const en = buildPageMetadata({ ...input, lang: 'en' });
    expect(en.alternates?.canonical).toBe('/guide');
    expect(en.openGraph?.url).toBe('/guide');

    const vi = buildPageMetadata({ ...input, lang: 'vi' });
    expect(vi.alternates?.canonical).toBe('/vi/guide');
    expect(vi.openGraph?.url).toBe('/vi/guide');
  });

  it('uses the language home without a trailing slash', () => {
    expect(buildPageMetadata({ ...input, path: '/', lang: 'ja' }).alternates?.canonical).toBe('/ja');
    expect(buildPageMetadata({ ...input, path: '/', lang: 'en' }).alternates?.canonical).toBe('/');
  });

  it('keeps the share image on the open graph and twitter cards', () => {
    const meta = buildPageMetadata({ ...input, lang: 'en' });
    expect(meta.title).toBe('Guide');
    expect(JSON.stringify(meta.openGraph)).toContain('/opengraph-image');
    expect(JSON.stringify(meta.twitter)).toContain('/opengraph-image');
  });
});
