# ADR-0008: Short-lived access tokens, rotating refresh tokens, server-side sessions

- Status: accepted
- Date: 2026-10-15

## Context

Players sign in with a phone number and SMS code. The product moves money, so a stolen token must stop working quickly, and a lost phone must be recoverable without waiting for token expiry. Networks are slow and unreliable, so refresh must tolerate retries without being unsafe.

## Decision

- **Access token:** HS256 JWT, 15 minutes, carrying user id and session id. The API checks the session row on every request, so logout, device revoke, suspension and theft detection are immediate.
- **Refresh token:** opaque 256-bit random value, 30 days, only its SHA-256 stored, rotated on every use. Presenting a used token closes the whole session (reuse detection).
- **Sessions are rows**, one per device, listable and revocable by the user.
- **OTP codes** are HMAC-hashed with a server pepper and bound to the phone number; attempts are counted atomically in the database; rate limits live in Redis.
- **PIN** is a separate credential: argon2id over an HMAC of the PIN, 5 failures lock for 30 minutes, counted atomically.
- **Delivery of tokens:** JSON body. Web uses a backend-for-frontend that stores the refresh token in an httpOnly cookie; mobile uses the secure keystore.
- **Dependencies:** `jose` for JWT, `@node-rs/argon2` for hashing, `libphonenumber-js` for numbers. No Passport or session framework.

## Consequences

- One indexed lookup per authenticated request in exchange for instant revocation.
- Refresh retries are strict: a client that loses the response to a refresh and retries with the old token will have its session closed and must sign in again. Clients must handle that path. A short grace window can be added later if field data shows it hurts.
- Symmetric signing means every service that verifies tokens holds the secret. If services are split later, move to asymmetric keys (EdDSA) with key rotation.
- Passkeys (Release 2) will plug in as another way to start a session without changing the session model.

## Alternatives considered

- Long-lived JWT only: cannot be revoked quickly.
- Stateless refresh tokens: no reuse detection.
- Passport or an identity provider (Keycloak, Auth0): heavier and costlier for a phone-first flow; reconsider for staff SSO.
