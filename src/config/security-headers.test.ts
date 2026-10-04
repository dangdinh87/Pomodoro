/** @vitest-environment node */
import nextConfig from '../../next.config';

async function responseHeaders() {
  const rules = await nextConfig.headers!();
  const all = rules.find((rule) => rule.source === '/:path*')!.headers;
  return Object.fromEntries(all.map((h) => [h.key, h.value]));
}

describe('security headers (next.config.ts)', () => {
  it('ships one Content-Security-Policy variant (Report-Only until the reports are clean)', async () => {
    const headers = await responseHeaders();
    const variants = ['Content-Security-Policy', 'Content-Security-Policy-Report-Only'].filter((key) => key in headers);
    expect(variants).toHaveLength(1);
  });

  it('sends violation reports to /api/csp-report with both report-uri and report-to', async () => {
    const headers = await responseHeaders();
    const csp = headers['Content-Security-Policy'] ?? headers['Content-Security-Policy-Report-Only'];
    expect(csp).toContain('report-uri /api/csp-report');
    expect(csp).toContain('report-to csp-endpoint');
    expect(headers['Reporting-Endpoints']).toBe('csp-endpoint="/api/csp-report"');
  });

  it('lets the browser reach Open-Meteo (forecast and place search)', async () => {
    const headers = await responseHeaders();
    const csp = headers['Content-Security-Policy'] ?? headers['Content-Security-Policy-Report-Only'];
    const connectSrc = csp.split('; ').find((directive) => directive.startsWith('connect-src '))!;
    expect(connectSrc).toContain('https://api.open-meteo.com');
    expect(connectSrc).toContain('https://geocoding-api.open-meteo.com');
  });
});
