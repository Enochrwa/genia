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
});
