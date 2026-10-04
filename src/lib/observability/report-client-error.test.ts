import { reportClientError, resetClientErrorDedupeForTests } from './report-client-error';

const fetchMock = vi.fn();

beforeEach(() => {
  resetClientErrorDedupeForTests();
  fetchMock.mockReset().mockResolvedValue(new Response(null, { status: 204 }));
  vi.stubGlobal('fetch', fetchMock);
  window.history.pushState({}, '', '/vi/guide?token=secret#frag');
});
afterEach(() => vi.unstubAllGlobals());

const body = () => JSON.parse(fetchMock.mock.calls[0][1].body);

describe('reportClientError', () => {
  it('posts a sanitized report: page path only, no query, no cookies', () => {
    const error = Object.assign(new TypeError('boom'), { digest: 'd1' });
    reportClientError(error, 'route-error');

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('/api/client-error');
    expect(init).toMatchObject({ method: 'POST', credentials: 'omit', keepalive: true });
    expect(body()).toMatchObject({ boundary: 'route-error', message: 'boom', name: 'TypeError', digest: 'd1', path: '/vi/guide' });
    expect(JSON.stringify(body())).not.toContain('secret');
  });

  it('reports the same error only once (StrictMode, retry loops)', () => {
    const error = new Error('same');
    reportClientError(error, 'route-error');
    reportClientError(error, 'route-error');
    reportClientError(new Error('same'), 'global-error');
    expect(fetchMock).toHaveBeenCalledTimes(1);
    reportClientError(new Error('different'), 'route-error');
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('always sends a non-empty message and bounded fields', () => {
    reportClientError(new Error(''), 'global-error');
    expect(body().message).toBe('Error');

    resetClientErrorDedupeForTests();
    fetchMock.mockClear();
    const huge = new Error('m'.repeat(5000));
    huge.stack = 's'.repeat(20_000);
    reportClientError(huge, 'route-error');
    expect(body().message).toHaveLength(1000);
    expect(body().stack).toHaveLength(4000);
  });

  it('never throws, even when fetch itself blows up', () => {
    fetchMock.mockImplementation(() => {
      throw new Error('sync failure');
    });
    expect(() => reportClientError(new Error('a'), 'route-error')).not.toThrow();
    fetchMock.mockReset().mockRejectedValue(new Error('offline'));
    expect(() => reportClientError(new Error('b'), 'route-error')).not.toThrow();
  });
});
