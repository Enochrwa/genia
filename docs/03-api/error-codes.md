# Error Codes

Format: `{ "error": { "code": "WALLET_INSUFFICIENT_FUNDS", "message": "...", "requestId": "..." } }`

| Code | HTTP | Meaning |
|---|---|---|
| AUTH_INVALID_OTP | 401 | OTP wrong, expired or already used; `details.remainingAttempts` |
| AUTH_LOCKED | 423 | Too many OTP or PIN attempts; `Retry-After` header |
| AUTH_UNAUTHENTICATED | 401 | Missing, invalid or expired access token, or the session was closed |
| AUTH_REFRESH_INVALID | 401 | Refresh token unknown, expired or its session is closed |
| AUTH_REFRESH_REUSED | 401 | An already used refresh token was presented; the session was closed |
| AUTH_ACCOUNT_DISABLED | 403 | Account suspended or closed |
| PIN_INVALID | 403 | PIN incorrect; `details.remainingAttempts` |
| PIN_NOT_SET | 409 | Action needs a PIN and none is set |
| PIN_ALREADY_SET | 409 | PIN exists; use change |
| PIN_WEAK | 422 | PIN too easy to guess; `details.problem` is `repeated`, `sequence`, `pattern` or `same_as_current` |
| KYC_REQUIRED | 403 | Verification needed for this action |
| AGE_RESTRICTED | 403 | Under-age or unverified |
| COUNTRY_NOT_ALLOWED | 403 | Feature not enabled for country |
| SELF_EXCLUDED | 403 | User excluded |
| LIMIT_EXCEEDED | 422 | Deposit, loss or time limit |
| WALLET_INSUFFICIENT_FUNDS | 422 | Not enough balance |
| IDEMPOTENCY_CONFLICT | 409 | Same key, different payload |
| GAME_ALREADY_ACTIVE | 409 | One active game per user |
| GAME_QUESTION_EXPIRED | 410 | Answer arrived after deadline |
| GAME_NOT_FOUND | 404 | |
| PAYMENT_PROVIDER_ERROR | 502 | Provider failure; state is Pending/Failed per status |
| SMS_DELIVERY_FAILED | 502 | The SMS provider failed; the code was invalidated, retry |
| RATE_LIMITED | 429 | `Retry-After` header and `details.retryAfterSeconds` |
| VALIDATION_ERROR | 400 | Field errors in `details.fields`; also malformed or oversized bodies |
| NOT_FOUND | 404 | Unknown route or resource |
| INTERNAL_ERROR | 500 | Unexpected failure; the message is generic, support uses the request id |
