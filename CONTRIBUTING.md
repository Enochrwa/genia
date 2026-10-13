# Contributing to Genia

## Workflow

1. Branch from `main`: `feat/<topic>`, `fix/<topic>`, `docs/<topic>`.
2. Use Conventional Commits: `feat(wallet): add hold release`.
3. Open a pull request using the template. CI must pass (lint, typecheck, tests, build, secrets scan).
4. Money-related code (ledger, wallet, payments, game settlement) needs a second review and tests for failure paths and idempotency.

## Standards

- TypeScript strict mode everywhere; no `any` without a comment.
- Money is always integer minor units plus an ISO 4217 currency code. Never floats.
- Validate all external input with zod (shared schemas in `common/types`).
- Never log phone numbers, PINs, OTPs, tokens or full payment references.
- All user-facing text goes through i18n catalogues (`en`, `fr`, `rw`). No hard-coded strings.
- Every API change updates the OpenAPI spec and `docs/03-api`.
- Architectural decisions are recorded as ADRs in `docs/adr`.

## Secrets

Never commit secrets. Use `.env` locally (git-ignored) and the cloud secret manager elsewhere. If a secret leaks, rotate it immediately and follow `docs/runbooks/secret-leak.md`.

## Local checks

`pnpm lint && pnpm format:check && pnpm typecheck && pnpm test` before pushing. PR titles must follow Conventional Commits (enforced by CI).
