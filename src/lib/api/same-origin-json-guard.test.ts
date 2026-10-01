/**
 * @vitest-environment node
 */
import { sameOriginJsonGuard } from './same-origin-json-guard';

const mk = (headers: Record<string, string>) =>
  new Request('https://app.example.com/api/x', { method: 'POST', headers });

describe('sameOriginJsonGuard', () => {
  it('allows same-origin JSON', () => {
    const req = mk({ origin: 'https://app.example.com', 'content-type': 'application/json' });
    expect(sameOriginJsonGuard(req, { requireJson: true })).toBeNull();
  });

  it('allows a missing Origin header', () => {
    expect(sameOriginJsonGuard(mk({ 'content-type': 'application/json' }), { requireJson: true })).toBeNull();
  });

  it('rejects a cross-site Origin with 403', () => {
    const res = sameOriginJsonGuard(mk({ origin: 'https://evil.test', 'content-type': 'application/json' }), {
      requireJson: true,
    });
    expect(res?.status).toBe(403);
  });

  it('rejects a malformed Origin', () => {
    expect(sameOriginJsonGuard(mk({ origin: 'not a url' }))?.status).toBe(403);
  });

  it('rejects non-JSON content types only when requireJson', () => {
    const req = mk({ 'content-type': 'text/plain' });
    expect(sameOriginJsonGuard(req, { requireJson: true })?.status).toBe(403);
    expect(sameOriginJsonGuard(req)).toBeNull();
  });

  it('honours x-forwarded-host behind a proxy', () => {
    const req = mk({ origin: 'https://www.site.com', 'x-forwarded-host': 'www.site.com' });
    expect(sameOriginJsonGuard(req)).toBeNull();
  });
});
