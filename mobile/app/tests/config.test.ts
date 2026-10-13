import { describe, expect, it } from "vitest";
import { defaultConfig } from "../src";

describe("mobile config", () => {
  it("keeps real money disabled by default", () => {
    expect(defaultConfig().realMoneyEnabled).toBe(false);
  });
  it("allows overrides", () => {
    expect(defaultConfig({ locale: "fr" }).locale).toBe("fr");
  });
});
