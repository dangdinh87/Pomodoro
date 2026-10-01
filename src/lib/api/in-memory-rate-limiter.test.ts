/**
 * @jest-environment node
 */
import {
  consumeRateLimit,
  getClientIp,
  resetRateLimitsForTests,
} from './in-memory-rate-limiter';

describe('consumeRateLimit', () => {
  beforeEach(() => resetRateLimitsForTests());

  it('allows up to the limit within a window, then blocks', () => {
    const now = 1_000_000;
    expect(consumeRateLimit('k', 2, 60_000, now).allowed).toBe(true);
    expect(consumeRateLimit('k', 2, 60_000, now + 1).allowed).toBe(true);

    const blocked = consumeRateLimit('k', 2, 60_000, now + 2);
    expect(blocked.allowed).toBe(false);
    expect(blocked.retryAfterSec).toBe(60);
  });

  it('resets after the window elapses', () => {
    const now = 1_000_000;
    consumeRateLimit('k', 1, 60_000, now);
    expect(consumeRateLimit('k', 1, 60_000, now + 59_999).allowed).toBe(false);
    expect(consumeRateLimit('k', 1, 60_000, now + 60_000).allowed).toBe(true);
  });

  it('does not let a flood of new keys reset a limited client', () => {
    expect(consumeRateLimit('victim', 1, 60_000, 0).allowed).toBe(true);
    expect(consumeRateLimit('attacker-target', 1, 60_000, 1).allowed).toBe(true);
    expect(consumeRateLimit('attacker-target', 1, 60_000, 2).allowed).toBe(false);

    // Fill well past the tracked-key cap; only the oldest keys get evicted
    for (let i = 0; i < 10_100; i++) consumeRateLimit(`spoofed-${i}`, 1, 60_000, 3);

    // The newest keys survive eviction, so a just-limited key stays limited
    expect(consumeRateLimit('spoofed-10099', 1, 60_000, 4).allowed).toBe(false);
  });

  it('tracks keys independently', () => {
    consumeRateLimit('a', 1, 60_000, 0);
    expect(consumeRateLimit('a', 1, 60_000, 1).allowed).toBe(false);
    expect(consumeRateLimit('b', 1, 60_000, 1).allowed).toBe(true);
  });
});

describe('getClientIp', () => {
  const requestWith = (headers: Record<string, string>) =>
    new Request('http://localhost/api/feedback', { headers });

  it('uses the first x-forwarded-for hop', () => {
    expect(getClientIp(requestWith({ 'x-forwarded-for': '203.0.113.7, 10.0.0.1' }))).toBe(
      '203.0.113.7',
    );
  });

  it('falls back to x-real-ip, then "unknown"', () => {
    expect(getClientIp(requestWith({ 'x-real-ip': '198.51.100.2' }))).toBe('198.51.100.2');
    expect(getClientIp(requestWith({}))).toBe('unknown');
  });
});
