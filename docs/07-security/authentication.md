# Authentication and Sessions

The API contract and rules as built in sprint 1 are in [docs/03-api/auth-and-accounts.md](../03-api/auth-and-accounts.md). Decision record: [ADR-0008](../adr/0008-auth-tokens-and-sessions.md).

- Registration: phone number + OTP (SMS, WhatsApp fallback). OTP: 6 digits, 5-minute expiry, 5 attempts, per-phone and per-IP rate limits.
- Sessions: short-lived access token (15 min), rotating refresh token (30 days) with reuse detection; revoke on suspicious reuse.
- Device binding and session list in profile; logout everywhere.
- Transaction PIN: 4-6 digits, argon2id, 5 failures lock 30 minutes; required for withdrawals and sensitive changes.
- Staff: SSO or password + TOTP/WebAuthn 2FA; IP allow-listing for finance roles.
- Passkeys (WebAuthn) in Phase 2.
- Account recovery: OTP + cooling period before withdrawals after recovery.
