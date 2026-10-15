import { SmsDeliveryError, type SmsProvider } from "./sms.provider";

export interface AfricasTalkingOptions {
  apiKey: string;
  username: string;
  senderId?: string;
  baseUrl?: string;
  fetchImpl?: typeof fetch;
  timeoutMs?: number;
}

interface AtResponse {
  SMSMessageData?: {
    Message?: string;
    Recipients?: { statusCode: number; status: string; number: string }[];
  };
}

// Africa's Talking status codes 100 (Processed), 101 (Sent) and 102 (Queued) mean the message was accepted.
const ACCEPTED = new Set([100, 101, 102]);

export class AfricasTalkingSmsProvider implements SmsProvider {
  readonly name = "africastalking";
  private readonly fetchImpl: typeof fetch;
  private readonly baseUrl: string;

  constructor(private readonly opts: AfricasTalkingOptions) {
    this.fetchImpl = opts.fetchImpl ?? fetch;
    this.baseUrl =
      opts.baseUrl ??
      (opts.username === "sandbox"
        ? "https://api.sandbox.africastalking.com"
        : "https://api.africastalking.com");
  }

  async send(toE164: string, message: string): Promise<void> {
    const body = new URLSearchParams({ username: this.opts.username, to: toE164, message });
    if (this.opts.senderId) body.set("from", this.opts.senderId);

    let res: Response;
    try {
      res = await this.fetchImpl(`${this.baseUrl}/version1/messaging`, {
        method: "POST",
        headers: {
          apiKey: this.opts.apiKey,
          Accept: "application/json",
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body,
        signal: AbortSignal.timeout(this.opts.timeoutMs ?? 8000),
      });
    } catch (err) {
      throw new SmsDeliveryError(`network error: ${(err as Error).message}`, this.name, true);
    }

    if (!res.ok) {
      throw new SmsDeliveryError(
        `HTTP ${res.status}`,
        this.name,
        res.status >= 500 || res.status === 429,
      );
    }
    const json = (await res.json().catch(() => ({}))) as AtResponse;
    const recipient = json.SMSMessageData?.Recipients?.[0];
    if (!recipient || !ACCEPTED.has(recipient.statusCode)) {
      throw new SmsDeliveryError(
        `rejected: ${recipient?.status ?? json.SMSMessageData?.Message ?? "no recipient in response"}`,
        this.name,
        false,
      );
    }
  }
}
