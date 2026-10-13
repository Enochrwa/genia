import { describe, expect, it } from "vitest";
import { canTransitionDeposit, canTransitionWithdrawal } from "../src";

describe("deposit state machine", () => {
  it("allows the happy path", () => {
    expect(canTransitionDeposit("CREATED", "PENDING")).toBe(true);
    expect(canTransitionDeposit("PENDING", "COMPLETED")).toBe(true);
  });
  it("forbids leaving terminal states", () => {
    expect(canTransitionDeposit("COMPLETED", "PENDING")).toBe(false);
    expect(canTransitionDeposit("FAILED", "COMPLETED")).toBe(false);
  });
  it("cannot complete without pending first", () => {
    expect(canTransitionDeposit("CREATED", "COMPLETED")).toBe(false);
  });
});

describe("withdrawal state machine", () => {
  it("follows the documented flow", () => {
    expect(canTransitionWithdrawal("REQUESTED", "RISK_REVIEW")).toBe(true);
    expect(canTransitionWithdrawal("RISK_REVIEW", "APPROVED")).toBe(true);
    expect(canTransitionWithdrawal("APPROVED", "PROCESSING")).toBe(true);
    expect(canTransitionWithdrawal("PROCESSING", "COMPLETED")).toBe(true);
  });
  it("only allows reversing a failed withdrawal", () => {
    expect(canTransitionWithdrawal("FAILED", "REVERSED")).toBe(true);
    expect(canTransitionWithdrawal("COMPLETED", "REVERSED")).toBe(false);
  });
  it("cannot skip approval", () => {
    expect(canTransitionWithdrawal("REQUESTED", "PROCESSING")).toBe(false);
  });
});
