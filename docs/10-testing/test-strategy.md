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
