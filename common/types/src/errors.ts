export const ERROR_CODES = [
  "AUTH_INVALID_OTP",
  "AUTH_LOCKED",
  "AUTH_UNAUTHENTICATED",
  "AUTH_REFRESH_INVALID",
  "AUTH_REFRESH_REUSED",
  "AUTH_ACCOUNT_DISABLED",
  "PIN_INVALID",
  "PIN_NOT_SET",
  "PIN_ALREADY_SET",
  "PIN_WEAK",
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
  "SMS_DELIVERY_FAILED",
  "RATE_LIMITED",
  "VALIDATION_ERROR",
  "NOT_FOUND",
  "INTERNAL_ERROR",
] as const;

export type ErrorCode = (typeof ERROR_CODES)[number];

export interface ApiErrorBody {
  error: {
    code: ErrorCode;
    message: string;
    requestId: string;
    details?: Record<string, unknown>;
  };
}
