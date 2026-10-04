/** @vitest-environment node */
import { onRequestError } from './instrumentation';

const fetchMock = vi.fn();

beforeEach(() => {
  fetchMock.mockReset().mockResolvedValue(new Response(null, { status: 200 }));
  vi.stubGlobal('fetch', fetchMock);
  vi.spyOn(console, 'error').mockImplementation(() => {});
});
afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

const request = {
  path: '/api/tasks/3f2a9c?draft=1',
  method: 'PATCH',
  headers: { cookie: 'better-auth.session_token=SESSIONSECRET', authorization: 'Bearer BEARERSECRET123' },
};
const context = { routerKind: 'App Router', routePath: '/app/api/tasks/[id]/route', routeType: 'route', renderSource: undefined, revalidateReason: undefined, renderType: undefined } as never;
const error = Object.assign(new Error('db exploded for user@example.com'), { digest: '99' });

describe('onRequestError', () => {
  it('writes one structured log line with route, method, digest and message, and nothing personal', async () => {
    vi.stubEnv('SENTRY_DSN', '');
    await onRequestError(error, request, context);

    const log = vi.mocked(console.error).mock.calls[0][0] as string;
    expect(JSON.parse(log)).toMatchObject({
      event: 'app_error',
      source: 'server',
      route: '/app/api/tasks/[id]/route',
      method: 'PATCH',
      digest: '99',
      message: 'db exploded for [email]',
    });
    for (const secret of ['SESSIONSECRET', 'BEARERSECRET123', 'user@example.com', 'cookie', 'authorization']) {
      expect(log).not.toContain(secret);
    }
  });

  it('is a no-op towards the network without SENTRY_DSN', async () => {
    vi.stubEnv('SENTRY_DSN', '');
    await onRequestError(error, request, context);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('posts to Sentry when SENTRY_DSN is set, still without personal data', async () => {
    vi.stubEnv('SENTRY_DSN', 'https://pub@o7.ingest.sentry.io/321');
    await onRequestError(error, request, context);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('https://o7.ingest.sentry.io/api/321/envelope/');
    for (const secret of ['SESSIONSECRET', 'BEARERSECRET123', 'user@example.com']) {
      expect(init.body).not.toContain(secret);
    }
  });

  it('never throws, even if Sentry is down', async () => {
    vi.stubEnv('SENTRY_DSN', 'https://pub@o7.ingest.sentry.io/321');
    fetchMock.mockRejectedValue(new Error('down'));
    await expect(onRequestError(error, request, context)).resolves.toBeUndefined();
  });
});
