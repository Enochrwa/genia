# backend/api: NestJS API

Modular monolith. Modules: auth, users, wallet, ledger, payments, games, questions, risk, notifications, admin, support, leaderboard.
See `docs/02-architecture/backend-guide.md`, `docs/05-money`, `docs/06-game-engine`.

Implemented: health and readiness, phone OTP sign-in, sessions with rotating refresh tokens, profile, transaction PIN (sprint 1). Contract: `docs/03-api/openapi.yaml`.

Scripts: `dev`, `build` (tsup bundle to `dist/main.cjs`), `start`, `db:migrate`, `test`, `test:integration`, `test:coverage`, `lint`, `typecheck`.

Layout: `src/domain` pure logic (no framework), `src/modules/<name>` Nest modules, `src/common` guards, filters, errors, `src/infra` database and Redis, `src/config` validated environment, `src/database/migrations` SQL.
