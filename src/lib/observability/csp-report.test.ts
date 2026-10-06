/** @vitest-environment node */
import { cspViolationToReport, parseCspReports } from './csp-report';

describe('parseCspReports', () => {
  it('reads the legacy report-uri format (application/csp-report)', () => {
    const body = {
      'csp-report': {
        'document-uri': 'https://studywithbro.com/vi?token=secret#x',
        'blocked-uri': 'https://evil.example/a.js?k=v',
        'violated-directive': "script-src 'self'",
        'effective-directive': 'script-src-elem',
        disposition: 'report',
        'source-file': 'https://studywithbro.com/_next/chunk.js?v=1',
        'line-number': 12,
        'original-policy': "default-src 'self'; report-uri /api/csp-report",
      },
    };
    expect(parseCspReports(body)).toEqual([
      {
        documentUri: 'https://studywithbro.com/vi',
        blockedUri: 'https://evil.example/a.js',
        directive: 'script-src-elem',
        disposition: 'report',
        sourceFile: 'https://studywithbro.com/_next/chunk.js',
      },
    ]);
  });

  it('reads the Reporting API format (application/reports+json), a batch of reports', () => {
    const body = [
      {
        type: 'csp-violation',
        url: 'https://studywithbro.com/',
        body: { documentURL: 'https://studywithbro.com/', blockedURL: 'inline', effectiveDirective: 'script-src-elem', disposition: 'report' },
      },
      { type: 'deprecation', body: { id: 'x' } },
      { type: 'csp-violation', body: { documentURL: 'https://studywithbro.com/ja', blockedURL: 'eval', effectiveDirective: 'script-src' } },
    ];
    const parsed = parseCspReports(body);
    expect(parsed.map((v) => [v.blockedUri, v.directive])).toEqual([
      ['inline', 'script-src-elem'],
      ['eval', 'script-src'],
    ]);
  });

  it('falls back to the first token of violated-directive', () => {
    const [v] = parseCspReports({ 'csp-report': { 'document-uri': 'x', 'violated-directive': "img-src 'self' data:" } });
    expect(v.directive).toBe('img-src');
  });

  it('keeps a bare report with only a document-uri, as long as it is the right shape', () => {
    expect(parseCspReports({ 'csp-report': { 'document-uri': 'x' } })).toHaveLength(1);
  });

  it('drops browser-extension noise', () => {
    expect(parseCspReports({ 'csp-report': { 'document-uri': 'x', 'blocked-uri': 'chrome-extension://abc/inject.js' } })).toEqual([]);
    expect(parseCspReports({ 'csp-report': { 'document-uri': 'x', 'blocked-uri': 'inline', 'source-file': 'moz-extension://abc/x.js' } })).toEqual([]);
  });

  it('caps a batch at 10 reports', () => {
    const batch = Array.from({ length: 50 }, () => ({ type: 'csp-violation', body: { documentURL: 'x', blockedURL: 'inline', effectiveDirective: 'script-src' } }));
    expect(parseCspReports(batch)).toHaveLength(10);
  });

  it.each([null, 'text', 42, {}, [], [1, 'a'], { 'csp-report': 'nope' }, { 'csp-report': null }])('is empty for %j', (body) => {
    expect(parseCspReports(body)).toEqual([]);
  });
});

describe('cspViolationToReport', () => {
  it('becomes a warning with the directive and blocked source in the message, and the page path as route', () => {
    const report = cspViolationToReport({
      documentUri: 'https://studywithbro.com/vi/guide',
      blockedUri: 'https://api.open-meteo.com/v1/forecast',
      directive: 'connect-src',
      disposition: 'report',
      sourceFile: '',
    });
    expect(report).toMatchObject({
      source: 'csp',
      level: 'warning',
      name: 'CSPViolation',
      message: 'connect-src blocked https://api.open-meteo.com/v1/forecast',
      route: '/vi/guide',
      tags: { disposition: 'report' },
    });
  });

  it('copes with a document-uri that is not a URL, and a missing blocked-uri', () => {
    const report = cspViolationToReport({ documentUri: 'x', blockedUri: '', directive: '', disposition: '', sourceFile: '' });
    expect(report.route).toBe('x');
    expect(report.message).toBe('unknown-directive blocked unknown');
  });
});
