import { describe, expect, it, vi } from "vitest";
import { ApiError, createApiClient } from "../src";

function mockFetch(status: number, body: unknown) {
  return vi.fn(async () => new Response(JSON.stringify(body), { status }));
}

describe("api client", () => {
  it("sends idempotency key, request id and bearer token", async () => {
    const f = mockFetch(200, { ok: true });
    const c = createApiClient({
      baseUrl: "http://x",
      fetchImpl: f as unknown as typeof fetch,
      getAccessToken: () => "tok",
      newId: () => "req-1",
    });
    await c.startGame(500, "sports", "idem-1");
    const [url, init] = f.mock.calls[0] as unknown as [string, RequestInit];
    const headers = init.headers as Record<string, string>;
    expect(url).toBe("http://x/v1/games");
    expect(headers["Idempotency-Key"]).toBe("idem-1");
    expect(headers["X-Request-Id"]).toBe("req-1");
    expect(headers["Authorization"]).toBe("Bearer tok");
  });

  it("never sends correct answers; submitAnswer carries only ids", async () => {
    const f = mockFetch(200, {});
    const c = createApiClient({ baseUrl: "http://x", fetchImpl: f as unknown as typeof fetch });
    await c.submitAnswer("g1", "q1", "o2");
    const [, init] = f.mock.calls[0] as unknown as [string, RequestInit];
    expect(JSON.parse(init.body as string)).toEqual({ questionId: "q1", optionId: "o2" });
  });

  it("maps error bodies to ApiError", async () => {
    const f = mockFetch(422, {
      error: { code: "WALLET_INSUFFICIENT_FUNDS", message: "No funds", requestId: "r9" },
    });
    const c = createApiClient({ baseUrl: "http://x", fetchImpl: f as unknown as typeof fetch });
    await expect(c.requestWithdrawal(100, "RWF", "k")).rejects.toMatchObject({
      status: 422,
      code: "WALLET_INSUFFICIENT_FUNDS",
      requestId: "r9",
    });
    await expect(c.requestWithdrawal(100, "RWF", "k")).rejects.toBeInstanceOf(ApiError);
  });

  it("handles 204 No Content", async () => {
    const f = vi.fn(async () => new Response(null, { status: 204 }));
    const c = createApiClient({ baseUrl: "http://x", fetchImpl: f as unknown as typeof fetch });
    await expect(c.logout()).resolves.toBeUndefined();
  });

  it("calls the auth and PIN endpoints with the right method, path and body", async () => {
    const f = vi.fn(async () => new Response(JSON.stringify({}), { status: 200 }));
    const c = createApiClient({ baseUrl: "http://x", fetchImpl: f as unknown as typeof fetch });
    await c.requestOtp({ phone: "0788123456" });
    await c.verifyOtp({ phone: "0788123456", code: "123456", ageConfirmed: true });
    await c.refresh("r".repeat(43));
    await c.updateMe({ locale: "fr" });
    await c.changePin({ currentPin: "48291", newPin: "73915" });
    const calls = (f.mock.calls as unknown as [string, RequestInit][]).map(
      ([u, i]) => `${i.method} ${u.replace("http://x", "")}`,
    );
    expect(calls).toEqual([
      "POST /v1/auth/otp/request",
      "POST /v1/auth/otp/verify",
      "POST /v1/auth/refresh",
      "PATCH /v1/me",
      "PUT /v1/me/pin",
    ]);
    const refreshBody = JSON.parse(
      (f.mock.calls[2] as unknown as [string, RequestInit])[1].body as string,
    );
    expect(refreshBody).toEqual({ refreshToken: "r".repeat(43) });
  });
});
