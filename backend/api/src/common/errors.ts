import type { ErrorCode } from "@genia/types";

export class AppError extends Error {
  constructor(
    public readonly code: ErrorCode,
    public readonly status: number,
    message: string,
    public readonly details?: Record<string, unknown>,
    public readonly retryAfterSeconds?: number,
  ) {
    super(message);
    this.name = "AppError";
  }
}

export const Errors = {
  validation: (details: Record<string, unknown>) =>
    new AppError("VALIDATION_ERROR", 400, "Request validation failed", details),
  unauthenticated: (message = "Authentication required") =>
    new AppError("AUTH_UNAUTHENTICATED", 401, message),
  invalidOtp: (remainingAttempts: number) =>
    new AppError("AUTH_INVALID_OTP", 401, "The code is invalid or has expired", {
      remainingAttempts,
    }),
  locked: (retryAfterSeconds: number, message = "Too many attempts. Try again later") =>
    new AppError("AUTH_LOCKED", 423, message, { retryAfterSeconds }, retryAfterSeconds),
  refreshInvalid: () =>
    new AppError("AUTH_REFRESH_INVALID", 401, "Refresh token is invalid or expired"),
  refreshReused: () =>
    new AppError(
      "AUTH_REFRESH_REUSED",
      401,
      "Refresh token was already used. The session has been closed",
    ),
  accountDisabled: () => new AppError("AUTH_ACCOUNT_DISABLED", 403, "This account cannot sign in"),
  ageRestricted: () =>
    new AppError(
      "AGE_RESTRICTED",
      403,
      "You must confirm you are 18 or older to create an account",
    ),
  rateLimited: (retryAfterSeconds: number) =>
    new AppError(
      "RATE_LIMITED",
      429,
      "Too many requests. Try again later",
      { retryAfterSeconds },
      retryAfterSeconds,
    ),
  smsFailed: () =>
    new AppError("SMS_DELIVERY_FAILED", 502, "We could not send the SMS. Please try again"),
  pinInvalid: (remainingAttempts: number) =>
    new AppError("PIN_INVALID", 403, "The PIN is incorrect", { remainingAttempts }),
  pinNotSet: () => new AppError("PIN_NOT_SET", 409, "Set a transaction PIN first"),
  pinAlreadySet: () => new AppError("PIN_ALREADY_SET", 409, "A PIN is already set. Use change PIN"),
  pinWeak: (problem: string) =>
    new AppError("PIN_WEAK", 422, "Choose a PIN that is harder to guess", { problem }),
  notFound: (what = "Resource") => new AppError("NOT_FOUND", 404, `${what} not found`),
};
