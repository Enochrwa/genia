import { describe, expect, it } from "vitest";
import { loadConfig } from "../src/config/config";

const base = {
  DATABASE_URL: "postgresql://u:p@localhost:5432/db",
  JWT_ACCESS_SECRET: "j".repeat(40),
  PIN_PEPPER: "p".repeat(20),
  OTP_PEPPER: "o".repeat(20),
};

describe("config", () => {
  it("loads defaults", () => {
    const c = loadConfig(base);
    expect(c).toMatchObject({
      API_PORT: 4000,
      OTP_TTL_SECONDS: 300,
      OTP_MAX_ATTEMPTS: 5,
      PIN_MAX_FAILURES: 5,
      PIN_LOCK_MINUTES: 30,
      ACCESS_TOKEN_TTL_SECONDS: 900,
      REFRESH_TOKEN_TTL_DAYS: 30,
      SMS_PROVIDER: "console",
      TRUST_PROXY: false,
    });
  });
  it("fails fast with readable messages", () => {
    expect(() => loadConfig({})).toThrow(/DATABASE_URL/);
    expect(() => loadConfig({ ...base, JWT_ACCESS_SECRET: "short" })).toThrow(
      /JWT_ACCESS_SECRET must be at least 32/,
    );
    expect(() => loadConfig({ ...base, API_PORT: "99999" })).toThrow(/API_PORT/);
  });
  it("requires an API key for Africa's Talking", () => {
    expect(() => loadConfig({ ...base, SMS_PROVIDER: "africastalking" })).toThrow(
      /AFRICAS_TALKING_API_KEY/,
    );
    expect(
      loadConfig({ ...base, SMS_PROVIDER: "africastalking", AFRICAS_TALKING_API_KEY: "k" })
        .SMS_PROVIDER,
    ).toBe("africastalking");
  });
  describe("production safety", () => {
    const prod = {
      ...base,
      NODE_ENV: "production",
      SMS_PROVIDER: "africastalking",
      AFRICAS_TALKING_API_KEY: "k",
    };
    it("accepts a sound production config", () => {
      expect(loadConfig(prod).NODE_ENV).toBe("production");
    });
    it("refuses the console SMS provider", () => {
      expect(() => loadConfig({ ...prod, SMS_PROVIDER: "console" })).toThrow(/console/);
    });
    it("refuses development placeholder secrets", () => {
      expect(() =>
        loadConfig({ ...prod, JWT_ACCESS_SECRET: "dev-only-" + "x".repeat(40) }),
      ).toThrow(/placeholder/);
      expect(() => loadConfig({ ...prod, PIN_PEPPER: "change-me-" + "x".repeat(20) })).toThrow(
        /placeholder/,
      );
    });
    it("refuses reused secrets", () => {
      expect(() => loadConfig({ ...prod, PIN_PEPPER: base.OTP_PEPPER })).toThrow(/must all differ/);
    });
  });
  it("parses booleans", () => {
    expect(loadConfig({ ...base, TRUST_PROXY: "true" }).TRUST_PROXY).toBe(true);
    expect(loadConfig({ ...base, TRUST_PROXY: "0" }).TRUST_PROXY).toBe(false);
    expect(() => loadConfig({ ...base, TRUST_PROXY: "yes" })).toThrow();
  });
});
