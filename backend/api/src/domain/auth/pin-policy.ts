export type PinProblem = "format" | "repeated" | "sequence" | "pattern";

const isRepeated = (pin: string) => /^(\d)\1+$/.test(pin);

function isSequence(pin: string): boolean {
  const d = [...pin].map(Number);
  const step = (d[1] ?? 0) - (d[0] ?? 0);
  if (Math.abs(step) !== 1) return false;
  return d.every((v, i) => i === 0 || v - (d[i - 1] ?? 0) === step);
}

/** Repeating blocks such as 1212, 123123, 4545. */
function isPattern(pin: string): boolean {
  for (let size = 1; size <= pin.length / 2; size++) {
    if (pin.length % size === 0 && pin === pin.slice(0, size).repeat(pin.length / size))
      return true;
  }
  return false;
}

const COMMON = new Set([
  "1004",
  "2580",
  "1357",
  "2468",
  "0852",
  "1590",
  "7777",
  "2000",
  "2024",
  "2025",
  "2026",
]);

/** Returns the first problem found, or null if the PIN is acceptable. */
export function checkPin(pin: string): PinProblem | null {
  if (!/^\d{4,6}$/.test(pin)) return "format";
  if (isRepeated(pin)) return "repeated";
  if (isSequence(pin)) return "sequence";
  if (isPattern(pin) || COMMON.has(pin)) return "pattern";
  return null;
}
