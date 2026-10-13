import { describe, expect, it } from "vitest";
import { LOCALES, flattenKeys, getMessages, isLocale } from "../src";

describe("message catalogues", () => {
  const base = flattenKeys(getMessages("en") as unknown as Record<string, unknown>).sort();

  for (const locale of LOCALES) {
    it(`${locale} has exactly the same keys as en`, () => {
      const keys = flattenKeys(getMessages(locale) as unknown as Record<string, unknown>).sort();
      expect(keys).toEqual(base);
    });

    it(`${locale} has no empty strings`, () => {
      const flat = JSON.stringify(getMessages(locale));
      expect(flat).not.toContain('""');
    });
  }

  it("keeps ICU placeholders consistent across locales", () => {
    const placeholders = (s: string) => (s.match(/\{[a-zA-Z]+\}/g) ?? []).sort().join(",");
    const en = getMessages("en");
    for (const locale of LOCALES) {
      const m = getMessages(locale);
      expect(placeholders(m.game.question)).toBe(placeholders(en.game.question));
      expect(placeholders(m.game.seconds)).toBe(placeholders(en.game.seconds));
    }
  });

  it("detects valid locales", () => {
    expect(isLocale("rw")).toBe(true);
    expect(isLocale("xx")).toBe(false);
  });
});
