/// <reference types="jest" />
import { RateLimiter } from '../rate-limit';

describe('RateLimiter', () => {
  let rateLimiter: RateLimiter;

  beforeEach(() => {
    // Since it's a singleton, we should clear state or use unique IDs.
    // However, RateLimiter doesn't expose a clear method.
    // For testing, we can access the private instance if we cast to any,
    // or just rely on unique identifiers for isolation.
    rateLimiter = RateLimiter.getInstance();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should allow requests within limit', () => {
    const id = 'test-ip-1';
    // Limit: 2 requests per 1000ms
    expect(rateLimiter.check(id, 2, 1000)).toBe(true);
    expect(rateLimiter.check(id, 2, 1000)).toBe(true);
  });

  it('should block requests exceeding limit', () => {
    const id = 'test-ip-2';
    // Limit: 2 requests per 1000ms
    expect(rateLimiter.check(id, 2, 1000)).toBe(true);
    expect(rateLimiter.check(id, 2, 1000)).toBe(true);
    // 3rd request should fail
    expect(rateLimiter.check(id, 2, 1000)).toBe(false);
  });

  it('should reset limit after window expires', () => {
    jest.useFakeTimers();
    const id = 'test-ip-3';

    // Use up the limit (1 request)
    expect(rateLimiter.check(id, 1, 1000)).toBe(true);
    expect(rateLimiter.check(id, 1, 1000)).toBe(false);

    // Fast-forward time past the window
    jest.advanceTimersByTime(1100);

    // Should be allowed again (new window)
    expect(rateLimiter.check(id, 1, 1000)).toBe(true);
  });

  it('should prune expired entries without error', () => {
    jest.useFakeTimers();
    const id = 'test-ip-4';

    rateLimiter.check(id, 1, 1000);

    // Fast-forward time
    jest.advanceTimersByTime(1100);

    expect(() => rateLimiter.prune()).not.toThrow();
  });
});
