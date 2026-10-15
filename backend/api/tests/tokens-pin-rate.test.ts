import { describe, expect, it } from "vitest";
import { ManualClock } from "../src/domain/auth/clock";
import { checkPin } from "../src/domain/auth/pin-policy";
import { MemoryRateLimiter } from "../src/domain/auth/rate-limit";
import {
  generateRefreshToken,
  hashToken,
  signAccessToken,
  verifyAccessToken,
} from "../src/domain/auth/tokens";

const SECRET = "s".repeat(40);

describe("access tokens", () => {
  const claims = { userId: "u-1", sessionId: "s-1" };

  it("round-trips claims", async () => {
    const now = new Date("2026-11-02T08:00:00Z");
    const t = await signAccessToken(claims, SECRET, 900, now);
    const r = await verifyAccessToken(t, SECRET, now);
    expect(r).toEqual({ ok: true, claims });
  });
  it("expires after the ttl", async () => {
    const now = new Date("2026-11-02T08:00:00Z");
    const t = await signAccessToken(claims, SECRET, 900, now);
    expect(await verifyAccessToken(t, SECRET, new Date(now.getTime() + 899_000))).toMatchObject({
      ok: true,
    });
    expect(await verifyAccessToken(t, SECRET, new Date(now.getTime() + 901_000))).toEqual({
      ok: false,
      reason: "expired",
    });
  });
  it("rejects a wrong secret and tampered tokens", async () => {
    const now = new Date();
    const t = await signAccessToken(claims, SECRET, 900, now);
    expect(await verifyAccessToken(t, "x".repeat(40), now)).toEqual({
      ok: false,
      reason: "invalid",
    });
    const parts = t.split(".");
    const tampered = `${parts[0]}.${Buffer.from(JSON.stringify({ sub: "admin", sid: "s" })).toString("base64url")}.${parts[2]}`;
    expect(await verifyAccessToken(tampered, SECRET, now)).toEqual({
      ok: false,
      reason: "invalid",
    });
  });
  it("rejects the 'none' algorithm and garbage", async () => {
    const header = Buffer.from(JSON.stringify({ alg: "none", typ: "JWT" })).toString("base64url");
    const body = Buffer.from(
      JSON.stringify({ sub: "u", sid: "s", iss: "genia", aud: "genia-api" }),
    ).toString("base64url");
    expect(await verifyAccessToken(`${header}.${body}.`, SECRET, new Date())).toMatchObject({
      ok: false,
    });
    expect(await verifyAccessToken("not-a-jwt", SECRET, new Date())).toMatchObject({ ok: false });
  });
});

describe("refresh tokens", () => {
  it("are long, unique and hashed deterministically", () => {
    const a = generateRefreshToken();
    const b = generateRefreshToken();
    expect(a).not.toBe(b);
    expect(a.length).toBeGreaterThanOrEqual(43);
    expect(hashToken(a)).toBe(hashToken(a));
    expect(hashToken(a)).not.toContain(a);
    expect(hashToken(a)).toMatch(/^[0-9a-f]{64}$/);
  });
});

describe("PIN policy", () => {
  it("accepts reasonable PINs", () => {
    for (const p of ["4829", "73915", "602841", "9137"]) expect(checkPin(p)).toBeNull();
  });
  it("rejects bad format", () => {
    for (const p of ["123", "1234567", "12a4", "", " 1234"]) expect(checkPin(p)).toBe("format");
  });
  it("rejects repeated digits", () => {
    for (const p of ["0000", "1111", "999999"]) expect(checkPin(p)).toBe("repeated");
  });
  it("rejects ascending and descending sequences", () => {
    for (const p of ["1234", "4321", "123456", "654321", "3456"])
      expect(checkPin(p)).toBe("sequence");
  });
  it("rejects repeating blocks and common PINs", () => {
    for (const p of ["1212", "4545", "123123", "1004", "2580", "2026"])
      expect(checkPin(p)).toBe("pattern");
  });
});

describe("memory rate limiter", () => {
  it("allows up to the limit then blocks, and resets after the window", async () => {
    const clock = new ManualClock();
    const rl = new MemoryRateLimiter(clock);
    for (let i = 1; i <= 3; i++) expect((await rl.hit("k", 3, 60)).allowed).toBe(true);
    const blocked = await rl.hit("k", 3, 60);
    expect(blocked.allowed).toBe(false);
    expect(blocked.retryAfterSeconds).toBeGreaterThan(0);
    clock.advanceSeconds(61);
    expect((await rl.hit("k", 3, 60)).allowed).toBe(true);
  });
  it("keeps keys independent", async () => {
    const rl = new MemoryRateLimiter(new ManualClock());
    await rl.hit("a", 1, 60);
    expect((await rl.hit("a", 1, 60)).allowed).toBe(false);
    expect((await rl.hit("b", 1, 60)).allowed).toBe(true);
  });
});
