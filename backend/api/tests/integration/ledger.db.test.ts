import { afterAll, beforeAll, describe, expect, it } from "vitest";
import pg from "pg";
import { gameLossTxn, gameStartTxn, gameWinTxn, type LedgerTransaction } from "../../src";
import { money } from "@genia/types";

const url = process.env.DATABASE_URL;

/** Runs only when DATABASE_URL points at a migrated database (CI backend workflow does this). */
describe.skipIf(!url)("ledger in PostgreSQL", () => {
  const pool = new pg.Pool({ connectionString: url });
  const run = Math.random().toString(36).slice(2, 10);

  beforeAll(async () => {
    await pool.query("select 1 from ledger_entries limit 1");
  });
  afterAll(async () => {
    await pool.end();
  });

  async function post(t: LedgerTransaction): Promise<void> {
    const c = await pool.connect();
    try {
      await c.query("begin");
      const { rows } = await c.query<{ id: string }>(
        "insert into ledger_transactions (type, idempotency_key) values ($1, $2) returning id",
        [t.type, `${run}:${t.idempotencyKey}`],
      );
      const id = rows[0]!.id;
      for (const e of t.entries) {
        await c.query(
          "insert into ledger_entries (txn_id, account, direction, amount_minor, currency) values ($1,$2,$3,$4,$5)",
          [id, e.account, e.direction, e.amountMinor, e.currency],
        );
      }
      await c.query("commit");
    } catch (err) {
      await c.query("rollback");
      throw err;
    } finally {
      c.release();
    }
  }

  it("commits a balanced game start and win", async () => {
    await post(gameStartTxn("u1", `a-${run}`, money(500, "RWF")));
    await post(gameWinTxn("u1", `a-${run}`, money(500, "RWF"), money(1000, "RWF")));
  });

  it("rejects an unbalanced transaction at commit", async () => {
    const bad: LedgerTransaction = {
      type: "BAD",
      idempotencyKey: `bad-${run}`,
      entries: [
        { account: "a", direction: "DEBIT", amountMinor: 100, currency: "RWF" },
        { account: "b", direction: "CREDIT", amountMinor: 90, currency: "RWF" },
      ],
    };
    await expect(post(bad)).rejects.toThrow(/unbalanced ledger transaction/);
  });

  it("rejects a duplicate idempotency key (a game cannot settle twice)", async () => {
    const key = `dup-${run}`;
    await post(gameLossTxn("u2", key, money(300, "RWF")));
    await expect(post(gameLossTxn("u2", key, money(300, "RWF")))).rejects.toThrow(
      /unique|duplicate/i,
    );
  });

  it("rejects zero and negative amounts", async () => {
    await expect(
      pool.query(
        "insert into ledger_entries (txn_id, account, direction, amount_minor, currency) select id,'x','DEBIT',0,'RWF' from ledger_transactions limit 1",
      ),
    ).rejects.toThrow(/check/i);
  });

  it("is append-only: updates and deletes are blocked", async () => {
    await expect(
      pool.query("update ledger_entries set amount_minor = amount_minor + 1"),
    ).rejects.toThrow(/append-only/);
    await expect(pool.query("delete from ledger_entries")).rejects.toThrow(/append-only/);
    await expect(pool.query("delete from ledger_transactions")).rejects.toThrow(/append-only/);
  });

  it("keeps the whole ledger summing to zero per currency", async () => {
    const { rows } = await pool.query(
      "select currency, sum(case direction when 'DEBIT' then amount_minor else -amount_minor end)::text as net from ledger_entries group by currency",
    );
    for (const r of rows) expect(r.net).toBe("0");
  });

  it("serialises concurrent settlements of the same game (exactly one wins)", async () => {
    const gameId = `race-${run}`;
    const results = await Promise.allSettled(
      Array.from({ length: 8 }, () => post(gameLossTxn("u3", gameId, money(100, "RWF")))),
    );
    expect(results.filter((r) => r.status === "fulfilled")).toHaveLength(1);
  });
});
