import { Inject, Injectable } from "@nestjs/common";
import type pg from "pg";
import { PG_POOL } from "../../common/tokens";

export interface OtpRow {
  id: string;
  code_hash: string;
  attempts: number;
  expires_at: Date;
}

@Injectable()
export class OtpRepository {
  constructor(@Inject(PG_POOL) private readonly pool: pg.Pool) {}

  /** Creates a new challenge and invalidates earlier open ones for the phone. */
  async create(
    phone: string,
    codeHash: string,
    expiresAt: Date,
    ip: string | null,
    now: Date,
  ): Promise<string> {
    const c = await this.pool.connect();
    try {
      await c.query("begin");
      await c.query(
        "update otp_challenges set consumed_at = $2 where phone_e164 = $1 and consumed_at is null",
        [phone, now],
      );
      const r = await c.query<{ id: string }>(
        `insert into otp_challenges (phone_e164, code_hash, expires_at, requested_ip, created_at)
         values ($1, $2, $3, $4, $5) returning id`,
        [phone, codeHash, expiresAt, ip, now],
      );
      await c.query("commit");
      return r.rows[0]!.id;
    } catch (err) {
      await c.query("rollback");
      throw err;
    } finally {
      c.release();
    }
  }

  async invalidate(id: string, now: Date): Promise<void> {
    await this.pool.query(
      "update otp_challenges set consumed_at = $2 where id = $1 and consumed_at is null",
      [id, now],
    );
  }

  async latestOpen(phone: string, now: Date): Promise<OtpRow | null> {
    const { rows } = await this.pool.query<OtpRow>(
      `select id, code_hash, attempts, expires_at from otp_challenges
        where phone_e164 = $1 and consumed_at is null and expires_at > $2
        order by created_at desc limit 1`,
      [phone, now],
    );
    return rows[0] ?? null;
  }

  /** Atomically counts an attempt and returns the new total. */
  async incrementAttempts(id: string): Promise<number> {
    const { rows } = await this.pool.query<{ attempts: number }>(
      "update otp_challenges set attempts = attempts + 1 where id = $1 returning attempts",
      [id],
    );
    return rows[0]?.attempts ?? Number.MAX_SAFE_INTEGER;
  }

  /** Single-use: only one caller can consume a challenge. */
  async consume(id: string, now: Date): Promise<boolean> {
    const r = await this.pool.query(
      "update otp_challenges set consumed_at = $2 where id = $1 and consumed_at is null and expires_at > $2",
      [id, now],
    );
    return r.rowCount === 1;
  }
}
