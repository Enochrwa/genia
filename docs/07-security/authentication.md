# Authentication and Sessions

- Registration: phone number + OTP (SMS, WhatsApp fallback). OTP: 6 digits, 5-minute expiry, 5 attempts, per-phone and per-IP rate limits.
- Sessions: short-lived access token (15 min), rotating refresh token (30 days) with reuse detection; revoke on suspicious reuse.
- Device binding and session list in profile; logout everywhere.
- Transaction PIN: 4-6 digits, argon2id, 5 failures lock 30 minutes; required for withdrawals and sensitive changes.
- Staff: SSO or password + TOTP/WebAuthn 2FA; IP allow-listing for finance roles.
- Passkeys (WebAuthn) in Phase 2.
- Account recovery: OTP + cooling period before withdrawals after recovery.
