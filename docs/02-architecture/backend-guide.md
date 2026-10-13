# Backend Guide

- NestJS modules per bounded context; thin controllers, logic in `domain/` services.
- Validation: zod pipes at the boundary; DTOs generated into OpenAPI.
- Errors: typed domain errors mapped to stable error codes (see `docs/03-api/error-codes.md`).
- Transactions: wallet/ledger operations run in a single DB transaction with row locks.
- Background jobs: BullMQ queues `payments`, `webhooks`, `notifications`, `reconciliation`, `risk`; every job idempotent and retry-safe.
- Config: typed config module; fail fast on missing env.
- Logging: structured JSON, request id on every log, PII redaction.
- Observability: OpenTelemetry traces across HTTP, DB, queue.
- Time: use database/server time; never trust client clocks.
