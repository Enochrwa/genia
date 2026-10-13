import { describe, expect, it } from "vitest";
import { add, subtract, money, MoneyError, MoneySchema, formatMoney, isNegative } from "../src";

describe("money", () => {
  it("adds and subtracts in the same currency", () => {
    expect(add(money(500, "RWF"), money(300, "RWF"))).toEqual({ amount: 800, currency: "RWF" });
    expect(subtract(money(500, "RWF"), money(700, "RWF")).amount).toBe(-200);
    expect(isNegative(subtract(money(500, "RWF"), money(700, "RWF")))).toBe(true);
  });

  it("rejects mixed currencies", () => {
    expect(() => add(money(1, "RWF"), money(1, "USD"))).toThrow(MoneyError);
  });

  it("rejects floats and unsafe integers", () => {
    expect(() => money(10.5, "RWF")).toThrow(MoneyError);
    expect(() => money(Number.MAX_SAFE_INTEGER + 2, "RWF")).toThrow(MoneyError);
  });

  it("rejects invalid currency codes", () => {
    expect(() => money(1, "rwf")).toThrow(MoneyError);
    expect(() => money(1, "RWFF")).toThrow(MoneyError);
  });

  it("validates with zod", () => {
    expect(MoneySchema.safeParse({ amount: 100, currency: "RWF" }).success).toBe(true);
    expect(MoneySchema.safeParse({ amount: 1.5, currency: "RWF" }).success).toBe(false);
  });

  it("formats without minor units", () => {
    expect(formatMoney(money(1500, "RWF"), "en")).toContain("1,500");
  });
});
