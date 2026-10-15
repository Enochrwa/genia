import { Inject, Injectable } from "@nestjs/common";
import type pg from "pg";
import { PG_POOL } from "../../common/tokens";

export interface SessionRow {
  id: string;
  user_id: string;
  device_id: string | null;
  user_agent: string | null;
  created_at: Date;
  last_seen_at: Date;
  revoked_at: Date | null;
}

export interface RefreshTokenRow {
  id: string;
  session_id: string;
  expires_at: Date;
  used_at: Date | null;
  revoked_at: Date | null;
  user_id: string;
}

@Injectable()
export class SessionsRepository {
  constructor(@Inject(PG_POOL) private readonly pool: pg.Pool) {}

  /** Creates a session and its first refresh token atomically. */
  async create(input: {
    userId: string;
    deviceId: string | null;
    userAgent: string | null;
    ip: string | null;
    refreshHash: string;
    refreshExpiresAt: Date;
    now: Date;
  }): Promise<string> {
    const c = await this.pool.connect();
    try {
      await c.query("begin");
      const s = await c.query<{ id: string }>(
        `insert into sessions (user_id, device_id, user_agent, ip, created_at, last_seen_at)
         values ($1, $2, $3, $4, $5, $5) returning id`,
        [input.userId, input.deviceId, input.userAgent?.slice(0, 300) ?? null, input.ip, input.now],
      );
      const id = s.rows[0]!.id;
      await c.query(
        "insert into refresh_tokens (session_id, token_hash, created_at, expires_at) values ($1, $2, $3, $4)",
        [id, input.refreshHash, input.now, input.refreshExpiresAt],
      );
      await c.query("commit");
      return id;
    } catch (err) {
      await c.query("rollback");
      throw err;
    } finally {
      c.release();
    }
  }

  async findRefreshToken(hash: string): Promise<RefreshTokenRow | null> {
    const { rows } = await this.pool.query<RefreshTokenRow>(
      `select r.id, r.session_id, r.expires_at, r.used_at, s.revoked_at, s.user_id
         from refresh_tokens r join sessions s on s.id = r.session_id
        where r.token_hash = $1`,
      [hash],
    );
    return rows[0] ?? null;
  }

  /** Marks a refresh token as used. Returns false if someone else already used it (race or replay). */
  async markRefreshUsed(id: string, now: Date): Promise<boolean> {
    const r = await this.pool.query(
      "update refresh_tokens set used_at = $2 where id = $1 and used_at is null",
      [id, now],
    );
    return r.rowCount === 1;
  }

  async addRefreshToken(
    sessionId: string,
    hash: string,
    now: Date,
    expiresAt: Date,
  ): Promise<void> {
    await this.pool.query(
      "insert into refresh_tokens (session_id, token_hash, created_at, expires_at) values ($1, $2, $3, $4)",
      [sessionId, hash, now, expiresAt],
    );
    await this.pool.query("update sessions set last_seen_at = $2 where id = $1", [sessionId, now]);
  }

  async revoke(sessionId: string, reason: string, now: Date): Promise<boolean> {
    const r = await this.pool.query(
      "update sessions set revoked_at = $2, revoke_reason = $3 where id = $1 and revoked_at is null",
      [sessionId, now, reason],
    );
    return r.rowCount === 1;
  }

  async revokeAllForUser(
    userId: string,
    reason: string,
    now: Date,
    exceptSessionId?: string,
  ): Promise<number> {
    const r = await this.pool.query(
      `update sessions set revoked_at = $2, revoke_reason = $3
        where user_id = $1 and revoked_at is null and ($4::uuid is null or id <> $4::uuid)`,
      [userId, now, reason, exceptSessionId ?? null],
    );
    return r.rowCount ?? 0;
  }

  async isActive(sessionId: string, userId: string): Promise<boolean> {
    const { rows } = await this.pool.query(
      `select 1 from sessions s join users u on u.id = s.user_id
        where s.id = $1 and s.user_id = $2 and s.revoked_at is null and u.status in ('ACTIVE', 'SELF_EXCLUDED')`,
      [sessionId, userId],
    );
    return rows.length === 1;
  }

  async listActive(userId: string): Promise<SessionRow[]> {
    const { rows } = await this.pool.query<SessionRow>(
      `select id, user_id, device_id, user_agent, created_at, last_seen_at, revoked_at
         from sessions where user_id = $1 and revoked_at is null order by last_seen_at desc`,
      [userId],
    );
    return rows;
  }
}
