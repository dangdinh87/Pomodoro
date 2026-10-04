// @vitest-environment node
import { NextRequest } from 'next/server';
import { getRedirectUrl, getRewrittenUrl, isRewrite, unstable_doesMiddlewareMatch } from 'next/experimental/testing/server';
import { config, proxy } from './proxy';

const req = (path: string) => new NextRequest(`https://studywithbro.com${path}`);
const path = (url: string | null) => (url ? url.replace('https://studywithbro.com', '') : url);

describe('proxy', () => {
  it('rewrites English page paths into the /en tree, keeping the query', () => {
    const home = proxy(req('/'));
    expect(isRewrite(home)).toBe(true);
    expect(path(getRewrittenUrl(home))).toBe('/en');

    const guide = proxy(req('/guide?x=1'));
    expect(path(getRewrittenUrl(guide))).toBe('/en/guide?x=1');
  });

  it('serves /vi and /ja as they are', () => {
    for (const p of ['/vi', '/vi/guide', '/ja', '/ja/privacy?panel=tasks']) {
      const res = proxy(req(p));
      expect(isRewrite(res)).toBe(false);
      expect(res.status).toBe(200);
      expect(getRedirectUrl(res)).toBeNull();
    }
  });

  it('308s /en/* to the unprefixed URL and keeps the query', () => {
    const res = proxy(req('/en/guide?x=1'));
    expect(res.status).toBe(308);
    expect(path(getRedirectUrl(res))).toBe('/guide?x=1');
    expect(path(getRedirectUrl(proxy(req('/en'))))).toBe('/');
  });

  it('leaves an unsupported locale alone so the [lang] route answers 404', () => {
    const res = proxy(req('/fr'));
    expect(isRewrite(res)).toBe(false);
    expect(getRedirectUrl(res)).toBeNull();
  });

  it('sends a former page to its panel in the same language', () => {
    const res = proxy(req('/vi/tasks'));
    expect(res.status).toBe(308);
    expect(path(getRedirectUrl(res))).toBe('/vi?panel=tasks');
    expect(path(getRedirectUrl(proxy(req('/ja/leaderboard'))))).toBe('/ja');
  });

  it('sends /timer to the timer home in every language (the timer IS the home page)', () => {
    expect(path(getRedirectUrl(proxy(req('/vi/timer'))))).toBe('/vi');
    expect(path(getRedirectUrl(proxy(req('/ja/timer'))))).toBe('/ja');
    expect(path(getRedirectUrl(proxy(req('/en/timer'))))).toBe('/');
  });

  it('serves each language its own share image (English through the /en rewrite)', () => {
    expect(path(getRewrittenUrl(proxy(req('/opengraph-image'))))).toBe('/en/opengraph-image');
    expect(isRewrite(proxy(req('/vi/opengraph-image')))).toBe(false);
  });

  it('does not set or read the language cookie, and ignores Accept-Language', () => {
    const request = new NextRequest('https://studywithbro.com/', { headers: { 'accept-language': 'vi', cookie: 'app.lang=ja' } });
    const res = proxy(request);
    expect(path(getRewrittenUrl(res))).toBe('/en');
    expect(res.headers.get('set-cookie')).toBeNull();
  });
});

describe('proxy matcher', () => {
  const runsOn = (url: string) => unstable_doesMiddlewareMatch({ config, url });

  it.each(['/', '/guide', '/vi', '/vi/guide', '/en/guide', '/fr', '/device', '/apis'])('runs on %s', (url) => {
    expect(runsOn(url)).toBe(true);
  });

  it.each([
    '/api/tasks',
    '/_next/static/chunks/a.js',
    '/favicon.ico',
    '/robots.txt',
    '/sitemap.xml',
    '/manifest.json',
    '/icons/icon-192x192.png',
    '/dev/ui',
  ])('skips %s', (url) => {
    expect(runsOn(url)).toBe(false);
  });
});
