




import { redis } from "./redis";

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
}

const REDIS_PREFIX = "ratelimit:";


export async function rateLimit(
  key: string,
  maxAttempts: number,
  windowMs: number
): Promise<RateLimitResult> {
  const fullKey = `${REDIS_PREFIX}${key}`;
  try {
    
    const currentCount = await redis.incr(fullKey);

    
    if (currentCount === 1) {
      await redis.pexpire(fullKey, windowMs);
    }

    
    const ttlMs = await redis.pttl(fullKey);
    const retryAfterSeconds = ttlMs > 0 ? Math.ceil(ttlMs / 1000) : Math.ceil(windowMs / 1000);

    if (currentCount > maxAttempts) {
      return {
        allowed: false,
        remaining: 0,
        retryAfterSeconds,
      };
    }

    return {
      allowed: true,
      remaining: Math.max(0, maxAttempts - currentCount),
      retryAfterSeconds: 0,
    };
  } catch (err) {
    console.error("[Redis] Rate limiting check error for key:", key, err);
    
    return {
      allowed: true,
      remaining: 1,
      retryAfterSeconds: 0,
    };
  }
}


export async function resetRateLimit(key: string): Promise<void> {
  const fullKey = `${REDIS_PREFIX}${key}`;
  try {
    await redis.del(fullKey);
  } catch (err) {
    console.error("[Redis] Error resetting rate limit for key:", key, err);
  }
}
