import type { Clock } from "./clock";

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
}

export interface RateLimiter {
  /** Counts one hit against `key` in a fixed window and reports whether it is still allowed. */
  hit(key: string, limit: number, windowSeconds: number): Promise<RateLimitResult>;
}

/** In-memory fixed-window limiter for unit tests and single-process development. */
export class MemoryRateLimiter implements RateLimiter {
  private readonly buckets = new Map<string, { count: number; resetAt: number }>();
  constructor(private readonly clock: Clock) {}

  async hit(key: string, limit: number, windowSeconds: number): Promise<RateLimitResult> {
    const now = this.clock.now().getTime();
    let b = this.buckets.get(key);
    if (!b || b.resetAt <= now) {
      b = { count: 0, resetAt: now + windowSeconds * 1000 };
      this.buckets.set(key, b);
    }
    b.count += 1;
    return {
      allowed: b.count <= limit,
      remaining: Math.max(0, limit - b.count),
      retryAfterSeconds: Math.max(1, Math.ceil((b.resetAt - now) / 1000)),
    };
  }
}
