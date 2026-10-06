/** @vitest-environment node */
import { reportError } from './error-reporter';
import { resetReportGateForTests, scheduleGatedReport, shouldForwardReport } from './report-gate';

vi.mock('./error-reporter', async (importOriginal) => ({
  ...(await importOriginal<typeof import('./error-reporter')>()),
  reportError: vi.fn().mockResolvedValue(undefined),
}));

const MINUTE = 60_000;
const T0 = 1_800_000_000_000;
const client = (over: Record<string, unknown> = {}) => ({
  source: 'client',
  name: 'TypeError',
  message: 'x is undefined',
  route: '/vi',
  ...over,
});
const csp = (over: Record<string, unknown> = {}) => ({
  source: 'csp',
  level: 'warning',
  name: 'CSPViolation',
  message: 'script-src blocked inline',
  route: '/',
  ...over,
});

beforeEach(() => {
  resetReportGateForTests();
  vi.mocked(reportError).mockClear();
  vi.spyOn(Math, 'random').mockReturnValue(0); // always inside a sample
});
afterEach(() => vi.restoreAllMocks());

describe('shouldForwardReport: dedupe', () => {
  it('forwards the first report of a fingerprint and drops repeats inside the window', () => {
    expect(shouldForwardReport(client(), T0)).toBe(true);
    expect(shouldForwardReport(client(), T0 + 1000)).toBe(false);
    expect(shouldForwardReport(client(), T0 + 4 * MINUTE)).toBe(false);
  });

  it('forwards the same fingerprint again once the window is over', () => {
    expect(shouldForwardReport(client(), T0)).toBe(true);
    expect(shouldForwardReport(client(), T0 + 5 * MINUTE + 1)).toBe(true);
  });

  it('treats a different source, name, message or route as a different fingerprint', () => {
    expect(shouldForwardReport(client(), T0)).toBe(true);
    expect(shouldForwardReport(client({ message: 'y is undefined' }), T0)).toBe(true);
    expect(shouldForwardReport(client({ route: '/ja' }), T0)).toBe(true);
    expect(shouldForwardReport(client({ name: 'RangeError' }), T0)).toBe(true);
    expect(shouldForwardReport(client({ source: 'server' }), T0)).toBe(true);
  });

  it('does not let a stack, digest or tags make a repeat look new', () => {
    expect(shouldForwardReport(client({ stack: 'at a (x.js:1:1)', digest: '1' }), T0)).toBe(true);
    expect(shouldForwardReport(client({ stack: 'at b (y.js:9:9)', digest: '2' }), T0)).toBe(false);
  });
});

describe('shouldForwardReport: per-instance cap', () => {
  it('forwards at most 30 distinct reports a minute, then recovers the next minute', () => {
    const results = Array.from({ length: 35 }, (_, i) => shouldForwardReport(client({ message: `m${i}` }), T0));
    expect(results.filter(Boolean)).toHaveLength(30);
    expect(results.slice(30)).toEqual([false, false, false, false, false]);

    expect(shouldForwardReport(client({ message: 'later' }), T0 + MINUTE)).toBe(true);
  });

  it('a report refused by the cap is not remembered as seen', () => {
    for (let i = 0; i < 30; i++) shouldForwardReport(client({ message: `m${i}` }), T0);
    expect(shouldForwardReport(client({ message: 'late' }), T0)).toBe(false);
    expect(shouldForwardReport(client({ message: 'late' }), T0 + MINUTE)).toBe(true);
  });

  it('leaves one summary line about what was suppressed, not one line per report', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    for (let i = 0; i < 35; i++) shouldForwardReport(client({ message: `m${i}` }), T0);
    shouldForwardReport(client({ message: 'm0' }), T0 + 1000); // deduped
    expect(warn).not.toHaveBeenCalled();

    shouldForwardReport(client({ message: 'next minute' }), T0 + MINUTE);
    expect(warn).toHaveBeenCalledTimes(1);
    expect(JSON.parse(warn.mock.calls[0][0] as string)).toEqual({ event: 'app_error_suppressed', count: 6 });
  });
});

describe('shouldForwardReport: CSP sampling', () => {
  it('forwards about 10% of CSP reports', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.05);
    expect(shouldForwardReport(csp(), T0)).toBe(true);
    vi.spyOn(Math, 'random').mockReturnValue(0.5);
    expect(shouldForwardReport(csp({ message: 'other' }), T0)).toBe(false);
  });

  it('never samples client errors', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.99);
    expect(shouldForwardReport(client(), T0)).toBe(true);
  });

  it('a sampled-out CSP report does not block the next one of the same kind', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.5);
    expect(shouldForwardReport(csp(), T0)).toBe(false);
    vi.spyOn(Math, 'random').mockReturnValue(0.01);
    expect(shouldForwardReport(csp(), T0 + 1000)).toBe(true);
  });
});

describe('shouldForwardReport: browser extension noise', () => {
  it.each([
    ['chrome', 'at run (chrome-extension://abcdef/content.js:1:1)'],
    ['firefox', 'run@moz-extension://1234-5678/inject.js:2:3'],
    ['safari', 'at x (safari-web-extension://id/a.js:1:1)'],
  ])('drops a %s extension stack', (_name, stack) => {
    expect(shouldForwardReport(client({ stack }), T0)).toBe(false);
  });

  it('drops a message that names an extension url', () => {
    expect(shouldForwardReport(client({ message: 'Failed to load chrome-extension://abc/x.js' }), T0)).toBe(false);
  });

  it('does not spend the cap on noise', () => {
    for (let i = 0; i < 100; i++) shouldForwardReport(client({ stack: `at x (chrome-extension://a/${i}.js:1:1)` }), T0);
    expect(shouldForwardReport(client(), T0)).toBe(true);
  });
});

describe('scheduleGatedReport', () => {
  it('reports once, then swallows the identical repeat', async () => {
    scheduleGatedReport(client());
    scheduleGatedReport(client());
    await Promise.resolve();
    expect(reportError).toHaveBeenCalledTimes(1);
  });
});
