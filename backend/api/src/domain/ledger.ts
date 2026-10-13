import type { Money } from "@genia/types";

/** DEBIT = value leaves the account, CREDIT = value enters the account. */
export type Direction = "DEBIT" | "CREDIT";

export interface LedgerEntry {
  account: string;
  direction: Direction;
  amountMinor: number;
  currency: string;
}

export interface LedgerTransaction {
  type: string;
  idempotencyKey: string;
  entries: LedgerEntry[];
}

export class LedgerError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "LedgerError";
  }
}

/** Invariant: per currency, total debits equal total credits, all amounts positive integers. */
export function assertBalanced(entries: readonly LedgerEntry[]): void {
  if (entries.length < 2) throw new LedgerError("a transaction needs at least two entries");
  const totals = new Map<string, number>();
  for (const e of entries) {
    if (!Number.isSafeInteger(e.amountMinor) || e.amountMinor <= 0) {
      throw new LedgerError("entry amounts must be positive safe integers");
    }
    const sign = e.direction === "DEBIT" ? 1 : -1;
    totals.set(e.currency, (totals.get(e.currency) ?? 0) + sign * e.amountMinor);
  }
  for (const [currency, net] of totals) {
    if (net !== 0) throw new LedgerError(`unbalanced transaction in ${currency}: net ${net}`);
  }
}

function build(type: string, idempotencyKey: string, entries: LedgerEntry[]): LedgerTransaction {
  if (!idempotencyKey) throw new LedgerError("idempotency key required");
  assertBalanced(entries);
  return { type, idempotencyKey, entries };
}

const e = (account: string, direction: Direction, m: Money): LedgerEntry => ({
  account,
  direction,
  amountMinor: m.amount,
  currency: m.currency,
});

export function depositTxn(userId: string, provider: string, amount: Money, key: string) {
  return build("DEPOSIT", key, [
    e(`provider:${provider}:clearing`, "DEBIT", amount),
    e(`user:${userId}:cash`, "CREDIT", amount),
  ]);
}

export function gameStartTxn(userId: string, gameId: string, entry: Money) {
  return build("GAME_START", `game:${gameId}:start`, [
    e(`user:${userId}:cash`, "DEBIT", entry),
    e(`user:${userId}:hold`, "CREDIT", entry),
  ]);
}

/** Win: release the hold to cash and pay the extra prize from the payout reserve. */
export function gameWinTxn(userId: string, gameId: string, entry: Money, prize: Money) {
  if (prize.amount < entry.amount) throw new LedgerError("prize must be at least the entry");
  const extra: Money = { amount: prize.amount - entry.amount, currency: prize.currency };
  const entries: LedgerEntry[] = [
    e(`user:${userId}:hold`, "DEBIT", entry),
    e(`user:${userId}:cash`, "CREDIT", prize),
  ];
  if (extra.amount > 0) entries.push(e("platform:payout_reserve", "DEBIT", extra));
  return build("GAME_WIN", `game:${gameId}:settle`, entries);
}

export function gameLossTxn(userId: string, gameId: string, entry: Money) {
  return build("GAME_LOSS", `game:${gameId}:settle`, [
    e(`user:${userId}:hold`, "DEBIT", entry),
    e("platform:revenue", "CREDIT", entry),
  ]);
}

export function gameRefundTxn(userId: string, gameId: string, entry: Money) {
  return build("GAME_REFUND", `game:${gameId}:settle`, [
    e(`user:${userId}:hold`, "DEBIT", entry),
    e(`user:${userId}:cash`, "CREDIT", entry),
  ]);
}

export function withdrawalRequestTxn(userId: string, wid: string, amount: Money) {
  return build("WITHDRAWAL_REQUEST", `withdrawal:${wid}:request`, [
    e(`user:${userId}:cash`, "DEBIT", amount),
    e(`user:${userId}:hold`, "CREDIT", amount),
  ]);
}

export function withdrawalCompleteTxn(
  userId: string,
  wid: string,
  provider: string,
  amount: Money,
) {
  return build("WITHDRAWAL_COMPLETE", `withdrawal:${wid}:complete`, [
    e(`user:${userId}:hold`, "DEBIT", amount),
    e(`provider:${provider}:clearing`, "CREDIT", amount),
  ]);
}

export function withdrawalFailTxn(userId: string, wid: string, amount: Money) {
  return build("WITHDRAWAL_FAIL", `withdrawal:${wid}:fail`, [
    e(`user:${userId}:hold`, "DEBIT", amount),
    e(`user:${userId}:cash`, "CREDIT", amount),
  ]);
}
