import en from "../messages/en.json";
import fr from "../messages/fr.json";
import rw from "../messages/rw.json";

export const LOCALES = ["rw", "en", "fr"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "rw";

export type Messages = typeof en;

const catalogues: Record<Locale, Messages> = { en, fr, rw };

export function getMessages(locale: Locale): Messages {
  return catalogues[locale];
}

export function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value);
}

/** Flatten a nested catalogue to dotted keys (used by tests and lint tooling). */
export function flattenKeys(obj: Record<string, unknown>, prefix = ""): string[] {
  return Object.entries(obj).flatMap(([k, v]) =>
    v !== null && typeof v === "object"
      ? flattenKeys(v as Record<string, unknown>, `${prefix}${k}.`)
      : [`${prefix}${k}`],
  );
}
