import { describe, expect, it } from "vitest";
import { breakEvenAccuracy, expectedReturn, shouldRetireQuestion, winProbability } from "../src";

describe("game economics (3 questions, 200% payout)", () => {
  it("pure guessing wins 1/27", () => {
    expect(winProbability(1 / 3, 3)).toBeCloseTo(1 / 27, 10);
    expect(expectedReturn(1 / 3, 3, 2)).toBeCloseTo(0.0741, 3);
  });

  it("break-even accuracy is about 79.4%", () => {
    expect(breakEvenAccuracy(3, 2)).toBeCloseTo(0.7937, 3);
  });

  it("matches the documented table", () => {
    expect(expectedReturn(0.5, 3, 2)).toBeCloseTo(0.25, 2);
    expect(expectedReturn(0.7, 3, 2)).toBeCloseTo(0.686, 3);
    expect(expectedReturn(0.8, 3, 2)).toBeCloseTo(1.024, 3);
    expect(expectedReturn(0.9, 3, 2)).toBeCloseTo(1.458, 3);
  });

  it("rejects invalid probabilities", () => {
    expect(() => winProbability(1.2, 3)).toThrow(RangeError);
  });
});

describe("question retirement", () => {
  it("retires questions that are too easy once enough data exists", () => {
    expect(shouldRetireQuestion({ correctRate: 0.9, served: 500, reports: 0 })).toBe(true);
    expect(shouldRetireQuestion({ correctRate: 0.9, served: 20, reports: 0 })).toBe(false);
  });
  it("retires heavily reported questions", () => {
    expect(shouldRetireQuestion({ correctRate: 0.3, served: 10, reports: 5 })).toBe(true);
  });
});
