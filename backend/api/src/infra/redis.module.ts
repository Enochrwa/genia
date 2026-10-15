import { Global, Inject, Module, type OnApplicationShutdown } from "@nestjs/common";
import { Redis } from "ioredis";
import { CONFIG, REDIS, RATE_LIMITER } from "../common/tokens";
import type { AppConfig } from "../config/config";
import type { RateLimitResult, RateLimiter } from "../domain/auth/rate-limit";

// Atomic fixed window: INCR, set expiry on first hit, return count and remaining TTL.
const SCRIPT = `
local n = redis.call('INCR', KEYS[1])
if n == 1 then redis.call('EXPIRE', KEYS[1], ARGV[1]) end
local ttl = redis.call('TTL', KEYS[1])
if ttl < 0 then redis.call('EXPIRE', KEYS[1], ARGV[1]); ttl = tonumber(ARGV[1]) end
return {n, ttl}
`;

export class RedisRateLimiter implements RateLimiter {
  constructor(
    private readonly redis: Redis,
    private readonly namespace = "",
  ) {}
  async hit(key: string, limit: number, windowSeconds: number): Promise<RateLimitResult> {
    const [count, ttl] = (await this.redis.eval(
      SCRIPT,
      1,
      `rl:${this.namespace}${key}`,
      windowSeconds,
    )) as [number, number];
    return {
      allowed: count <= limit,
      remaining: Math.max(0, limit - count),
      retryAfterSeconds: Math.max(1, ttl),
    };
  }
}

@Global()
@Module({
  providers: [
    {
      provide: REDIS,
      inject: [CONFIG],
      useFactory: (config: AppConfig) =>
        new Redis(config.REDIS_URL, { maxRetriesPerRequest: 2, lazyConnect: false }),
    },
    {
      provide: RATE_LIMITER,
      inject: [REDIS, CONFIG],
      useFactory: (redis: Redis, config: AppConfig) =>
        new RedisRateLimiter(
          redis,
          config.RATE_LIMIT_NAMESPACE ? `${config.RATE_LIMIT_NAMESPACE}:` : "",
        ),
    },
  ],
  exports: [REDIS, RATE_LIMITER],
})
export class RedisModule implements OnApplicationShutdown {
  constructor(@Inject(REDIS) private readonly redis: Redis) {}
  async onApplicationShutdown(): Promise<void> {
    await this.redis.quit();
  }
}
