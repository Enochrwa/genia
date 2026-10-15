# Sprint 1 Review: Accounts

Status of the work delivered on branch `feat/sprint-1-accounts`. Plan: [sprint-01.md](sprint-01.md).

## Outcome

| Story | Result |
|---|---|
| G-005 Backend scaffold (from sprint 0, needed first) | Done |
| G-010 Phone + OTP | Done |
| G-011 Sessions and refresh rotation | Done |
| G-012 Users and profile | Done |
| G-013 Transaction PIN | Done |
| G-016 SMS provider | In progress: code and tests done, live sandbox check and alert rule pending |
| G-007 Design discovery | In progress: research kit done, 5 player interviews pending |

Done: 19 of 25 committed points (plus the 5 point G-005 scaffold pulled forward from sprint 0). The two open stories are blocked on things outside the code: real SMS credentials and real people.

## What was built

- NestJS API with validated configuration (fails fast, refuses development secrets in production), request ids, standard error shape, helmet, CORS, body limit, `/health` and `/ready`
- Migration `0002_users_auth.sql`: users, OTP challenges, sessions, refresh tokens, credentials
- Phone OTP sign-in with hashed codes, attempt limits, expiry, single use, rate limits in Redis and an age declaration for new accounts
- Sessions with 15 minute access tokens checked against the session on every request, rotating refresh tokens with reuse detection, device list and revoke, logout and logout-all
- Transaction PIN with argon2id plus pepper, weak-PIN rules, lockout after 5 failures for 30 minutes
- Africa's Talking SMS adapter, console and in-memory providers
- OpenAPI contract with a test that fails if routes and spec drift apart
- API client methods and shared validation schemas
- Dockerfile and a CI job that builds it and boots the container

## Verification

| Check | Result |
|---|---|
| Unit tests (no services needed) | 66 passing in the backend, thresholds met (about 98% lines on domain and SMS code) |
| Integration tests against PostgreSQL and Redis | 53 passing: auth flows, sessions, rotation, PIN lockout, rate limits, ledger, OpenAPI contract |
| Real server bundle | Booted locally; `/health`, `/ready` and an OTP request answered; startup fails with a clear message when a secret is missing |
| Concurrency | Parallel OTP verifications, refreshes, PIN guesses and first-time PIN sets are each safe (exactly one winner or a fixed attempt budget) |

## Demo script (sprint review)

1. `docker compose up -d`, `pnpm install`, `pnpm --filter @genia/api db:migrate`, `pnpm --filter @genia/api dev`
2. Request a code for `0788123456`; read it from the API log (console provider)
3. Verify without `ageConfirmed` and show `AGE_RESTRICTED`; verify with it and show tokens and `isNewUser: true`
4. Call `GET /v1/me`; refresh the token; replay the old refresh token and show the session closed
5. Set a weak PIN (`1234`), then a good one; enter 5 wrong PINs and show the lock and `Retry-After`
6. List sessions, revoke one, show that device's token stops working at once

## Deviations and decisions

- G-005 was pulled in because every sprint 1 story depends on it.
- The OTP wrong-attempt budget is 5 guesses per code; the 6th attempt is refused even with the right code, so a new code is needed.
- Refresh retries are strict (see ADR-0008). A client that loses a refresh response must sign in again.
- Access tokens are returned in the JSON body. The web app will wrap them in an httpOnly cookie through its server.
- Rate limits are fixed-window counters in Redis (simple, atomic). A sliding window can replace them if bursts at window edges matter.

## Dependency decision

The first CI run failed `pnpm audit` because NestJS 10 pulls in vulnerable `multer`, `qs` and `file-type` versions. The API was upgraded to NestJS 11 (Express 5), which clears every high severity finding; all tests were re-run on Node 20 and Node 22 and on a single CPU core. Three moderate findings remain in transitive packages and are tracked by Dependabot.

## Risks and follow-ups

- Live SMS delivery in Rwanda is unproven until credentials are tested (G-016). Plan a backup provider.
- The `console` SMS provider prints codes; production config refuses it.
- No alerting yet on `SMS_DELIVERY_FAILED`; observability is sprint 11, so watch logs manually until then.
- Account deletion, email verification and passkeys are not part of this sprint.
- Sessions are not yet bound to a device fingerprint beyond the optional `deviceId`; fraud rules arrive in sprint 10.

## Retrospective prompts

- What slowed us down: environment setup (Postgres, Redis), library version drift (zod 4, ioredis 6)
- Keep: tests that exercise real Postgres and Redis, the contract test, the pure `domain/` folder
- Try: a contract test for the API client against the OpenAPI spec
