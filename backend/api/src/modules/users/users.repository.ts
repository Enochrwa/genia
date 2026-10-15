import { Inject, Injectable } from "@nestjs/common";
import type pg from "pg";
import { PG_POOL } from "../../common/tokens";

export interface UserRow {
  id: string;
  phone_e164: string;
  country: string;
  email: string | null;
  locale: "rw" | "en" | "fr";
  status: "ACTIVE" | "SUSPENDED" | "SELF_EXCLUDED" | "CLOSED";
  kyc_level: number;
  created_at: Date;
  has_pin: boolean;
}

const SELECT = `
  select u.id, u.phone_e164, u.country, u.email, u.locale, u.status, u.kyc_level, u.created_at,
         (c.pin_hash is not null) as has_pin
    from users u left join credentials c on c.user_id = u.id`;

@Injectable()
export class UsersRepository {
  constructor(@Inject(PG_POOL) private readonly pool: pg.Pool) {}

  async findById(id: string): Promise<UserRow | null> {
    const { rows } = await this.pool.query<UserRow>(`${SELECT} where u.id = $1`, [id]);
    return rows[0] ?? null;
  }

  async findByPhone(phone: string): Promise<UserRow | null> {
    const { rows } = await this.pool.query<UserRow>(`${SELECT} where u.phone_e164 = $1`, [phone]);
    return rows[0] ?? null;
  }

  /** Race-safe: two concurrent sign-ups for the same phone produce exactly one row. */
  async createIfAbsent(input: {
    phone: string;
    country: string;
    locale: string;
    birthConfirmedAt: Date;
    now: Date;
  }): Promise<{ user: UserRow; created: boolean }> {
    const ins = await this.pool.query<{ id: string }>(
      `insert into users (phone_e164, country, locale, birth_confirmed_at, created_at, updated_at)
       values ($1, $2, $3, $4, $5, $5)
       on conflict (phone_e164) do nothing
       returning id`,
      [input.phone, input.country, input.locale, input.birthConfirmedAt, input.now],
    );
    const user = (await this.findByPhone(input.phone))!;
    return { user, created: ins.rowCount === 1 };
  }

  async updateProfile(
    id: string,
    patch: { locale?: string; email?: string | null },
    now: Date,
  ): Promise<UserRow | null> {
    await this.pool.query(
      `update users set
         locale = coalesce($2, locale),
         email = case when $3::boolean then $4 else email end,
         updated_at = $5
       where id = $1`,
      [id, patch.locale ?? null, patch.email !== undefined, patch.email ?? null, now],
    );
    return this.findById(id);
  }
}
