/** @vitest-environment node */
import { resetRateLimitsForTests } from '@/lib/api/in-memory-rate-limiter';
import { reportError } from '@/lib/observability/error-reporter';
import { resetReportGateForTests } from '@/lib/observability/report-gate';
import { POST } from './route';

vi.mock('@/lib/observability/error-reporter', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/lib/observability/error-reporter')>()),
  reportError: vi.fn().mockResolvedValue(undefined),
}));

const send = (body: string, contentType = 'application/csp-report', ip = '203.0.113.5') =>
  POST(
    new Request('http://localhost/api/csp-report', {
      method: 'POST',
      headers: { 'Content-Type': contentType, 'x-forwarded-for': ip },
      body,
    }),
  );

const LEGACY = JSON.stringify({ 'csp-report': { 'document-uri': 'x' } });

beforeEach(() => {
  resetRateLimitsForTests();
  resetReportGateForTests();
  vi.mocked(reportError).mockClear();
  vi.spyOn(Math, 'random').mockReturnValue(0); // inside the 10% sample unless a test says otherwise
});
afterEach(() => vi.restoreAllMocks());

describe('POST /api/csp-report', () => {
  it('accepts application/csp-report with 204 and logs the violation as a warning', async () => {
    const res = await send(JSON.stringify({ 'csp-report': { 'document-uri': 'https://studywithbro.com/', 'blocked-uri': 'inline', 'violated-directive': "script-src 'self'" } }));
    expect(res.status).toBe(204);
    expect(reportError).toHaveBeenCalledTimes(1);
    expect(vi.mocked(reportError).mock.calls[0][0]).toMatchObject({ source: 'csp', level: 'warning', message: 'script-src blocked inline' });
  });

  it('accepts application/reports+json and reports each violation in the batch', async () => {
    const body = JSON.stringify([
      { type: 'csp-violation', body: { documentURL: 'https://studywithbro.com/', blockedURL: 'eval', effectiveDirective: 'script-src' } },
      { type: 'csp-violation', body: { documentURL: 'https://studywithbro.com/', blockedURL: 'inline', effectiveDirective: 'style-src' } },
    ]);
    expect((await send(body, 'application/reports+json')).status).toBe(204);
    expect(reportError).toHaveBeenCalledTimes(2);
  });

  it('accepts the minimal body from the smoke test', async () => {
    expect((await send(LEGACY)).status).toBe(204);
  });

  it('ignores extension noise but still answers 204', async () => {
    const res = await send(JSON.stringify({ 'csp-report': { 'document-uri': 'x', 'blocked-uri': 'chrome-extension://abc' } }));
    expect(res.status).toBe(204);
    expect(reportError).not.toHaveBeenCalled();
  });

  it('rejects other content types (415), bad JSON (400), unknown shapes (400) and oversized bodies (413)', async () => {
    expect((await send(LEGACY, 'text/plain')).status).toBe(415);
    expect((await send('{nope')).status).toBe(400);
    expect((await send('{"hello":"world"}')).status).toBe(400);
    expect((await send(JSON.stringify({ 'csp-report': { 'document-uri': 'x'.repeat(40_000) } }))).status).toBe(413);
    expect(reportError).not.toHaveBeenCalled();
  });

  it('rate limits per IP', async () => {
    for (let i = 0; i < 60; i++) expect((await send(LEGACY)).status).toBe(204);
    const limited = await send(LEGACY);
    expect(limited.status).toBe(429);
    expect(limited.headers.get('Retry-After')).not.toBeNull();
    expect((await send(LEGACY, 'application/csp-report', '198.51.100.1')).status).toBe(204);
  });

  describe('keeping the Sentry quota safe', () => {
    const violation = (blocked: string) => JSON.stringify({ 'csp-report': { 'document-uri': 'https://studywithbro.com/', 'blocked-uri': blocked, 'violated-directive': "script-src 'self'" } });

    it('forwards only about 10% of the reports', async () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.5);
      expect((await send(violation('inline'))).status).toBe(204);
      expect(reportError).not.toHaveBeenCalled();

      vi.spyOn(Math, 'random').mockReturnValue(0.05);
      expect((await send(violation('inline'))).status).toBe(204);
      expect(reportError).toHaveBeenCalledTimes(1);
    });

    it('forwards the same violation once per window, however many visitors hit it', async () => {
      for (let i = 0; i < 10; i++) expect((await send(violation('inline'), 'application/csp-report', `203.0.113.${i + 1}`)).status).toBe(204);
      expect(reportError).toHaveBeenCalledTimes(1);
    });

    it('forwards at most 30 different violations a minute from this instance', async () => {
      for (let i = 0; i < 40; i++) {
        const res = await send(violation(`https://cdn${i}.example/a.js`), 'application/csp-report', `203.0.113.${i + 10}`);
        expect(res.status).toBe(204);
      }
      expect(reportError).toHaveBeenCalledTimes(30);
    });

    it('a batch counts each violation, not each request', async () => {
      const body = JSON.stringify(
        Array.from({ length: 10 }, (_, i) => ({ type: 'csp-violation', body: { documentURL: 'https://studywithbro.com/', blockedURL: `https://c${i}.example/x.js`, effectiveDirective: 'script-src' } })),
      );
      for (let i = 0; i < 5; i++) await send(body, 'application/reports+json', `203.0.113.${i + 1}`);
      expect(reportError).toHaveBeenCalledTimes(10); // the same ten violations, forwarded once
    });
  });
});
