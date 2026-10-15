export interface SmsProvider {
  readonly name: string;
  send(toE164: string, message: string): Promise<void>;
}

export class SmsDeliveryError extends Error {
  constructor(
    message: string,
    public readonly provider: string,
    public readonly retryable: boolean,
  ) {
    super(message);
    this.name = "SmsDeliveryError";
  }
}
