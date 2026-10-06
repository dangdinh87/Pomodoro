// @vitest-environment node
import { betterAuth } from 'better-auth';
import { SITE_URL } from '@/config/site';
import { authBaseURL } from './base-url';

describe('authBaseURL', () => {
  it('uses BETTER_AUTH_URL as is when it is set (production)', () => {
    expect(authBaseURL({ BETTER_AUTH_URL: 'https://www.pomodoro-focus.site', NODE_ENV: 'production' })).toBe(
      'https://www.pomodoro-focus.site',
    );
  });

  it('leaves the dev server to take the origin from each request (localhost, LAN IP)', () => {
    expect(authBaseURL({ NODE_ENV: 'development' })).toBeUndefined();
  });

  it('otherwise falls back to the site origin, accepting this deployment\'s own hosts and local ones', () => {
    const config = authBaseURL({
      NODE_ENV: 'production',
      VERCEL_URL: 'study-bro-abc123.vercel.app',
      VERCEL_BRANCH_URL: 'study-bro-git-feat-x.vercel.app',
    });
    expect(config).toMatchObject({ fallback: SITE_URL });
    const { allowedHosts } = config as { allowedHosts: string[] };
    expect(allowedHosts).toEqual(
      expect.arrayContaining([
        new URL(SITE_URL).host,
        'study-bro-abc123.vercel.app',
        'study-bro-git-feat-x.vercel.app',
        'localhost:*',
      ]),
    );
    // Never every vercel.app site: only this deployment's
    expect(allowedHosts).not.toContain('*.vercel.app');
  });

  it('gives Better Auth a base URL it accepts without the "Base URL is not set" warning', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const log = vi.spyOn(console, 'log').mockImplementation(() => {});
    try {
      const auth = betterAuth({
        baseURL: authBaseURL({ NODE_ENV: 'production' }),
        secret: 'a-test-secret-that-is-long-enough-1234567890',
        logger: { level: 'warn' },
      });
      await auth.$context;
      const printed = [...warn.mock.calls, ...log.mock.calls].flat().join(' ');
      expect(printed).not.toMatch(/Base URL is not set/);
    } finally {
      warn.mockRestore();
      log.mockRestore();
    }
  });
});
