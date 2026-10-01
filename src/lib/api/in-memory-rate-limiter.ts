/**
 * Best-effort fixed-window rate limiter kept in module memory.
 *
 * State lives per server instance. Vercel Fluid Compute reuses instances, so
 * this still slows down a single abusive client, but it is NOT a global limit.
 * Use it only for low-stakes endpoints (e.g. anonymous feedback) and pair it
 * with a Vercel Firewall rate-limit rule for durable protection.
 */

interface RateLimitBucket {
  count: number;
  resetAt: number;
}

export interface RateLimitResult {
  allowed: boolean;
  /** Seconds until the window resets; 0 when the request is allowed. */
  retryAfterSec: number;
}

// Cap memory use if many distinct keys (IPs) show up within one window.
const MAX_TRACKED_KEYS = 10_000;

const buckets = new Map<string, RateLimitBucket>();

function pruneExpiredBuckets(now: number) {
  buckets.forEach((bucket, key) => {
    if (bucket.resetAt <= now) buckets.delete(key);
  });
  // Still full of live buckets: evict the oldest keys (Map keeps insertion
  // order) instead of clearing everything, so flooding the map with fresh keys
  // cannot reset the counters of the clients that are actually limited.
  const overflow = buckets.size - MAX_TRACKED_KEYS + 1;
  if (overflow > 0) {
    let evicted = 0;
    for (const key of Array.from(buckets.keys())) {
      if (evicted++ >= overflow) break;
      buckets.delete(key);
    }
  }
}

export function consumeRateLimit(
  key: string,
  limit: number,
  windowMs: number,
  now: number = Date.now(),
): RateLimitResult {
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    if (buckets.size >= MAX_TRACKED_KEYS) pruneExpiredBuckets(now);
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, retryAfterSec: 0 };
  }

  if (bucket.count >= limit) {
    return {
      allowed: false,
      retryAfterSec: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)),
    };
  }

  bucket.count += 1;
  return { allowed: true, retryAfterSec: 0 };
}

/** Client IP as reported by the Vercel edge (first hop of x-forwarded-for). */
export function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    const firstHop = forwardedFor.split(',')[0]?.trim();
    if (firstHop) return firstHop;
  }
  return request.headers.get('x-real-ip')?.trim() || 'unknown';
}

/** Test helper: forget all buckets. */
export function resetRateLimitsForTests() {
  buckets.clear();
}
