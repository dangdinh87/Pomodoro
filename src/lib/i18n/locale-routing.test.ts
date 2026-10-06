import { resolveLocaleRoute } from './locale-routing';

const rewrite = (pathname: string) => ({ action: 'rewrite', pathname });
const redirect = (pathname: string, search = '') => ({ action: 'redirect', pathname, search });
const next = { action: 'next' };

describe('resolveLocaleRoute', () => {
  it('rewrites unprefixed page paths to the English tree', () => {
    expect(resolveLocaleRoute('/', '')).toEqual(rewrite('/en'));
    expect(resolveLocaleRoute('/guide', '')).toEqual(rewrite('/en/guide'));
    expect(resolveLocaleRoute('/privacy', '?x=1')).toEqual(rewrite('/en/privacy'));
    // an unknown page still goes to the English tree, whose catch-all renders the 404
    expect(resolveLocaleRoute('/nope/deeper', '')).toEqual(rewrite('/en/nope/deeper'));
  });

  it('passes vi and ja through untouched', () => {
    expect(resolveLocaleRoute('/vi', '')).toEqual(next);
    expect(resolveLocaleRoute('/vi/guide', '?panel=tasks')).toEqual(next);
    expect(resolveLocaleRoute('/ja', '')).toEqual(next);
    expect(resolveLocaleRoute('/ja/terms', '')).toEqual(next);
  });

  it('redirects /en and /en/* to the unprefixed path, keeping the query', () => {
    expect(resolveLocaleRoute('/en', '')).toEqual(redirect('/'));
    expect(resolveLocaleRoute('/en/', '')).toEqual(redirect('/'));
    expect(resolveLocaleRoute('/en/guide', '?x=1')).toEqual(redirect('/guide', '?x=1'));
    expect(resolveLocaleRoute('/en', '?panel=tasks')).toEqual(redirect('/', '?panel=tasks'));
  });

  it('does not rewrite a locale-looking prefix we do not support, so the route 404s', () => {
    expect(resolveLocaleRoute('/fr', '')).toEqual(next);
    expect(resolveLocaleRoute('/fr/guide', '')).toEqual(next);
    expect(resolveLocaleRoute('/pt-br', '')).toEqual(next);
  });

  describe('legacy page URLs, in every locale', () => {
    it.each([
      ['/vi/timer', '/vi', ''],
      ['/ja/timer', '/ja', ''],
      ['/vi/tasks', '/vi', '?panel=tasks'],
      ['/ja/history', '/ja', '?panel=stats'],
      ['/ja/progress', '/ja', '?panel=stats'],
      ['/vi/focus', '/vi', '?panel=stats'],
      ['/vi/settings', '/vi', '?panel=settings'],
      ['/vi/entertainment', '/vi', '?panel=arcade'],
      ['/vi/feedback', '/vi', '?panel=feedback'],
      ['/ja/login', '/ja', '?panel=login'],
      ['/ja/signup', '/ja', '?panel=login'],
      ['/vi/reset-password', '/vi', '?panel=login'],
      ['/vi/leaderboard', '/vi', ''],
      ['/ja/chat', '/ja', ''],
    ])('%s -> %s%s', (from, pathname, search) => {
      expect(resolveLocaleRoute(from, '')).toEqual(redirect(pathname, search));
    });

    it('goes straight to the final URL for /en/<legacy>, without a second hop', () => {
      expect(resolveLocaleRoute('/en/tasks', '')).toEqual(redirect('/', '?panel=tasks'));
      expect(resolveLocaleRoute('/en/timer', '')).toEqual(redirect('/', ''));
      expect(resolveLocaleRoute('/en/chat', '')).toEqual(redirect('/', ''));
    });

    it('keeps other query parameters next to the panel', () => {
      expect(resolveLocaleRoute('/vi/tasks', '?utm_source=a')).toEqual(redirect('/vi', '?utm_source=a&panel=tasks'));
    });

    it('only matches whole segments of the top-level path', () => {
      expect(resolveLocaleRoute('/vi/tasks/extra', '')).toEqual(next);
      expect(resolveLocaleRoute('/vi/tasksx', '')).toEqual(next);
    });
  });

  describe('never touches non-page requests', () => {
    it.each([
      '/api/tasks',
      '/api',
      '/_next/static/chunks/app.js',
      '/_next/image',
      '/_vercel/insights/view',
      '/_vercel/speed-insights/vitals',
      '/sitemap.xml',
      '/robots.txt',
      '/icon',
      '/apple-icon',
      '/manifest.json',
      '/llms.txt',
      '/favicon.ico',
      '/icons/icon-192x192.png',
      '/googleb3842cbf1c4206d4.html',
      '/dev/ui',
      '/dev',
    ])('%s', (pathname) => {
      expect(resolveLocaleRoute(pathname, '')).toEqual(next);
    });

    it('serves the share image of each language from its own tree, English unprefixed', () => {
      expect(resolveLocaleRoute('/opengraph-image', '?abc123')).toEqual(rewrite('/en/opengraph-image'));
      expect(resolveLocaleRoute('/vi/opengraph-image', '')).toEqual(next);
      expect(resolveLocaleRoute('/ja/opengraph-image', '')).toEqual(next);
      expect(resolveLocaleRoute('/en/opengraph-image', '')).toEqual(redirect('/opengraph-image'));
    });

    it('does not mistake a page whose name starts like an excluded one', () => {
      expect(resolveLocaleRoute('/device', '')).toEqual(rewrite('/en/device'));
      expect(resolveLocaleRoute('/apis', '')).toEqual(rewrite('/en/apis'));
      expect(resolveLocaleRoute('/_vercelish', '')).toEqual(rewrite('/en/_vercelish'));
    });
  });
});
