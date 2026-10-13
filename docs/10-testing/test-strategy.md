# Test Strategy

| Level | Tool | Focus |
|---|---|---|
| Unit | Vitest/Jest | Domain logic: scoring, prize table, ledger postings |
| Integration | Jest + real Postgres/Redis (testcontainers) | Repositories, transactions, locks, idempotency |
| Contract | OpenAPI + schema tests | API stability, generated client |
| End-to-end | Playwright | Register, deposit (sandbox), play, withdraw |
| Load | k6 | Peak game starts, answer submissions, webhook bursts |
| Security | OWASP ZAP, dependency scans, pen test | Auth, injection, access control |
| Accessibility | axe in CI | Critical flows |

## Money-critical tests (mandatory)

- Concurrent withdrawals cannot overspend.
- Same idempotency key twice yields one effect.
- Webhook replay is harmless.
- Ledger entries always sum to zero.
- Late answers are rejected; answers never appear in responses.
- Crash between steps leaves a recoverable state (hold released or settled by recovery job).

## Coverage targets

Domain and ledger code > 90%; overall > 75%.

## Where tests live

| Area | Location | Command |
|---|---|---|
| Domain logic (ledger, game, economics) | `backend/api/tests/*.test.ts` | `pnpm --filter @genia/api test` |
| Database invariants (append-only, balanced, idempotent, concurrent settle) | `backend/api/tests/integration` | `pnpm --filter @genia/api test:integration` (needs `DATABASE_URL`) |
| Shared types and state machines | `common/types/tests` | `pnpm --filter @genia/types test` |
| Translations parity | `common/i18n/tests` | `pnpm --filter @genia/i18n test` |
| API client | `common/api-client/tests` | `pnpm --filter @genia/api-client test` |
| Design tokens (WCAG contrast) | `common/ui/tests` | `pnpm --filter @genia/ui test` |
| Admin RBAC and dual control | `web/admin/tests` | `pnpm --filter @genia/web-admin test` |
| Load | `scripts/load/k6-game-flow.js` | `k6 run scripts/load/k6-game-flow.js` |

CI runs all of these; see `docs/09-devops/github-actions.md`.
