/** @vitest-environment node */
import { buildSentryEnvelope, parseSentryDsn, sendToSentry } from './sentry';
import type { ErrorReport } from './error-reporter';

const REPORT: ErrorReport = {
  source: 'server',
  level: 'error',
  name: 'TypeError',
  message: 'x is not a function',
  digest: 'd123',
  route: '/app/api/tasks/route',
  method: 'POST',
};

describe('parseSentryDsn', () => {
  it('derives the envelope endpoint and public key', () => {
    expect(parseSentryDsn('https://abc123@o42.ingest.sentry.io/456')).toEqual({
      endpoint: 'https://o42.ingest.sentry.io/api/456/envelope/',
      publicKey: 'abc123',
      dsn: 'https://abc123@o42.ingest.sentry.io/456',
    });
  });

  it('drops a legacy secret, keeps a path prefix and a port', () => {
    const target = parseSentryDsn('http://pub:secret@sentry.example.com:9000/errors/7');
    expect(target?.endpoint).toBe('http://sentry.example.com:9000/errors/api/7/envelope/');
    expect(target?.publicKey).toBe('pub');
    expect(target?.dsn).not.toContain('secret');
  });

  it.each([undefined, '', '   ', 'not a url', 'ftp://k@host/1', 'https://host/1', 'https://k@host/', 'https://k@host/abc'])(
    'is null for %j',
    (dsn) => expect(parseSentryDsn(dsn)).toBeNull(),
  );
});

describe('buildSentryEnvelope', () => {
  const target = parseSentryDsn('https://abc123@o42.ingest.sentry.io/456')!;

  it('is three newline separated JSON lines: envelope header, item header, event', () => {
    const body = buildSentryEnvelope(REPORT, target, {
      eventId: 'e'.repeat(32),
      now: new Date('2026-10-05T00:00:00Z'),
      environment: 'production',
      release: 'abc',
    });
    const [header, item, event] = body.split('\n').map((line) => JSON.parse(line));
    expect(header).toMatchObject({ event_id: 'e'.repeat(32), sent_at: '2026-10-05T00:00:00.000Z', dsn: target.dsn });
    expect(item).toEqual({ type: 'event' });
    expect(event).toMatchObject({
      event_id: 'e'.repeat(32),
      level: 'error',
      platform: 'javascript',
      environment: 'production',
      release: 'abc',
      transaction: '/app/api/tasks/route',
      exception: { values: [{ type: 'TypeError', value: 'x is not a function' }] },
      tags: { source: 'server', route: '/app/api/tasks/route', method: 'POST', digest: 'd123' },
    });
  });

  it('omits tags that are not set', () => {
    const body = buildSentryEnvelope({ ...REPORT, digest: undefined, method: undefined }, target, { eventId: 'a'.repeat(32), now: new Date(0) });
    const event = JSON.parse(body.split('\n')[2]);
    expect(event.tags).not.toHaveProperty('digest');
    expect(event.tags).not.toHaveProperty('method');
  });
});

describe('sendToSentry', () => {
  const target = parseSentryDsn('https://abc123@o42.ingest.sentry.io/456')!;

  it('POSTs the envelope with the public key', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(new Response(null, { status: 200 }));
    await sendToSentry(REPORT, target, { fetchImpl });
    expect(fetchImpl).toHaveBeenCalledTimes(1);
    const [url, init] = fetchImpl.mock.calls[0];
    expect(url).toBe('https://o42.ingest.sentry.io/api/456/envelope/');
    expect(init.method).toBe('POST');
    expect(init.headers['X-Sentry-Auth']).toContain('sentry_key=abc123');
    expect(init.headers['Content-Type']).toBe('application/x-sentry-envelope');
    expect(init.body.split('\n')).toHaveLength(3);
  });

  it('never throws, whatever the network does', async () => {
    await expect(sendToSentry(REPORT, target, { fetchImpl: vi.fn().mockRejectedValue(new Error('offline')) })).resolves.toBeUndefined();
    await expect(sendToSentry(REPORT, target, { fetchImpl: vi.fn().mockResolvedValue(new Response(null, { status: 500 })) })).resolves.toBeUndefined();
  });

  it('gives up after the timeout instead of hanging the request', async () => {
    const fetchImpl = vi.fn(
      (_url: RequestInfo | URL, init?: RequestInit) =>
        new Promise<Response>((_resolve, reject) => {
          init?.signal?.addEventListener('abort', () => reject(new Error('aborted')));
        }),
    );
    const started = Date.now();
    await sendToSentry(REPORT, target, { fetchImpl: fetchImpl as typeof fetch, timeoutMs: 30 });
    expect(Date.now() - started).toBeLessThan(1000);
    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });
});
