/**
 * Simple in-memory rate limiter for Next.js API routes.
 *
 * Note: This state is per-instance (lambda/serverless execution environment).
 * It is not a distributed rate limiter (like Redis).
 * It is effective for short-term spam bursts on a single instance.
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

export class RateLimiter {
  private static instance: RateLimiter;
  private hits: Map<string, RateLimitEntry>;

  private constructor() {
    this.hits = new Map();
  }

  public static getInstance(): RateLimiter {
    if (!RateLimiter.instance) {
      RateLimiter.instance = new RateLimiter();
    }
    return RateLimiter.instance;
  }

  /**
   * Check if a request is allowed.
   * @param identifier Unique identifier for the user (e.g., IP address).
   * @param limit Max requests allowed in the window.
   * @param windowMs Time window in milliseconds.
   * @returns true if allowed, false if limit exceeded.
   */
  public check(identifier: string, limit: number, windowMs: number): boolean {
    const now = Date.now();
    const entry = this.hits.get(identifier);

    // If no entry or expired, reset
    if (!entry || now > entry.resetTime) {
      this.hits.set(identifier, {
        count: 1,
        resetTime: now + windowMs,
      });
      return true;
    }

    // Increment count
    entry.count += 1;
    this.hits.set(identifier, entry);

    // Check limit
    return entry.count <= limit;
  }

  /**
   * Clean up expired entries to prevent memory leaks.
   * Can be called periodically or on every request (with a probability).
   */
  public prune() {
    const now = Date.now();
    this.hits.forEach((value, key) => {
      if (now > value.resetTime) {
        this.hits.delete(key);
      }
    });
  }
}

// Export a singleton instance for convenience
export const rateLimiter = RateLimiter.getInstance();
