# Observability

- Logs: structured JSON, request ID, PII redaction.
- Metrics: RED (rate, errors, duration) per endpoint; queue depth and age; DB connections; business metrics (games/min, deposits, payouts).
- Traces: OpenTelemetry across HTTP, DB, Redis, queues.
- Errors: Sentry for web and API.
- Dashboards: Platform health, Payments, Game engine, Treasury.

## Alerts (examples)
Payment failure rate > 5% over 10 min; webhook lag > 2 min; ledger mismatch; reserve below threshold; API p95 > 500 ms; error rate > 2%; OTP delivery failures spike.

## Status page
Public status page with incident history.
