import { describe, expect, it } from "vitest";
import { entryOptions, localeFromPath } from "../src";

describe("player helpers", () => {
  it("detects locale from path with default fallback", () => {
    expect(localeFromPath("/fr/wallet")).toBe("fr");
    expect(localeFromPath("/en")).toBe("en");
    expect(localeFromPath("/unknown/x")).toBe("rw");
    expect(localeFromPath("/")).toBe("rw");
  });

  it("builds entry buttons with prizes", () => {
    const opts = entryOptions([500, 1000], 20000);
    expect(opts).toHaveLength(2);
    expect(opts[0]?.amount).toBe(500);
    expect(opts[0]?.prize).toContain("1,000");
  });
});
