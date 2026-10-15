# Authentication and Accounts API

Implemented in sprint 1. Machine-readable contract: [openapi.yaml](openapi.yaml). Error codes: [error-codes.md](error-codes.md).

## Sign-in flow

```text
POST /v1/auth/otp/request   { phone, locale? }               -> 202 { expiresInSeconds, resendAfterSeconds }
POST /v1/auth/otp/verify    { phone, code, ageConfirmed?, deviceId? }
                                                             -> 200 { accessToken, refreshToken, expiresIn, user, isNewUser }
POST /v1/auth/refresh       { refreshToken }                 -> 200 new token pair
POST /v1/auth/logout        (Bearer)                         -> 204
POST /v1/auth/logout-all    (Bearer)                         -> 200 { revoked }
```

1. The client sends a phone number in any common format (`0788123456`, `+250 788 123 456`). The server normalises it to E.164; all formats map to one account.
2. A 6 digit code is sent by SMS in the requested language (rw, en, fr). The answer is always 202 with the same shape, so the endpoint does not reveal whether the number has an account.
3. The client verifies the code. For a number with no account the request must carry `ageConfirmed: true` (18+ declaration); otherwise the answer is `AGE_RESTRICTED` and no account is created.
4. The server returns a 15 minute access token (JWT) and a 30 day opaque refresh token.

## Rules

| Rule | Value |
|---|---|
| Code length, lifetime | 6 digits, 5 minutes, single use |
| Wrong guesses per code | 5; the 6th attempt returns `AUTH_LOCKED` and a new code is required |
| New code | Invalidates the previous one |
| OTP requests | 1 per 60 s per phone, 3 per 10 min per phone, 20 per hour per IP |
| OTP verifications | 10 per 10 min per phone, 60 per hour per IP |
| Access token | HS256 JWT, 15 minutes, carries user id and session id |
| Refresh token | 256-bit random, only its SHA-256 is stored, 30 days, rotated on every use |
| Codes at rest | HMAC-SHA256 keyed with `OTP_PEPPER`, bound to the phone number |

All limits are configurable through environment variables (see `.env.example`).

## Sessions and refresh rotation

- Every sign-in creates a **session** (one per device). The access token carries the session id, and the API checks on every request that the session is still active. Logging out, revoking a device, suspending the account or detecting token theft therefore takes effect immediately, not when the token expires.
- Each refresh returns a **new** refresh token and marks the old one used. Presenting a used token again means it was copied, so the whole session is closed and the answer is `AUTH_REFRESH_REUSED`. Two parallel refreshes with the same token have the same effect (one may win, the session is then closed).
- Clients must store the newest refresh token atomically and must not retry a refresh blindly after a timeout without first checking whether the previous attempt succeeded.
- Web clients should keep the refresh token in an httpOnly cookie set by the web server (backend-for-frontend) and never in `localStorage`. Mobile clients use the secure keystore.

## Profile and devices

| Endpoint | Notes |
|---|---|
| `GET /v1/me` | Profile, `hasPin`, `status`, `kycLevel` |
| `PATCH /v1/me` | Only `locale` and `email`. Status, phone and KYC level cannot be changed by the user |
| `GET /v1/me/sessions` | Active devices; the current one is marked |
| `DELETE /v1/me/sessions/{id}` | Close one of your own sessions; others get 404 |

## Transaction PIN

| Endpoint | Notes |
|---|---|
| `POST /v1/me/pin` | Set the first PIN. 409 `PIN_ALREADY_SET` if one exists (race-safe) |
| `PUT /v1/me/pin` | Change: requires the current PIN (counts toward lockout) |
| `POST /v1/me/pin/verify` | 204 if correct. Later sprints call the same service before withdrawals |

- 4 to 6 digits. Rejected as `PIN_WEAK`: repeated digits (`1111`), sequences (`1234`, `4321`), repeating blocks (`1212`, `123123`) and a short list of common PINs.
- Stored as argon2id of an HMAC of the PIN keyed with `PIN_PEPPER`. A database leak alone cannot be brute forced offline.
- 5 wrong attempts lock the PIN for 30 minutes (`AUTH_LOCKED` with `Retry-After`). While locked even the correct PIN is refused. A correct PIN resets the counter.
- Failure counting is atomic in the database, so parallel guesses cannot exceed the budget.

## Error responses

```json
{ "error": { "code": "AUTH_INVALID_OTP", "message": "The code is invalid or has expired", "requestId": "…", "details": { "remainingAttempts": 3 } } }
```

`Retry-After` is set for `RATE_LIMITED` and `AUTH_LOCKED`. Every response carries `X-Request-Id`; a safe client-supplied id is echoed.

## Security notes

- Codes and PINs are never logged. Phone numbers are masked in logs (`+250788***456`). The development SMS provider prints codes and is refused when `NODE_ENV=production`.
- Production configuration fails to start if secrets are development placeholders, are reused, or the SMS provider is `console`.
- Requests are limited to 10 KB JSON bodies; security headers come from helmet; CORS is limited to the configured web origin.
