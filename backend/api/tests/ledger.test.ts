import { describe, expect, it } from "vitest";
import { money } from "@genia/types";
import {
  LedgerError,
  assertBalanced,
  depositTxn,
  gameLossTxn,
  gameRefundTxn,
  gameStartTxn,
  gameWinTxn,
  withdrawalCompleteTxn,
  withdrawalFailTxn,
  withdrawalRequestTxn,
  type LedgerEntry,
} from "../src";

const R = (n: number) => money(n, "RWF");

describe("ledger invariants", () => {
  it("accepts balanced entries", () => {
    expect(() => assertBalanced(depositTxn("u1", "mtn", R(1000), "k").entries)).not.toThrow();
  });

  it("rejects unbalanced entries", () => {
    const bad: LedgerEntry[] = [
      { account: "a", direction: "DEBIT", amountMinor: 100, currency: "RWF" },
      { account: "b", direction: "CREDIT", amountMinor: 90, currency: "RWF" },
    ];
    expect(() => assertBalanced(bad)).toThrow(LedgerError);
  });

  it("rejects zero, negative and fractional amounts", () => {
    for (const amountMinor of [0, -5, 1.5]) {
      const bad: LedgerEntry[] = [
        { account: "a", direction: "DEBIT", amountMinor, currency: "RWF" },
        { account: "b", direction: "CREDIT", amountMinor, currency: "RWF" },
      ];
      expect(() => assertBalanced(bad)).toThrow(LedgerError);
    }
  });

  it("requires balance per currency independently", () => {
    const mixed: LedgerEntry[] = [
      { account: "a", direction: "DEBIT", amountMinor: 100, currency: "RWF" },
      { account: "b", direction: "CREDIT", amountMinor: 100, currency: "USD" },
    ];
    expect(() => assertBalanced(mixed)).toThrow(LedgerError);
  });

  it("requires an idempotency key", () => {
    expect(() => depositTxn("u1", "mtn", R(100), "")).toThrow(LedgerError);
  });
});

describe("game postings", () => {
  it("start moves entry from cash to hold", () => {
    const t = gameStartTxn("u1", "g1", R(500));
    expect(t.entries).toEqual([
      { account: "user:u1:cash", direction: "DEBIT", amountMinor: 500, currency: "RWF" },
      { account: "user:u1:hold", direction: "CREDIT", amountMinor: 500, currency: "RWF" },
    ]);
    expect(t.idempotencyKey).toBe("game:g1:start");
  });

  it("win pays 2x: hold released plus reserve pays the extra", () => {
    const t = gameWinTxn("u1", "g1", R(500), R(1000));
    const reserve = t.entries.find((x) => x.account === "platform:payout_reserve");
    expect(reserve).toMatchObject({ direction: "DEBIT", amountMinor: 500 });
    expect(() => assertBalanced(t.entries)).not.toThrow();
  });

  it("win with prize equal to entry has no reserve movement", () => {
    const t = gameWinTxn("u1", "g1", R(500), R(500));
    expect(t.entries.some((x) => x.account === "platform:payout_reserve")).toBe(false);
  });

  it("win with prize below entry is invalid", () => {
    expect(() => gameWinTxn("u1", "g1", R(500), R(400))).toThrow(LedgerError);
  });

  it("loss moves the hold to revenue; refund returns it to cash", () => {
    expect(gameLossTxn("u1", "g1", R(500)).entries[1]?.account).toBe("platform:revenue");
    expect(gameRefundTxn("u1", "g1", R(500)).entries[1]?.account).toBe("user:u1:cash");
  });

  it("settlement transactions share one idempotency key so a game cannot settle twice", () => {
    const keys = new Set([
      gameWinTxn("u1", "g1", R(500), R(1000)).idempotencyKey,
      gameLossTxn("u1", "g1", R(500)).idempotencyKey,
      gameRefundTxn("u1", "g1", R(500)).idempotencyKey,
    ]);
    expect(keys.size).toBe(1);
  });
});

describe("withdrawal postings", () => {
  it("request, complete and fail are all balanced", () => {
    for (const t of [
      withdrawalRequestTxn("u1", "w1", R(5000)),
      withdrawalCompleteTxn("u1", "w1", "mtn", R(5000)),
      withdrawalFailTxn("u1", "w1", R(5000)),
    ]) {
      expect(() => assertBalanced(t.entries)).not.toThrow();
    }
  });
});

describe("randomised: every generated transaction is balanced", () => {
  it("holds for 500 random games", () => {
    for (let i = 0; i < 500; i++) {
      const entry = 1 + Math.floor(Math.random() * 100000);
      const prize = entry + Math.floor(Math.random() * entry * 3);
      for (const t of [
        gameStartTxn("u", `g${i}`, R(entry)),
        gameWinTxn("u", `g${i}`, R(entry), R(prize)),
        gameLossTxn("u", `g${i}`, R(entry)),
      ]) {
        expect(() => assertBalanced(t.entries)).not.toThrow();
      }
    }
  });
});
