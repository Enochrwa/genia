import { describe, expect, it } from "vitest";
import {
  ChangePinSchema,
  ERROR_CODES,
  OtpRequestSchema,
  OtpVerifySchema,
  PinSchema,
  RefreshSchema,
  UpdateProfileSchema,
} from "../src";

describe("auth schemas", () => {
  it("accepts local and international phone formats", () => {
    expect(OtpRequestSchema.safeParse({ phone: "0788123456" }).success).toBe(true);
    expect(OtpRequestSchema.safeParse({ phone: "+250 788 123 456" }).success).toBe(true);
  });
  it("rejects letters and too-short phone input", () => {
    expect(OtpRequestSchema.safeParse({ phone: "abc" }).success).toBe(false);
    expect(OtpRequestSchema.safeParse({ phone: "12" }).success).toBe(false);
    expect(OtpRequestSchema.safeParse({ phone: "0788<script>" }).success).toBe(false);
  });
  it("requires a 6 digit code", () => {
    const base = { phone: "0788123456" };
    expect(OtpVerifySchema.safeParse({ ...base, code: "123456" }).success).toBe(true);
    expect(OtpVerifySchema.safeParse({ ...base, code: "12345" }).success).toBe(false);
    expect(OtpVerifySchema.safeParse({ ...base, code: "12a456" }).success).toBe(false);
  });
  it("PIN is 4 to 6 digits", () => {
    for (const ok of ["4829", "48291", "482913"])
      expect(PinSchema.safeParse(ok).success).toBe(true);
    for (const bad of ["123", "1234567", "12a4", ""])
      expect(PinSchema.safeParse(bad).success).toBe(false);
  });
  it("change PIN needs both values", () => {
    expect(ChangePinSchema.safeParse({ currentPin: "4829" }).success).toBe(false);
  });
  it("profile update needs at least one field and a valid email", () => {
    expect(UpdateProfileSchema.safeParse({}).success).toBe(false);
    expect(UpdateProfileSchema.safeParse({ locale: "fr" }).success).toBe(true);
    expect(UpdateProfileSchema.safeParse({ email: "not-an-email" }).success).toBe(false);
    expect(UpdateProfileSchema.safeParse({ email: null }).success).toBe(true);
  });
  it("refresh token has a sane length", () => {
    expect(RefreshSchema.safeParse({ refreshToken: "x" }).success).toBe(false);
  });
  it("error codes are unique", () => {
    expect(new Set(ERROR_CODES).size).toBe(ERROR_CODES.length);
  });
});
