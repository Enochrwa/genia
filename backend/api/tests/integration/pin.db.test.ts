import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { DATABASE_URL, bearer, createTestApp, login, type TestApp } from "./helpers";

describe.skipIf(!DATABASE_URL)("transaction PIN", () => {
  let t: TestApp;
  beforeAll(async () => {
    t = await createTestApp();
  });
  afterAll(async () => {
    await t.close();
  });

  const setPin = (tokens: { accessToken: string }, pin: string) =>
    t.http.post("/v1/me/pin").set(bearer(tokens)).send({ pin });
  const verifyPin = (tokens: { accessToken: string }, pin: string) =>
    t.http.post("/v1/me/pin/verify").set(bearer(tokens)).send({ pin });

  it("requires authentication", async () => {
    await t.http.post("/v1/me/pin").send({ pin: "4829" }).expect(401);
  });

  it("verifying before a PIN exists returns PIN_NOT_SET", async () => {
    const { tokens } = await login(t);
    const r = await verifyPin(tokens, "4829").expect(409);
    expect(r.body.error.code).toBe("PIN_NOT_SET");
  });

  it("rejects malformed and weak PINs", async () => {
    const { tokens } = await login(t);
    await setPin(tokens, "12").expect(400);
    await setPin(tokens, "abcd").expect(400);
    for (const weak of ["1234", "0000", "1212", "4321"]) {
      const r = await setPin(tokens, weak).expect(422);
      expect(r.body.error.code).toBe("PIN_WEAK");
    }
  });

  it("sets a PIN once, stores it hashed with argon2id, and reflects hasPin", async () => {
    const { tokens } = await login(t);
    await setPin(tokens, "48291").expect(204);
    const me = await t.http.get("/v1/me").set(bearer(tokens)).expect(200);
    expect(me.body.hasPin).toBe(true);
    const { rows } = await t.pool.query("select pin_hash from credentials where user_id = $1", [
      tokens.user.id,
    ]);
    expect(rows[0].pin_hash).toMatch(/^\$argon2id\$/);
    expect(rows[0].pin_hash).not.toContain("48291");
    const again = await setPin(tokens, "73915").expect(409);
    expect(again.body.error.code).toBe("PIN_ALREADY_SET");
    await verifyPin(tokens, "48291").expect(204);
  });

  it("parallel first-time sets: exactly one wins", async () => {
    const { tokens } = await login(t);
    const rs = await Promise.all(
      ["48291", "73915", "60284", "91375"].map((p) => setPin(tokens, p)),
    );
    expect(rs.filter((r) => r.status === 204)).toHaveLength(1);
    expect(rs.filter((r) => r.status === 409)).toHaveLength(3);
  });

  it("counts wrong attempts, locks after 5, blocks even the right PIN, then unlocks after 30 minutes", async () => {
    const { tokens } = await login(t);
    await setPin(tokens, "48291").expect(204);
    const left: number[] = [];
    for (let i = 0; i < 4; i++) {
      const r = await verifyPin(tokens, "99999").expect(403);
      expect(r.body.error.code).toBe("PIN_INVALID");
      left.push(r.body.error.details.remainingAttempts);
    }
    expect(left).toEqual([4, 3, 2, 1]);
    const locked = await verifyPin(tokens, "99999").expect(423);
    expect(locked.body.error.code).toBe("AUTH_LOCKED");
    expect(Number(locked.headers["retry-after"])).toBeGreaterThan(1700);
    const stillLocked = await verifyPin(tokens, "48291").expect(423);
    expect(stillLocked.body.error.code).toBe("AUTH_LOCKED");
    t.clock.advanceSeconds(30 * 60 + 1);
    // the 15 minute access token has expired by now; the 30 day refresh token has not
    const fresh = await t.http
      .post("/v1/auth/refresh")
      .send({ refreshToken: tokens.refreshToken })
      .expect(200);
    await verifyPin(fresh.body, "48291").expect(204);
    const { rows } = await t.pool.query(
      "select failed_pin_count, pin_locked_until from credentials where user_id = $1",
      [tokens.user.id],
    );
    expect(rows[0]).toEqual({ failed_pin_count: 0, pin_locked_until: null });
  });

  it("a correct PIN resets the failure counter", async () => {
    const { tokens } = await login(t);
    await setPin(tokens, "48291").expect(204);
    await verifyPin(tokens, "00001").expect(403);
    await verifyPin(tokens, "00002").expect(403);
    await verifyPin(tokens, "48291").expect(204);
    const r = await verifyPin(tokens, "00003").expect(403);
    expect(r.body.error.details.remainingAttempts).toBe(4);
  });

  it("parallel wrong guesses cannot exceed the attempt budget", async () => {
    const { tokens } = await login(t);
    await setPin(tokens, "48291").expect(204);
    const rs = await Promise.all(
      Array.from({ length: 12 }, (_, i) => verifyPin(tokens, String(10000 + i))),
    );
    expect(rs.filter((r) => r.status === 403)).toHaveLength(4);
    expect(rs.filter((r) => r.status === 423).length).toBeGreaterThanOrEqual(8);
    expect(rs.some((r) => r.status === 204)).toBe(false);
  });

  it("changes the PIN: old stops working, new works, rules enforced", async () => {
    const { tokens } = await login(t);
    await setPin(tokens, "48291").expect(204);
    await t.http
      .put("/v1/me/pin")
      .set(bearer(tokens))
      .send({ currentPin: "00001", newPin: "73915" })
      .expect(403);
    const same = await t.http
      .put("/v1/me/pin")
      .set(bearer(tokens))
      .send({ currentPin: "48291", newPin: "48291" })
      .expect(422);
    expect(same.body.error.details.problem).toBe("same_as_current");
    await t.http
      .put("/v1/me/pin")
      .set(bearer(tokens))
      .send({ currentPin: "48291", newPin: "1234" })
      .expect(422);
    await t.http
      .put("/v1/me/pin")
      .set(bearer(tokens))
      .send({ currentPin: "48291", newPin: "73915" })
      .expect(204);
    await verifyPin(tokens, "73915").expect(204);
    await verifyPin(tokens, "48291").expect(403);
  });

  it("PINs are per user: one user's PIN does not verify for another", async () => {
    const a = await login(t);
    const b = await login(t);
    await setPin(a.tokens, "48291").expect(204);
    await setPin(b.tokens, "73915").expect(204);
    await verifyPin(a.tokens, "73915").expect(403);
    await verifyPin(b.tokens, "73915").expect(204);
  });
});
