import { SITE_URL } from '@/config/site';
import { metadata, viewport } from './layout';

describe('root layout metadata', () => {
  it('resolves relative URLs against the canonical origin', () => {
    expect(String(metadata.metadataBase)).toBe(`${SITE_URL}/`);
  });

  it('suffixes page titles with the brand, with a default for pages that set none', () => {
    expect(metadata.title).toEqual({ default: 'Study Bro: Free Pomodoro Timer', template: '%s | Study Bro' });
  });

  it('sets no site-wide canonical, og:url or keywords that child pages would inherit', () => {
    expect(metadata.alternates).toBeUndefined();
    expect(metadata.openGraph).toBeUndefined();
    expect(metadata).not.toHaveProperty('keywords');
  });

  it('links the single manifest and keeps the theme colors', () => {
    expect(metadata.manifest).toBe('/manifest.json');
    expect(viewport.themeColor).toHaveLength(2);
  });
});
