import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { DATABASE_URL, createTestApp, randomPhone, type TestApp } from "./helpers";

describe.skipIf(!DATABASE_URL)("rate limits (Redis)", () => {
  let t: TestApp;
  beforeAll(async () => {
    t = await createTestApp({
      OTP_RESEND_COOLDOWN_SECONDS: "60",
      OTP_REQUESTS_PER_PHONE: "3",
      OTP_REQUESTS_PER_IP: "5",
      OTP_VERIFY_PER_PHONE: "4",
    });
  });
  afterAll(async () => {
    await t.close();
  });

  it("enforces the resend cooldown per phone", async () => {
    const p = randomPhone();
    await t.http.post("/v1/auth/otp/request").send({ phone: p.local }).expect(202);
    const r = await t.http.post("/v1/auth/otp/request").send({ phone: p.local }).expect(429);
    expect(r.body.error.code).toBe("RATE_LIMITED");
    expect(Number(r.headers["retry-after"])).toBeGreaterThan(0);
    expect(r.body.error.details.retryAfterSeconds).toBeGreaterThan(0);
    // a different number is unaffected
    await t.http.post("/v1/auth/otp/request").send({ phone: randomPhone().local }).expect(202);
  });

  it("limits verification attempts per phone even with fresh codes", async () => {
    const p = randomPhone();
    const statuses: number[] = [];
    for (let i = 0; i < 6; i++) {
      const r = await t.http
        .post("/v1/auth/otp/verify")
        .send({ phone: p.local, code: "123456", ageConfirmed: true });
      statuses.push(r.status);
    }
    expect(statuses.slice(0, 4).every((s) => s === 401)).toBe(true);
    expect(statuses.slice(4).every((s) => s === 429)).toBe(true);
  });

  it("limits OTP requests per source IP", async () => {
    // 5 per IP per hour in this app instance; earlier tests already used some, so keep going until blocked
    let blocked = false;
    for (let i = 0; i < 8 && !blocked; i++) {
      const r = await t.http.post("/v1/auth/otp/request").send({ phone: randomPhone().local });
      if (r.status === 429) blocked = true;
    }
    expect(blocked).toBe(true);
  });
});
