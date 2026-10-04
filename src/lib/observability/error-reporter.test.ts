/** @vitest-environment node */
import { buildServerErrorReport, normalizeReport, reportError, scrubText } from './error-reporter';

afterEach(() => vi.restoreAllMocks());

describe('scrubText', () => {
  it('removes emails, auth tokens and URL query strings', () => {
    expect(scrubText('failed for jane.doe+x@example.com', 200)).toBe('failed for [email]');
    expect(scrubText('header was Bearer abcdefgh12345678', 200)).toBe('header was Bearer [redacted]');
    expect(scrubText('GET /cb?code=secret123&state=s1 failed', 200)).toBe('GET /cb?[redacted] failed');
    expect(scrubText('what happened?', 200)).toBe('what happened?');
  });

  it('drops the bound values drizzle appends to a failed query message', () => {
    const message = 'Failed query: insert into "tasks" ("title") values ($1)\nparams: Buy milk,u@x.io';
    expect(scrubText(message, 500)).toBe('Failed query: insert into "tasks" ("title") values ($1)\nparams: [redacted]');
  });

  it('truncates and tolerates non-strings', () => {
    expect(scrubText('a'.repeat(50), 10)).toBe('a'.repeat(10));
    expect(scrubText(undefined, 10)).toBe('');
    expect(scrubText({ nope: 1 }, 10)).toBe('');
  });
});

describe('buildServerErrorReport', () => {
  it('reads message, name and digest, and prefers the route pattern over the raw path', () => {
    const error = Object.assign(new TypeError('boom'), { digest: '4242' });
    const report = buildServerErrorReport(error, { path: '/api/tasks/3f2a?x=1', method: 'PATCH' }, { routePath: '/app/api/tasks/[id]/route', routeType: 'route' });
    expect(report).toMatchObject({
      source: 'server',
      level: 'error',
      name: 'TypeError',
      message: 'boom',
      digest: '4242',
      route: '/app/api/tasks/[id]/route',
      method: 'PATCH',
      tags: { routeType: 'route' },
    });
  });

  it('falls back to the request path without its query string', () => {
    const report = buildServerErrorReport(new Error('x'), { path: '/vi/guide?utm=abc#top', method: 'GET' });
    expect(report.route).toBe('/vi/guide');
  });

  it('keeps only the stack frames: the header line repeats the (possibly sensitive) message', () => {
    const error = new Error('Failed query: select 1\nparams: secret-title');
    error.stack = 'Error: Failed query: select 1\nparams: secret-title\n    at run (/app/route.js:1:1)\n    at next (/app/x.js:2:2)';
    const report = buildServerErrorReport(error);
    expect(report.stack).toBe('at run (/app/route.js:1:1)\n    at next (/app/x.js:2:2)');
    expect(JSON.stringify(report)).not.toContain('secret-title');
  });

  it('handles values that are not Error instances', () => {
    expect(buildServerErrorReport('plain string')).toMatchObject({ name: 'Error', message: 'plain string' });
    expect(buildServerErrorReport(null).message).toBe('Unknown error');
  });

  it('never carries cookies, auth headers, request bodies or emails', () => {
    const request = {
      path: '/api/auth/sign-in?token=abc',
      method: 'POST',
      headers: { cookie: 'better-auth.session_token=SESSIONSECRET', authorization: 'Bearer BEARERSECRET123' },
      body: '{"email":"user@example.com","otp":"123456"}',
    };
    const report = buildServerErrorReport(new Error('sign-in failed for user@example.com'), request, { routePath: '/app/api/auth/[...all]/route' });
    const serialized = JSON.stringify(report);
    for (const secret of ['SESSIONSECRET', 'BEARERSECRET123', 'user@example.com', '123456', 'cookie', 'authorization']) {
      expect(serialized).not.toContain(secret);
    }
    expect(report.message).toBe('sign-in failed for [email]');
  });
});

describe('normalizeReport', () => {
  it('coerces untrusted input into bounded strings and a known source', () => {
    const report = normalizeReport({ source: 'bogus', message: 'm'.repeat(5000), name: 7, route: '/a?b=c', stack: 's'.repeat(9000) });
    expect(report.source).toBe('client');
    expect(report.message).toHaveLength(500);
    expect(report.name).toBe('Error');
    expect(report.route).toBe('/a');
    expect(report.stack).toHaveLength(2000);
  });
});

describe('reportError', () => {
  const REPORT = { source: 'server' as const, level: 'error' as const, name: 'Error', message: 'boom', route: '/app/page' };

  it('writes one structured JSON line and does not call out without SENTRY_DSN', async () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});
    const fetchImpl = vi.fn();
    await reportError(REPORT, { env: {}, fetchImpl });
    expect(fetchImpl).not.toHaveBeenCalled();
    expect(error).toHaveBeenCalledTimes(1);
    expect(JSON.parse(error.mock.calls[0][0] as string)).toMatchObject({ event: 'app_error', source: 'server', message: 'boom', route: '/app/page' });
  });

  it('logs warnings with console.warn', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});
    await reportError({ ...REPORT, source: 'csp', level: 'warning' }, { env: {}, fetchImpl: vi.fn() });
    expect(warn).toHaveBeenCalledTimes(1);
    expect(error).not.toHaveBeenCalled();
  });

  it('forwards to Sentry when SENTRY_DSN is set', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const fetchImpl = vi.fn().mockResolvedValue(new Response(null, { status: 200 }));
    await reportError(REPORT, { env: { SENTRY_DSN: 'https://k@o1.ingest.sentry.io/9', VERCEL_ENV: 'production' }, fetchImpl });
    expect(fetchImpl).toHaveBeenCalledTimes(1);
    expect(fetchImpl.mock.calls[0][0]).toBe('https://o1.ingest.sentry.io/api/9/envelope/');
    expect(JSON.parse(fetchImpl.mock.calls[0][1].body.split('\n')[2]).environment).toBe('production');
  });

  it('ignores an unparsable DSN and never throws', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const fetchImpl = vi.fn();
    await expect(reportError(REPORT, { env: { SENTRY_DSN: 'garbage' }, fetchImpl })).resolves.toBeUndefined();
    expect(fetchImpl).not.toHaveBeenCalled();
    await expect(
      reportError(REPORT, { env: { SENTRY_DSN: 'https://k@o1.ingest.sentry.io/9' }, fetchImpl: vi.fn().mockRejectedValue(new Error('down')) }),
    ).resolves.toBeUndefined();
  });

  it('survives a throwing console', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {
      throw new Error('console broke');
    });
    await expect(reportError(REPORT, { env: {} })).resolves.toBeUndefined();
  });
});
