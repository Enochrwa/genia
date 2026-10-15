import type { SmsProvider } from "./sms.provider";

/** Development provider: prints the message instead of sending it. Never use in production. */
export class ConsoleSmsProvider implements SmsProvider {
  readonly name = "console";
  async send(toE164: string, message: string): Promise<void> {
    console.warn(`[sms:console] to=${toE164} message="${message}"`);
  }
}

/** Test provider that records messages so tests can read the OTP. */
export class MemorySmsProvider implements SmsProvider {
  readonly name = "memory";
  readonly sent: { to: string; message: string }[] = [];
  failNext = false;
  async send(toE164: string, message: string): Promise<void> {
    if (this.failNext) {
      this.failNext = false;
      throw new Error("simulated provider outage");
    }
    this.sent.push({ to: toE164, message });
  }
  lastCode(to: string): string | undefined {
    const m = [...this.sent].reverse().find((s) => s.to === to);
    return m?.message.match(/\b(\d{6})\b/)?.[1];
  }
}
