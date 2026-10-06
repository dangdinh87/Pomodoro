// @vitest-environment node
/**
 * Former pages (/timer, /tasks, ...) are redirected in two places: next.config.ts for the
 * unprefixed (English) URLs, and the proxy for /vi/* and /ja/*. They must be ONE rule: the same
 * former page lands on the same place in every language, e.g. /timer -> / and /vi/timer -> /vi.
 */
import nextConfig from '../../../next.config';
import { localePath } from './locale-path';
import { resolveLocaleRoute } from './locale-routing';
import { SUPPORTED_LANGS } from './negotiate-locale';

const legacy = async () => {
  const redirects = await nextConfig.redirects!();
  // Skip the host-based domain-move redirect (only present when DOMAIN_MOVE=1)
  return redirects.filter((r) => !r.source.includes(':path'));
};

describe('legacy page redirects agree between next.config.ts and the proxy', () => {
  it('knows at least the old pages', async () => {
    const sources = (await legacy()).map((r) => r.source);
    expect(sources).toEqual(expect.arrayContaining(['/timer', '/tasks', '/history', '/leaderboard', '/chat']));
  });

  it.each(SUPPORTED_LANGS)('lands %s on the same place as English does', async (lang) => {
    for (const { source, destination } of await legacy()) {
      const [destPath, destQuery = ''] = destination.split('?');
      const expected = `${localePath(lang, destPath)}${destQuery ? `?${destQuery}` : ''}`;

      // English keeps its unprefixed URL in next.config.ts; /en/<page> is the proxy's mirror of it
      const from = lang === 'en' ? `/en${source}` : localePath(lang, source);
      const route = resolveLocaleRoute(from, '');
      expect(route.action, `${from} should redirect`).toBe('redirect');
      if (route.action === 'redirect') expect(`${route.pathname}${route.search}`, from).toBe(expected);
    }
  });

  it('sends /timer to the home, never to the timer settings panel', async () => {
    const timer = (await legacy()).find((r) => r.source === '/timer');
    expect(timer?.destination).toBe('/');
    expect(resolveLocaleRoute('/vi/timer', '')).toMatchObject({ pathname: '/vi', search: '' });
  });
});
