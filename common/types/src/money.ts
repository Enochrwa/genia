import { z } from "zod";

/** Money is always integer minor units plus an ISO 4217 currency code. Never floats. */
export interface Money {
  readonly amount: number;
  readonly currency: string;
}

export const CurrencySchema = z
  .string()
  .regex(/^[A-Z]{3}$/, "currency must be ISO 4217 (e.g. RWF)");

export const MoneySchema = z.object({
  amount: z.number().int().safe(),
  currency: CurrencySchema,
});

export class MoneyError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MoneyError";
  }
}

export function money(amount: number, currency: string): Money {
  if (!Number.isSafeInteger(amount)) throw new MoneyError("amount must be a safe integer");
  if (!/^[A-Z]{3}$/.test(currency)) throw new MoneyError("invalid currency code");
  return { amount, currency };
}

function assertSameCurrency(a: Money, b: Money): void {
  if (a.currency !== b.currency) {
    throw new MoneyError(`currency mismatch: ${a.currency} vs ${b.currency}`);
  }
}

export function add(a: Money, b: Money): Money {
  assertSameCurrency(a, b);
  return money(a.amount + b.amount, a.currency);
}

export function subtract(a: Money, b: Money): Money {
  assertSameCurrency(a, b);
  return money(a.amount - b.amount, a.currency);
}

export function isNegative(a: Money): boolean {
  return a.amount < 0;
}

/** Locale-aware display. RWF has no minor units, so amounts are shown as whole numbers. */
export function formatMoney(m: Money, locale = "en"): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: m.currency,
    maximumFractionDigits: 0,
  }).format(m.amount);
}
