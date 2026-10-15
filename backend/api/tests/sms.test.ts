import { describe, expect, it, vi } from "vitest";
import { AfricasTalkingSmsProvider } from "../src/modules/sms/africastalking.provider";
import { MemorySmsProvider } from "../src/modules/sms/console.provider";
import { SmsDeliveryError } from "../src/modules/sms/sms.provider";

const ok = (statusCode = 101) =>
  new Response(
    JSON.stringify({
      SMSMessageData: { Recipients: [{ statusCode, status: "Success", number: "+250788123456" }] },
    }),
    {
      status: 201,
    },
  );

describe("Africa's Talking provider", () => {
  const make = (f: typeof fetch, extra = {}) =>
    new AfricasTalkingSmsProvider({ apiKey: "key", username: "sandbox", fetchImpl: f, ...extra });

  it("posts a form request with the api key header to the sandbox", async () => {
    const f = vi.fn(async () => ok());
    await make(f as unknown as typeof fetch, { senderId: "GENIA" }).send("+250788123456", "hello");
    const [url, init] = f.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe("https://api.sandbox.africastalking.com/version1/messaging");
    expect((init.headers as Record<string, string>).apiKey).toBe("key");
    const body = init.body as URLSearchParams;
    expect(body.get("to")).toBe("+250788123456");
    expect(body.get("message")).toBe("hello");
    expect(body.get("from")).toBe("GENIA");
    expect(body.get("username")).toBe("sandbox");
  });
  it("uses the live endpoint for a real username", async () => {
    const f = vi.fn(async () => ok(100));
    await new AfricasTalkingSmsProvider({
      apiKey: "k",
      username: "genia",
      fetchImpl: f as unknown as typeof fetch,
    }).send("+1", "x");
    expect((f.mock.calls[0] as unknown as [string])[0]).toBe(
      "https://api.africastalking.com/version1/messaging",
    );
  });
  it("treats rejected recipients as non-retryable failures", async () => {
    const f = vi.fn(async () => ok(403));
    const err = await make(f as unknown as typeof fetch)
      .send("+250788123456", "x")
      .catch((e) => e);
    expect(err).toBeInstanceOf(SmsDeliveryError);
    expect(err.retryable).toBe(false);
  });
  it("treats 5xx and 429 as retryable, 4xx as not", async () => {
    for (const [status, retryable] of [
      [503, true],
      [429, true],
      [401, false],
    ] as const) {
      const f = vi.fn(async () => new Response("", { status }));
      const err = await make(f as unknown as typeof fetch)
        .send("+1", "x")
        .catch((e) => e);
      expect(err.retryable).toBe(retryable);
    }
  });
  it("wraps network failures", async () => {
    const f = vi.fn(async () => {
      throw new Error("ECONNRESET");
    });
    const err = await make(f as unknown as typeof fetch)
      .send("+1", "x")
      .catch((e) => e);
    expect(err).toBeInstanceOf(SmsDeliveryError);
    expect(err.retryable).toBe(true);
  });
  it("fails when the response has no recipients", async () => {
    const f = vi.fn(async () => new Response(JSON.stringify({}), { status: 201 }));
    await expect(make(f as unknown as typeof fetch).send("+1", "x")).rejects.toBeInstanceOf(
      SmsDeliveryError,
    );
  });
});

describe("memory provider", () => {
  it("captures messages and extracts the code", async () => {
    const p = new MemorySmsProvider();
    await p.send("+250788123456", "Your Genia code is 123456. Valid for 5 minutes.");
    expect(p.lastCode("+250788123456")).toBe("123456");
    expect(p.lastCode("+250700000000")).toBeUndefined();
  });
  it("can simulate an outage once", async () => {
    const p = new MemorySmsProvider();
    p.failNext = true;
    await expect(p.send("+1", "x")).rejects.toThrow();
    await expect(p.send("+1", "x")).resolves.toBeUndefined();
  });
});
