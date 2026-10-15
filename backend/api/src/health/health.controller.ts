import { Controller, Get, Inject, Res } from "@nestjs/common";
import type { Response } from "express";
import type pg from "pg";
import type { Redis } from "ioredis";
import { PG_POOL, REDIS } from "../common/tokens";

@Controller()
export class HealthController {
  constructor(
    @Inject(PG_POOL) private readonly pool: pg.Pool,
    @Inject(REDIS) private readonly redis: Redis,
  ) {}

  /** Liveness: the process is up. */
  @Get("health")
  health(): { status: "ok" } {
    return { status: "ok" };
  }

  /** Readiness: dependencies answer. Returns 503 if any check fails. */
  @Get("ready")
  async ready(
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ status: "ok" | "degraded"; checks: Record<string, "up" | "down"> }> {
    const checks: Record<string, "up" | "down"> = { database: "down", redis: "down" };
    await this.pool
      .query("select 1")
      .then(() => (checks.database = "up"))
      .catch(() => undefined);
    await this.redis
      .ping()
      .then(() => (checks.redis = "up"))
      .catch(() => undefined);
    const ok = Object.values(checks).every((v) => v === "up");
    if (!ok) res.status(503);
    return { status: ok ? "ok" : "degraded", checks };
  }
}
