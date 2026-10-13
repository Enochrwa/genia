# Error Codes

Format: `{ "error": { "code": "WALLET_INSUFFICIENT_FUNDS", "message": "...", "requestId": "..." } }`

| Code | HTTP | Meaning |
|---|---|---|
| AUTH_INVALID_OTP | 401 | OTP wrong or expired |
| AUTH_LOCKED | 423 | Too many attempts |
| PIN_INVALID | 403 | PIN incorrect |
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
| RATE_LIMITED | 429 | |
| VALIDATION_ERROR | 400 | Field errors included |
