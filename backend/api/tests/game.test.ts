import { describe, expect, it } from "vitest";
import {
  DEFAULT_PRIZE_TABLE,
  isWithinDeadline,
  prizeFor,
  scoreGame,
  seededShuffle,
  toPublicQuestion,
  type AnswerRecord,
} from "../src";

const correctMap = { q1: "b", q2: "a", q3: "c" };
const at = (
  id: string,
  opt: string | null,
  submitted: number | null,
  expires = 12000,
): AnswerRecord => ({
  questionId: id,
  optionId: opt,
  submittedAtMs: submitted,
  expiresAtMs: expires,
});

describe("scoring (server-authoritative)", () => {
  it("counts a perfect game", () => {
    const s = scoreGame(
      [at("q1", "b", 3000), at("q2", "a", 4000), at("q3", "c", 5000)],
      correctMap,
    );
    expect(s).toEqual({ correct: 3, wrong: 0, unanswered: 0, total: 3 });
  });

  it("late answers never count as correct", () => {
    const s = scoreGame(
      [at("q1", "b", 12401), at("q2", "a", 4000), at("q3", "c", 5000)],
      correctMap,
    );
    expect(s.correct).toBe(2);
    expect(s.unanswered).toBe(1);
  });

  it("accepts answers inside the latency grace window", () => {
    expect(isWithinDeadline(12400, 12000)).toBe(true);
    expect(isWithinDeadline(12401, 12000)).toBe(false);
  });

  it("missing answers are unanswered, wrong answers are wrong", () => {
    const s = scoreGame(
      [at("q1", null, null), at("q2", "c", 1000), at("q3", "c", 1000)],
      correctMap,
    );
    expect(s).toEqual({ correct: 1, wrong: 1, unanswered: 1, total: 3 });
  });
});

describe("prize table", () => {
  it("pays 2x only for a perfect 3/3 by default", () => {
    expect(prizeFor(500, 3, DEFAULT_PRIZE_TABLE)).toBe(1000);
    expect(prizeFor(500, 2, DEFAULT_PRIZE_TABLE)).toBe(0);
    expect(prizeFor(500, 0, DEFAULT_PRIZE_TABLE)).toBe(0);
  });

  it("always returns integers", () => {
    expect(Number.isInteger(prizeFor(333, 3, { 3: 15000 }))).toBe(true);
    expect(prizeFor(333, 3, { 3: 15000 })).toBe(499);
  });

  it("rejects invalid entries", () => {
    expect(() => prizeFor(0, 3, DEFAULT_PRIZE_TABLE)).toThrow(RangeError);
    expect(() => prizeFor(1.5, 3, DEFAULT_PRIZE_TABLE)).toThrow(RangeError);
  });
});

describe("answer secrecy and shuffling", () => {
  const q = {
    id: "q1",
    body: "Which planet is the Red Planet?",
    options: [
      { id: "a", text: "Venus" },
      { id: "b", text: "Mars" },
      { id: "c", text: "Jupiter" },
    ],
    correctOptionId: "b",
  };

  it("never leaks the correct answer in the public question", () => {
    const pub = toPublicQuestion(q, Date.now() + 12000, 42);
    expect(JSON.stringify(pub)).not.toContain("correct");
    expect(Object.keys(pub).sort()).toEqual(["body", "expiresAt", "options", "questionId"]);
  });

  it("shuffle is deterministic per seed and keeps all options", () => {
    const a = seededShuffle(q.options, 7);
    const b = seededShuffle(q.options, 7);
    expect(a).toEqual(b);
    expect(a.map((o) => o.id).sort()).toEqual(["a", "b", "c"]);
  });

  it("different seeds can produce different orders", () => {
    const orders = new Set(
      Array.from({ length: 30 }, (_, s) => seededShuffle([1, 2, 3, 4], s).join()),
    );
    expect(orders.size).toBeGreaterThan(1);
  });
});
