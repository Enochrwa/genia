export type TxStatus = "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";

export const statusChip: Record<TxStatus, { color: string; labelKey: string }> = {
  PENDING: { color: "#F59E0B", labelKey: "status.pending" },
  PROCESSING: { color: "#3B82F6", labelKey: "status.processing" },
  COMPLETED: { color: "#16A34A", labelKey: "status.completed" },
  FAILED: { color: "#DC2626", labelKey: "status.failed" },
};

function luminance(hex: string): number {
  const n = parseInt(hex.slice(1), 16);
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  }) as [number, number, number];
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrastRatio(fg: string, bg: string): number {
  const [a, b] = [luminance(fg), luminance(bg)].sort((x, y) => y - x) as [number, number];
  return (a + 0.05) / (b + 0.05);
}

export const tokens = {
  color: { primary: "#312E81", accent: "#F59E0B", background: "#FFFFFF", text: "#0F172A" },
  radius: { card: 12 },
  space: 4,
} as const;
