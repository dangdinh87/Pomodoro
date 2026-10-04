/** @vitest-environment node */
import { spawnSync } from 'node:child_process';
import path from 'node:path';

// scripts/check-prod-env.mjs runs before `next build` (npm "prebuild"). On Vercel production it must stop a
// build that would ship canonical URLs / hreflang / sitemap / the mail sender from the built-in defaults.
const script = path.resolve(import.meta.dirname, '../../scripts/check-prod-env.mjs');

function run(env: Record<string, string>) {
  // A clean environment: whatever the machine running the tests has set must not leak in
  const result = spawnSync(process.execPath, [script], { env: { PATH: process.env.PATH ?? '', ...env }, encoding: 'utf8' });
  return { code: result.status, out: `${result.stdout}${result.stderr}` };
}

const production = { VERCEL_ENV: 'production' };
const configured = { NEXT_PUBLIC_SITE_URL: 'https://www.pomodoro-focus.site', EMAIL_FROM: 'Study Bro <no-reply@pomodoro-focus.site>' };

describe('check-prod-env (production build gate)', () => {
  it('passes a configured production build', () => {
    expect(run({ ...production, ...configured }).code).toBe(0);
  });

  it('fails a production build without NEXT_PUBLIC_SITE_URL and says so loudly', () => {
    const { code, out } = run({ ...production, EMAIL_FROM: configured.EMAIL_FROM });
    expect(code).toBe(1);
    expect(out).toContain('NEXT_PUBLIC_SITE_URL');
    expect(out).not.toContain('EMAIL_FROM is');
  });

  it('fails a production build without EMAIL_FROM', () => {
    const { code, out } = run({ ...production, NEXT_PUBLIC_SITE_URL: configured.NEXT_PUBLIC_SITE_URL });
    expect(code).toBe(1);
    expect(out).toContain('EMAIL_FROM');
  });

  it('reports both when both are missing, and treats blank as missing', () => {
    const { code, out } = run({ ...production, NEXT_PUBLIC_SITE_URL: '  ', EMAIL_FROM: '' });
    expect(code).toBe(1);
    expect(out).toContain('NEXT_PUBLIC_SITE_URL');
    expect(out).toContain('EMAIL_FROM');
  });

  it.each(['studywithbro.com', 'http://studywithbro.com', 'https://studywithbro.com/vi', 'not a url'])(
    'rejects NEXT_PUBLIC_SITE_URL=%s (it must be an https origin)',
    (value) => {
      const { code, out } = run({ ...production, ...configured, NEXT_PUBLIC_SITE_URL: value });
      expect(code).toBe(1);
      expect(out).toContain('NEXT_PUBLIC_SITE_URL');
    },
  );

  it('accepts a trailing slash, which the app strips', () => {
    expect(run({ ...production, ...configured, NEXT_PUBLIC_SITE_URL: 'https://studywithbro.com/' }).code).toBe(0);
  });

  it.each([{}, { VERCEL_ENV: 'preview' }, { VERCEL_ENV: 'development' }])(
    'leaves every other build alone (CI, local, preview): %o',
    (env) => {
      expect(run(env).code).toBe(0);
    },
  );
});
