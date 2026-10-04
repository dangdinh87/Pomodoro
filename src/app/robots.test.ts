import { SITE_URL } from '@/config/site';
import robots from './robots';

describe('robots', () => {
  const result = robots();
  const rules = [result.rules].flat();

  it('lets crawlers in and keeps them out of the API, auth callbacks and the dev gallery', () => {
    expect(rules).toHaveLength(1);
    expect(rules[0].userAgent).toBe('*');
    expect(rules[0].allow).toBe('/');
    expect(rules[0].disallow).toEqual(['/api/', '/auth/', '/dev/']);
  });

  it('does not block the language trees or the share images', () => {
    const blocked = [rules[0].disallow].flat() as string[];
    for (const path of ['/vi', '/vi/guide', '/ja', '/ja/privacy', '/opengraph-image', '/vi/opengraph-image']) {
      expect(blocked.some((prefix) => path.startsWith(prefix))).toBe(false);
    }
  });

  it('points at the sitemap on the canonical origin', () => {
    expect(result.sitemap).toBe(`${SITE_URL}/sitemap.xml`);
  });
});
