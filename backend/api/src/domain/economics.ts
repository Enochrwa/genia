/** Probability that a player with per-question accuracy p answers all n questions correctly. */
export function winProbability(p: number, questions: number): number {
  if (p < 0 || p > 1) throw new RangeError("p must be within [0,1]");
  return Math.pow(p, questions);
}

/** Expected return per unit staked when only a perfect game pays `multiplier` x entry. */
export function expectedReturn(p: number, questions: number, multiplier: number): number {
  return winProbability(p, questions) * multiplier;
}

/** Accuracy at which the platform breaks even on a perfect-game-only payout. */
export function breakEvenAccuracy(questions: number, multiplier: number): number {
  return Math.pow(1 / multiplier, 1 / questions);
}

/** Retire questions that are too easy (cost money) or have too many reports. */
export function shouldRetireQuestion(stats: {
  correctRate: number;
  served: number;
  reports: number;
}): boolean {
  if (stats.reports >= 5) return true;
  return stats.served >= 200 && stats.correctRate > 0.85;
}
