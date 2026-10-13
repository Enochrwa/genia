/** Prize table: number of correct answers -> payout multiplier in basis points (10000 = 1x). */
export type PrizeTable = Readonly<Record<number, number>>;

export const DEFAULT_LATENCY_GRACE_MS = 400;

/** Launch default: 3 questions, all correct pays 200% of the entry (to be confirmed by the owner). */
export const DEFAULT_PRIZE_TABLE: PrizeTable = { 3: 20000 };

export function prizeFor(entryMinor: number, correct: number, table: PrizeTable): number {
  if (!Number.isSafeInteger(entryMinor) || entryMinor <= 0) throw new RangeError("invalid entry");
  const bps = table[correct] ?? 0;
  return Math.floor((entryMinor * bps) / 10000);
}

export interface AnswerRecord {
  questionId: string;
  optionId: string | null;
  submittedAtMs: number | null;
  expiresAtMs: number;
}

export function isWithinDeadline(
  submittedAtMs: number,
  expiresAtMs: number,
  graceMs = DEFAULT_LATENCY_GRACE_MS,
): boolean {
  return submittedAtMs <= expiresAtMs + graceMs;
}

export interface Score {
  correct: number;
  wrong: number;
  unanswered: number;
  total: number;
}

/** Server-side scoring. Late or missing answers never count as correct. */
export function scoreGame(
  answers: readonly AnswerRecord[],
  correctOptions: Readonly<Record<string, string>>,
  graceMs = DEFAULT_LATENCY_GRACE_MS,
): Score {
  let correct = 0;
  let wrong = 0;
  let unanswered = 0;
  for (const a of answers) {
    if (a.optionId === null || a.submittedAtMs === null) {
      unanswered++;
    } else if (!isWithinDeadline(a.submittedAtMs, a.expiresAtMs, graceMs)) {
      unanswered++;
    } else if (correctOptions[a.questionId] === a.optionId) {
      correct++;
    } else {
      wrong++;
    }
  }
  return { correct, wrong, unanswered, total: answers.length };
}

/** Options are shuffled per game with a seeded PRNG so the order can be reproduced for disputes. */
export function seededShuffle<T>(items: readonly T[], seed: number): T[] {
  const out = [...items];
  let s = seed >>> 0;
  const rand = () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [out[i], out[j]] = [out[j] as T, out[i] as T];
  }
  return out;
}

/** A client-facing question never contains the correct answer. */
export interface PublicQuestion {
  questionId: string;
  body: string;
  options: { id: string; text: string }[];
  expiresAt: string;
}

export function toPublicQuestion(
  q: {
    id: string;
    body: string;
    options: { id: string; text: string }[];
    correctOptionId?: string;
  },
  expiresAtMs: number,
  seed: number,
): PublicQuestion {
  return {
    questionId: q.id,
    body: q.body,
    options: seededShuffle(q.options, seed).map(({ id, text }) => ({ id, text })),
    expiresAt: new Date(expiresAtMs).toISOString(),
  };
}
