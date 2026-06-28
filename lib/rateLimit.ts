// ============================================================
// Lankan Ads — In-Memory Rate Limiter
// Protects auth endpoints from brute-force and enumeration attacks
// ============================================================

interface RateLimitEntry {
  count: number;
  resetAt: number; // unix timestamp ms
}

const globalForRL = global as unknown as {
  rateLimitStore: Map<string, RateLimitEntry>;
};

// Always persist globally across hot-reloads
const store = globalForRL.rateLimitStore ?? new Map<string, RateLimitEntry>();
globalForRL.rateLimitStore = store;

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
}

/**
 * Check and record a rate-limited attempt for a given key.
 *
 * @param key        Unique identifier — e.g. `"login:0771234567"` or `"otp:ip:192.168.1.1"`
 * @param maxAttempts Maximum number of attempts allowed in the window
 * @param windowMs   Window duration in milliseconds (e.g. 15 * 60 * 1000 = 15 min)
 */
export function rateLimit(
  key: string,
  maxAttempts: number,
  windowMs: number
): RateLimitResult {
  const now = Date.now();
  const entry = store.get(key);

  // Window has expired — reset
  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: maxAttempts - 1, retryAfterSeconds: 0 };
  }

  // Within window — increment
  entry.count += 1;
  store.set(key, entry);

  if (entry.count > maxAttempts) {
    const retryAfterSeconds = Math.ceil((entry.resetAt - now) / 1000);
    return { allowed: false, remaining: 0, retryAfterSeconds };
  }

  return {
    allowed: true,
    remaining: maxAttempts - entry.count,
    retryAfterSeconds: 0,
  };
}

/**
 * Reset the rate limit for a key (e.g. on successful login)
 */
export function resetRateLimit(key: string): void {
  store.delete(key);
}
