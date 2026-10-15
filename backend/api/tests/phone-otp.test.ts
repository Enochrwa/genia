import { describe, expect, it } from "vitest";
import { generateOtp, hashOtp, otpMessage, verifyOtpHash } from "../src/domain/auth/otp";
import { maskPhone, normalizePhone } from "../src/domain/auth/phone";

describe("phone normalisation", () => {
  it("normalises Rwandan local and international formats to the same E.164", () => {
    const a = normalizePhone("0788123456");
    const b = normalizePhone("+250 788 123 456");
    const c = normalizePhone("250788123456");
    expect(a).toEqual({ e164: "+250788123456", country: "RW" });
    expect(b).toEqual(a);
    expect(c).toEqual(a);
  });
  it("keeps other countries intact", () => {
    expect(normalizePhone("+254712345678")).toEqual({ e164: "+254712345678", country: "KE" });
  });
  it("rejects invalid numbers", () => {
    expect(normalizePhone("123")).toBeNull();
    expect(normalizePhone("0788")).toBeNull();
    expect(normalizePhone("not a number")).toBeNull();
  });
  it("masks the number for logs", () => {
    expect(maskPhone("+250788123456")).toBe("+250788***456");
    expect(maskPhone("+2501")).toBe("***");
  });
});

describe("otp", () => {
  it("generates numeric codes of the requested length", () => {
    for (let i = 0; i < 200; i++) expect(generateOtp(6)).toMatch(/^\d{6}$/);
    expect(generateOtp(4)).toMatch(/^\d{4}$/);
  });
  it("uses the full digit range (no modulo bias artefacts like missing digits)", () => {
    const seen = new Set<string>();
    for (let i = 0; i < 500; i++) for (const d of generateOtp(6)) seen.add(d);
    expect(seen.size).toBe(10);
  });
  it("hash verifies only for the same code, phone and pepper", () => {
    const pepper = "pepper-pepper-pepper";
    const h = hashOtp("123456", "+250788123456", pepper);
    expect(verifyOtpHash("123456", "+250788123456", pepper, h)).toBe(true);
    expect(verifyOtpHash("123457", "+250788123456", pepper, h)).toBe(false);
    expect(verifyOtpHash("123456", "+250788123457", pepper, h)).toBe(false);
    expect(verifyOtpHash("123456", "+250788123456", "other-pepper-pepper", h)).toBe(false);
  });
  it("rejects malformed stored hashes without throwing", () => {
    expect(verifyOtpHash("123456", "+250788123456", "p".repeat(16), "zz")).toBe(false);
  });
  it("builds localised messages containing the code and validity", () => {
    for (const l of ["rw", "en", "fr"] as const) {
      const m = otpMessage(l, "654321", 300);
      expect(m).toContain("654321");
      expect(m).toContain("5");
      expect(m).toContain("Genia");
    }
  });
});
