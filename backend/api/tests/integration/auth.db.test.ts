import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { DATABASE_URL, bearer, createTestApp, login, randomPhone, type TestApp } from "./helpers";

describe.skipIf(!DATABASE_URL)("auth: OTP, sessions, refresh rotation", () => {
  let t: TestApp;
  beforeAll(async () => {
    t = await createTestApp();
  });
  afterAll(async () => {
    await t.close();
  });

  describe("platform basics", () => {
    it("health and readiness", async () => {
      await t.http.get("/health").expect(200, { status: "ok" });
      const r = await t.http.get("/ready").expect(200);
      expect(r.body).toEqual({ status: "ok", checks: { database: "up", redis: "up" } });
    });
    it("generates a request id and echoes a safe client one", async () => {
      const a = await t.http.get("/health");
      expect(a.headers["x-request-id"]).toMatch(/^[0-9a-f-]{36}$/);
      const b = await t.http.get("/health").set("X-Request-Id", "client-req-12345");
      expect(b.headers["x-request-id"]).toBe("client-req-12345");
      const c = await t.http.get("/health").set("X-Request-Id", "bad id with spaces <script>");
      expect(c.headers["x-request-id"]).not.toContain("script");
    });
    it("sets security headers", async () => {
      const r = await t.http.get("/health");
      expect(r.headers["x-content-type-options"]).toBe("nosniff");
      expect(r.headers["x-powered-by"]).toBeUndefined();
    });
    it("returns the standard error shape for unknown routes, bad JSON and large bodies", async () => {
      const nf = await t.http.get("/v1/nope").expect(404);
      expect(nf.body.error).toMatchObject({ code: "NOT_FOUND" });
      expect(nf.body.error.requestId).toBeTruthy();
      const bad = await t.http
        .post("/v1/auth/otp/request")
        .set("Content-Type", "application/json")
        .send("{not json")
        .expect(400);
      expect(bad.body.error.code).toBe("VALIDATION_ERROR");
      const big = await t.http
        .post("/v1/auth/otp/request")
        .send({ phone: "0788123456", pad: "x".repeat(20_000) })
        .expect(413);
      expect(big.body.error.message).toMatch(/too large/i);
    });
  });

  describe("OTP request", () => {
    it("sends a 6 digit code by SMS and answers 202", async () => {
      const p = randomPhone();
      const r = await t.http.post("/v1/auth/otp/request").send({ phone: p.local }).expect(202);
      expect(r.body).toEqual({ expiresInSeconds: 300, resendAfterSeconds: 0 });
      expect(t.sms.lastCode(p.e164)).toMatch(/^\d{6}$/);
    });
    it("uses the requested language in the message", async () => {
      const p = randomPhone();
      await t.http.post("/v1/auth/otp/request").send({ phone: p.local, locale: "fr" }).expect(202);
      expect(t.sms.sent.at(-1)?.message).toContain("Votre code Genia");
    });
    it("rejects invalid numbers with field details", async () => {
      const r = await t.http.post("/v1/auth/otp/request").send({ phone: "12345" }).expect(400);
      expect(r.body.error.code).toBe("VALIDATION_ERROR");
      await t.http.post("/v1/auth/otp/request").send({}).expect(400);
      await t.http.post("/v1/auth/otp/request").send({ phone: "abc" }).expect(400);
    });
    it("never stores the code in plain text", async () => {
      const p = randomPhone();
      await t.http.post("/v1/auth/otp/request").send({ phone: p.local }).expect(202);
      const code = t.sms.lastCode(p.e164)!;
      const { rows } = await t.pool.query(
        "select code_hash from otp_challenges where phone_e164 = $1",
        [p.e164],
      );
      expect(rows[0].code_hash).toMatch(/^[0-9a-f]{64}$/);
      expect(rows[0].code_hash).not.toContain(code);
    });
    it("a failed SMS returns 502 and leaves no usable challenge", async () => {
      const p = randomPhone();
      t.sms.failNext = true;
      const r = await t.http.post("/v1/auth/otp/request").send({ phone: p.local }).expect(502);
      expect(r.body.error.code).toBe("SMS_DELIVERY_FAILED");
      const { rows } = await t.pool.query(
        "select count(*)::int as n from otp_challenges where phone_e164 = $1 and consumed_at is null",
        [p.e164],
      );
      expect(rows[0].n).toBe(0);
      await t.http.post("/v1/auth/otp/request").send({ phone: p.local }).expect(202);
    });
    it("a new request invalidates the previous code", async () => {
      const p = randomPhone();
      await t.http.post("/v1/auth/otp/request").send({ phone: p.local }).expect(202);
      const first = t.sms.lastCode(p.e164)!;
      await t.http.post("/v1/auth/otp/request").send({ phone: p.local }).expect(202);
      const second = t.sms.lastCode(p.e164)!;
      if (first !== second) {
        await t.http
          .post("/v1/auth/otp/verify")
          .send({ phone: p.local, code: first, ageConfirmed: true })
          .expect(401);
      }
      await t.http
        .post("/v1/auth/otp/verify")
        .send({ phone: p.local, code: second, ageConfirmed: true })
        .expect(200);
    });
  });

  describe("OTP verify", () => {
    it("creates an account for a new number only after age confirmation", async () => {
      const p = randomPhone();
      await t.http.post("/v1/auth/otp/request").send({ phone: p.local }).expect(202);
      const code = t.sms.lastCode(p.e164)!;
      const denied = await t.http
        .post("/v1/auth/otp/verify")
        .send({ phone: p.local, code })
        .expect(403);
      expect(denied.body.error.code).toBe("AGE_RESTRICTED");
      const { rows } = await t.pool.query(
        "select count(*)::int as n from users where phone_e164 = $1",
        [p.e164],
      );
      expect(rows[0].n).toBe(0);
      // the code was consumed by the correct entry; request again and confirm age
      await t.http.post("/v1/auth/otp/request").send({ phone: p.local }).expect(202);
      const ok = await t.http
        .post("/v1/auth/otp/verify")
        .send({ phone: p.local, code: t.sms.lastCode(p.e164), ageConfirmed: true })
        .expect(200);
      expect(ok.body).toMatchObject({
        tokenType: "Bearer",
        isNewUser: true,
        expiresIn: 900,
        user: { phone: p.e164, country: "RW", locale: "rw", status: "ACTIVE", hasPin: false },
      });
      expect(ok.body.accessToken.split(".")).toHaveLength(3);
      expect(ok.body.refreshToken.length).toBeGreaterThanOrEqual(43);
    });

    it("existing users sign in without re-confirming age, and all phone formats map to one account", async () => {
      const first = await login(t);
      const p = first.phone;
      const variants = [
        p.local,
        p.e164,
        p.e164.replace("+250", "250"),
        `${p.e164.slice(0, 4)} ${p.e164.slice(4, 7)} ${p.e164.slice(7)}`,
      ];
      for (const v of variants) {
        await t.http.post("/v1/auth/otp/request").send({ phone: v }).expect(202);
        const res = await t.http
          .post("/v1/auth/otp/verify")
          .send({ phone: v, code: t.sms.lastCode(p.e164) })
          .expect(200);
        expect(res.body.isNewUser).toBe(false);
        expect(res.body.user.id).toBe(first.tokens.user.id);
      }
      const { rows } = await t.pool.query(
        "select count(*)::int as n from users where phone_e164 = $1",
        [p.e164],
      );
      expect(rows[0].n).toBe(1);
    });

    it("wrong codes count down and lock the challenge after the maximum", async () => {
      const p = randomPhone();
      await t.http.post("/v1/auth/otp/request").send({ phone: p.local }).expect(202);
      const real = t.sms.lastCode(p.e164)!;
      const wrong = real === "000000" ? "111111" : "000000";
      const remaining: number[] = [];
      for (let i = 0; i < 5; i++) {
        const r = await t.http
          .post("/v1/auth/otp/verify")
          .send({ phone: p.local, code: wrong, ageConfirmed: true })
          .expect(401);
        expect(r.body.error.code).toBe("AUTH_INVALID_OTP");
        remaining.push(r.body.error.details.remainingAttempts);
      }
      expect(remaining).toEqual([4, 3, 2, 1, 0]);
      const locked = await t.http
        .post("/v1/auth/otp/verify")
        .send({ phone: p.local, code: real, ageConfirmed: true })
        .expect(423);
      expect(locked.body.error.code).toBe("AUTH_LOCKED");
      expect(Number(locked.headers["retry-after"])).toBeGreaterThan(0);
      // a fresh code works
      await t.http.post("/v1/auth/otp/request").send({ phone: p.local }).expect(202);
      await t.http
        .post("/v1/auth/otp/verify")
        .send({ phone: p.local, code: t.sms.lastCode(p.e164), ageConfirmed: true })
        .expect(200);
    });

    it("codes expire after 5 minutes", async () => {
      const p = randomPhone();
      await t.http.post("/v1/auth/otp/request").send({ phone: p.local }).expect(202);
      const code = t.sms.lastCode(p.e164)!;
      t.clock.advanceSeconds(301);
      const r = await t.http
        .post("/v1/auth/otp/verify")
        .send({ phone: p.local, code, ageConfirmed: true })
        .expect(401);
      expect(r.body.error.code).toBe("AUTH_INVALID_OTP");
    });

    it("codes are single use", async () => {
      const p = randomPhone();
      await t.http.post("/v1/auth/otp/request").send({ phone: p.local }).expect(202);
      const code = t.sms.lastCode(p.e164)!;
      await t.http
        .post("/v1/auth/otp/verify")
        .send({ phone: p.local, code, ageConfirmed: true })
        .expect(200);
      await t.http
        .post("/v1/auth/otp/verify")
        .send({ phone: p.local, code, ageConfirmed: true })
        .expect(401);
    });

    it("eight parallel verifications of one code produce exactly one session", async () => {
      const p = randomPhone();
      await t.http.post("/v1/auth/otp/request").send({ phone: p.local }).expect(202);
      const code = t.sms.lastCode(p.e164)!;
      const results = await Promise.all(
        Array.from({ length: 8 }, () =>
          t.http.post("/v1/auth/otp/verify").send({ phone: p.local, code, ageConfirmed: true }),
        ),
      );
      expect(results.filter((r) => r.status === 200)).toHaveLength(1);
      const { rows } = await t.pool.query(
        "select count(*)::int as n from users where phone_e164 = $1",
        [p.e164],
      );
      expect(rows[0].n).toBe(1);
    });

    it("verification with no open challenge fails generically (no account enumeration)", async () => {
      const unknown = randomPhone();
      const r = await t.http
        .post("/v1/auth/otp/verify")
        .send({ phone: unknown.local, code: "123456", ageConfirmed: true })
        .expect(401);
      expect(r.body.error.code).toBe("AUTH_INVALID_OTP");
    });

    it("suspended accounts cannot sign in and lose existing access immediately", async () => {
      const { tokens, phone } = await login(t);
      await t.pool.query("update users set status = 'SUSPENDED' where id = $1", [tokens.user.id]);
      await t.http.get("/v1/me").set(bearer(tokens)).expect(401);
      await t.http.post("/v1/auth/otp/request").send({ phone: phone.local }).expect(202);
      const r = await t.http
        .post("/v1/auth/otp/verify")
        .send({ phone: phone.local, code: t.sms.lastCode(phone.e164) })
        .expect(403);
      expect(r.body.error.code).toBe("AUTH_ACCOUNT_DISABLED");
      const rf = await t.http
        .post("/v1/auth/refresh")
        .send({ refreshToken: tokens.refreshToken })
        .expect(403);
      expect(rf.body.error.code).toBe("AUTH_ACCOUNT_DISABLED");
    });
  });

  describe("access tokens and sessions", () => {
    it("protects routes", async () => {
      await t.http.get("/v1/me").expect(401);
      await t.http.get("/v1/me").set("Authorization", "Bearer garbage").expect(401);
      await t.http.get("/v1/me").set("Authorization", "Basic abc").expect(401);
    });
    it("returns the profile and refuses tokens after the ttl", async () => {
      const { tokens } = await login(t);
      const me = await t.http.get("/v1/me").set(bearer(tokens)).expect(200);
      expect(me.body.id).toBe(tokens.user.id);
      t.clock.advanceSeconds(901);
      const r = await t.http.get("/v1/me").set(bearer(tokens)).expect(401);
      expect(r.body.error.message).toMatch(/expired/i);
    });
    it("logout revokes the session immediately", async () => {
      const { tokens } = await login(t);
      await t.http.post("/v1/auth/logout").set(bearer(tokens)).expect(204);
      await t.http.get("/v1/me").set(bearer(tokens)).expect(401);
      await t.http.post("/v1/auth/refresh").send({ refreshToken: tokens.refreshToken }).expect(401);
    });
    it("logout-all closes every session of the user but not other users", async () => {
      const a1 = await login(t);
      const a2 = await login(t, a1.phone);
      const other = await login(t);
      const r = await t.http.post("/v1/auth/logout-all").set(bearer(a1.tokens)).expect(200);
      expect(r.body.revoked).toBeGreaterThanOrEqual(2);
      await t.http.get("/v1/me").set(bearer(a1.tokens)).expect(401);
      await t.http.get("/v1/me").set(bearer(a2.tokens)).expect(401);
      await t.http.get("/v1/me").set(bearer(other.tokens)).expect(200);
    });
    it("lists sessions, marks the current one, and revokes another device", async () => {
      const a = await login(t, randomPhone(), "device-aaaa-1111");
      const b = await login(t, a.phone, "device-bbbb-2222");
      const list = await t.http.get("/v1/me/sessions").set(bearer(a.tokens)).expect(200);
      expect(list.body.length).toBeGreaterThanOrEqual(2);
      const current = list.body.filter((s: { current: boolean }) => s.current);
      expect(current).toHaveLength(1);
      const other = list.body.find((s: { deviceId: string }) => s.deviceId === "device-bbbb-2222");
      await t.http.delete(`/v1/me/sessions/${other.id}`).set(bearer(a.tokens)).expect(204);
      await t.http.get("/v1/me").set(bearer(b.tokens)).expect(401);
      await t.http.get("/v1/me").set(bearer(a.tokens)).expect(200);
    });
    it("cannot revoke someone else's session", async () => {
      const a = await login(t);
      const b = await login(t);
      const bs = await t.http.get("/v1/me/sessions").set(bearer(b.tokens)).expect(200);
      await t.http.delete(`/v1/me/sessions/${bs.body[0].id}`).set(bearer(a.tokens)).expect(404);
      await t.http.delete("/v1/me/sessions/not-a-uuid").set(bearer(a.tokens)).expect(400);
      await t.http.get("/v1/me").set(bearer(b.tokens)).expect(200);
    });
  });

  describe("refresh rotation and reuse detection", () => {
    it("rotates: a new pair is issued and the old refresh token stops working", async () => {
      const { tokens } = await login(t);
      const r = await t.http
        .post("/v1/auth/refresh")
        .send({ refreshToken: tokens.refreshToken })
        .expect(200);
      expect(r.body.refreshToken).not.toBe(tokens.refreshToken);
      expect(r.body.isNewUser).toBe(false);
      await t.http.get("/v1/me").set(bearer(r.body)).expect(200);
    });
    it("reusing an old refresh token closes the whole session family", async () => {
      const { tokens } = await login(t);
      const r1 = await t.http
        .post("/v1/auth/refresh")
        .send({ refreshToken: tokens.refreshToken })
        .expect(200);
      const reuse = await t.http
        .post("/v1/auth/refresh")
        .send({ refreshToken: tokens.refreshToken })
        .expect(401);
      expect(reuse.body.error.code).toBe("AUTH_REFRESH_REUSED");
      // the attacker's and the victim's newest tokens are both dead
      await t.http.get("/v1/me").set(bearer(r1.body)).expect(401);
      const dead = await t.http
        .post("/v1/auth/refresh")
        .send({ refreshToken: r1.body.refreshToken })
        .expect(401);
      expect(dead.body.error.code).toBe("AUTH_REFRESH_INVALID");
      const { rows } = await t.pool.query(
        "select revoke_reason from sessions where user_id = $1 and revoke_reason = 'REFRESH_REUSE'",
        [tokens.user.id],
      );
      expect(rows.length).toBeGreaterThanOrEqual(1);
    });
    it("parallel refreshes with the same token: one wins, the session is then closed", async () => {
      const { tokens } = await login(t);
      const rs = await Promise.all(
        Array.from({ length: 6 }, () =>
          t.http.post("/v1/auth/refresh").send({ refreshToken: tokens.refreshToken }),
        ),
      );
      expect(rs.filter((r) => r.status === 200).length).toBeLessThanOrEqual(1);
      expect(rs.filter((r) => r.status === 401).length).toBeGreaterThanOrEqual(5);
    });
    it("rejects unknown, malformed and expired refresh tokens", async () => {
      const unknown = await t.http
        .post("/v1/auth/refresh")
        .send({ refreshToken: "x".repeat(43) })
        .expect(401);
      expect(unknown.body.error.code).toBe("AUTH_REFRESH_INVALID");
      await t.http.post("/v1/auth/refresh").send({ refreshToken: "short" }).expect(400);
      const { tokens } = await login(t);
      t.clock.advanceSeconds(31 * 86_400);
      const expired = await t.http
        .post("/v1/auth/refresh")
        .send({ refreshToken: tokens.refreshToken })
        .expect(401);
      expect(expired.body.error.code).toBe("AUTH_REFRESH_INVALID");
    });
    it("stores only a hash of the refresh token", async () => {
      const { tokens } = await login(t);
      const { rows } = await t.pool.query(
        "select token_hash from refresh_tokens r join sessions s on s.id = r.session_id where s.user_id = $1",
        [tokens.user.id],
      );
      for (const r of rows) {
        expect(r.token_hash).toMatch(/^[0-9a-f]{64}$/);
        expect(r.token_hash).not.toBe(tokens.refreshToken);
      }
    });
  });

  describe("profile", () => {
    it("updates language and email, and validates input", async () => {
      const { tokens } = await login(t);
      const r = await t.http
        .patch("/v1/me")
        .set(bearer(tokens))
        .send({ locale: "fr", email: "Player@Example.com" })
        .expect(200);
      expect(r.body).toMatchObject({ locale: "fr", email: "player@example.com" });
      await t.http.patch("/v1/me").set(bearer(tokens)).send({ email: null }).expect(200);
      await t.http.patch("/v1/me").set(bearer(tokens)).send({}).expect(400);
      await t.http.patch("/v1/me").set(bearer(tokens)).send({ locale: "xx" }).expect(400);
      await t.http.patch("/v1/me").set(bearer(tokens)).send({ email: "nope" }).expect(400);
    });
    it("ignores attempts to change protected fields", async () => {
      const { tokens } = await login(t);
      const r = await t.http
        .patch("/v1/me")
        .set(bearer(tokens))
        .send({ locale: "en", status: "CLOSED", kycLevel: 3, phone: "+250788000000" })
        .expect(200);
      expect(r.body).toMatchObject({ status: "ACTIVE", kycLevel: 0, phone: tokens.user.phone });
    });
  });
});
