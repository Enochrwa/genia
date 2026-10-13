export const ERROR_CODES = [
  "AUTH_INVALID_OTP",
  "AUTH_LOCKED",
  "PIN_INVALID",
  "KYC_REQUIRED",
  "AGE_RESTRICTED",
  "COUNTRY_NOT_ALLOWED",
  "SELF_EXCLUDED",
  "LIMIT_EXCEEDED",
  "WALLET_INSUFFICIENT_FUNDS",
  "IDEMPOTENCY_CONFLICT",
  "GAME_ALREADY_ACTIVE",
  "GAME_QUESTION_EXPIRED",
  "GAME_NOT_FOUND",
  "PAYMENT_PROVIDER_ERROR",
  "RATE_LIMITED",
  "VALIDATION_ERROR",
] as const;

export type ErrorCode = (typeof ERROR_CODES)[number];

export interface ApiErrorBody {
  error: { code: ErrorCode; message: string; requestId: string };
}
