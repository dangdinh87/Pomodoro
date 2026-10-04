/** @vitest-environment node */
import { resetRateLimitsForTests } from '@/lib/api/in-memory-rate-limiter';
import { reportError } from '@/lib/observability/error-reporter';
import { POST } from './route';

vi.mock('@/lib/observability/error-reporter', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/lib/observability/error-reporter')>()),
  reportError: vi.fn().mockResolvedValue(undefined),
}));

const URL_ = 'http://localhost/api/client-error';
const send = (body: unknown, init: RequestInit = {}) =>
  POST(
    new Request(URL_, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-forwarded-for': '203.0.113.7', ...(init.headers ?? {}) },
      body: typeof body === 'string' ? body : JSON.stringify(body),
    }),
  );

const VALID = { boundary: 'route-error', message: 'Cannot read properties of undefined', name: 'TypeError', digest: 'abc', stack: 'at f (a.js:1:1)', path: '/vi' };

beforeEach(() => {
  resetRateLimitsForTests();
  vi.mocked(reportError).mockClear();
});

describe('POST /api/client-error', () => {
  it('accepts a report, answers 204 and hands it to the reporter as a client error', async () => {
    const res = await send(VALID);
    expect(res.status).toBe(204);
    expect(reportError).toHaveBeenCalledTimes(1);
    expect(vi.mocked(reportError).mock.calls[0][0]).toMatchObject({
      source: 'client',
      message: 'Cannot read properties of undefined',
      name: 'TypeError',
      digest: 'abc',
      route: '/vi',
      tags: { boundary: 'route-error' },
    });
  });

  it('rejects malformed input with 400 and reports nothing', async () => {
    expect((await send('{not json')).status).toBe(400);
    expect((await send([])).status).toBe(400);
    expect((await send({ ...VALID, boundary: 'other' })).status).toBe(400);
    expect((await send({ ...VALID, message: '' })).status).toBe(400);
    expect((await send({ ...VALID, message: 42 })).status).toBe(400);
    expect((await send({ ...VALID, stack: 's'.repeat(7000) })).status).toBe(400);
    expect((await send({ ...VALID, digest: { a: 1 } })).status).toBe(400);
    expect(reportError).not.toHaveBeenCalled();
  });

  it('answers 413 to a body over the size cap', async () => {
    const res = await send(JSON.stringify({ ...VALID, message: 'x'.repeat(20_000) }));
    expect(res.status).toBe(413);
    expect(reportError).not.toHaveBeenCalled();
  });

  it('is same-origin and JSON only', async () => {
    expect((await send(VALID, { headers: { Origin: 'https://evil.example', Host: 'localhost' } })).status).toBe(403);
    expect((await send(VALID, { headers: { 'Content-Type': 'text/plain' } })).status).toBe(403);
    expect(reportError).not.toHaveBeenCalled();
  });

  it('rate limits per IP (20 a minute) and tells the client when to come back', async () => {
    for (let i = 0; i < 20; i++) expect((await send(VALID)).status).toBe(204);
    const limited = await send(VALID);
    expect(limited.status).toBe(429);
    expect(Number(limited.headers.get('Retry-After'))).toBeGreaterThan(0);
    // another address is unaffected
    expect((await send(VALID, { headers: { 'x-forwarded-for': '198.51.100.9' } })).status).toBe(204);
  });
});
