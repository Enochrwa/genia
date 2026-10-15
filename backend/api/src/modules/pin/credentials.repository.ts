import { Inject, Injectable } from "@nestjs/common";
import type pg from "pg";
import { PG_POOL } from "../../common/tokens";

export interface CredentialsRow {
  pin_hash: string | null;
  failed_pin_count: number;
  pin_locked_until: Date | null;
}

@Injectable()
export class CredentialsRepository {
  constructor(@Inject(PG_POOL) private readonly pool: pg.Pool) {}

  async get(userId: string): Promise<CredentialsRow | null> {
    const { rows } = await this.pool.query<CredentialsRow>(
      "select pin_hash, failed_pin_count, pin_locked_until from credentials where user_id = $1",
      [userId],
    );
    return rows[0] ?? null;
  }

  /** Sets the first PIN. Race-safe: returns false if a PIN already exists. */
  async setInitial(userId: string, hash: string, now: Date): Promise<boolean> {
    const r = await this.pool.query(
      `insert into credentials (user_id, pin_hash, pin_set_at) values ($1, $2, $3)
       on conflict (user_id) do update set pin_hash = excluded.pin_hash, pin_set_at = excluded.pin_set_at,
              failed_pin_count = 0, pin_locked_until = null
         where credentials.pin_hash is null`,
      [userId, hash, now],
    );
    return r.rowCount === 1;
  }

  async replace(userId: string, hash: string, now: Date): Promise<void> {
    await this.pool.query(
      "update credentials set pin_hash = $2, pin_set_at = $3, failed_pin_count = 0, pin_locked_until = null where user_id = $1",
      [userId, hash, now],
    );
  }

  /** Atomically records a failure and sets the lock when the maximum is reached. */
  async recordFailure(
    userId: string,
    maxFailures: number,
    lockUntil: Date,
  ): Promise<{ failed: number; lockedUntil: Date | null }> {
    const { rows } = await this.pool.query<{
      failed_pin_count: number;
      pin_locked_until: Date | null;
    }>(
      `update credentials set
         failed_pin_count = failed_pin_count + 1,
         pin_locked_until = case when failed_pin_count + 1 >= $2 then $3::timestamptz else pin_locked_until end
       where user_id = $1
       returning failed_pin_count, pin_locked_until`,
      [userId, maxFailures, lockUntil],
    );
    const r = rows[0]!;
    return { failed: r.failed_pin_count, lockedUntil: r.pin_locked_until };
  }

  async resetFailures(userId: string): Promise<void> {
    await this.pool.query(
      "update credentials set failed_pin_count = 0, pin_locked_until = null where user_id = $1",
      [userId],
    );
  }
}
