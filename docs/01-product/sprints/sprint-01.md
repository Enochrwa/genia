# Sprint 1: Accounts

- Dates: 2 Nov 2026 to 13 Nov 2026
- Capacity: 28 points; committed: 25 (89%)
- Capacity note: Normal capacity

## Sprint goal

A user can register with phone OTP, keep a session and set a PIN; design discovery validated with players.

## Stories

| ID | Epic | Story | Points | Owner role | Depends on |
|---|---|---|---:|---|---|
| G-007 | E11 | Design discovery: personas, 5 player interviews, flow sketches for play, deposit, withdraw | 3 | Designer | none |
| G-010 | E1 | Phone + OTP request and verify API with per-phone and per-IP rate limits | 8 | Backend | G-005 |
| G-011 | E1 | Sessions: short-lived access token, rotating refresh token with reuse detection | 5 | Backend | G-010 |
| G-012 | E1 | Users and profile model: migration, locale, country, status, one account per phone | 3 | Backend | G-005 |
| G-013 | E1 | Transaction PIN: set, change, lock after 5 failures for 30 minutes | 3 | Backend | G-011 |
| G-016 | E10 | SMS provider integration (Africa's Talking) with console fallback in dev | 3 | Backend | G-010 |

## Acceptance criteria

- **G-007**: Interview notes and validated flows in docs/11-design
- **G-010**: OTP 6 digits, 5 min expiry, 5 attempts, locked after; tests cover abuse cases
- **G-011**: Reused refresh token revokes the session family; logout everywhere works
- **G-012**: Unique phone per country enforced by DB; migration reviewed
- **G-013**: argon2id with pepper; lock and unlock behaviour tested
- **G-016**: OTP delivered in sandbox; delivery failures alert

## Sprint review demo

Register on a phone with a real SMS in the sandbox, log out everywhere, lock the PIN.

## Risks

SMS delivery reliability in Rwanda; abuse of OTP endpoint.

## Intra-sprint dependencies

These stories depend on work finishing earlier in the same sprint, so sequence them accordingly: G-011, G-013, G-016.

## Exit criteria

- Every story meets the [definition of done](README.md#definition-of-done)
- Sprint goal demonstrated at review
- Money-critical changes reviewed by a second engineer
- Docs and ADRs updated where behaviour changed
- Retrospective actions recorded

Navigation: [previous](sprint-00.md) | [plan](sprint-plan.md) | [next](sprint-02.md)
