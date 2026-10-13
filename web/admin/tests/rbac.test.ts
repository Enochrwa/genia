import { describe, expect, it } from "vitest";
import { can, canApprovePayout } from "../src";

describe("admin RBAC", () => {
  it("normal users have no admin permissions", () => {
    expect(can("USER", "users.read")).toBe(false);
    expect(can("USER", "payouts.approve")).toBe(false);
  });
  it("only finance and super admin approve payouts", () => {
    expect(can("FINANCE", "payouts.approve")).toBe(true);
    expect(can("SUPER_ADMIN", "payouts.approve")).toBe(true);
    expect(can("ADMIN", "payouts.approve")).toBe(false);
    expect(can("SUPPORT", "payouts.approve")).toBe(false);
  });
  it("question managers cannot touch money or users", () => {
    expect(can("QUESTION_MANAGER", "questions.write")).toBe(true);
    expect(can("QUESTION_MANAGER", "users.suspend")).toBe(false);
  });
  it("enforces dual control on payouts", () => {
    expect(canApprovePayout("FINANCE", "a", "a")).toBe(false);
    expect(canApprovePayout("FINANCE", "a", "b")).toBe(true);
    expect(canApprovePayout("SUPPORT", "a", "b")).toBe(false);
  });
});
