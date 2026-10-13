import { describe, expect, it } from "vitest";
import { contrastRatio, statusChip, tokens } from "../src";

describe("design tokens", () => {
  it("body text meets WCAG AA contrast (4.5:1)", () => {
    expect(contrastRatio(tokens.color.text, tokens.color.background)).toBeGreaterThanOrEqual(4.5);
  });
  it("primary on background meets AA", () => {
    expect(contrastRatio(tokens.color.primary, tokens.color.background)).toBeGreaterThanOrEqual(
      4.5,
    );
  });
  it("defines all four transaction states", () => {
    expect(Object.keys(statusChip).sort()).toEqual([
      "COMPLETED",
      "FAILED",
      "PENDING",
      "PROCESSING",
    ]);
  });
});
