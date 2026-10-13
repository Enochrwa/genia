# API Conventions

- Base path `/v1`, JSON, OpenAPI 3.1 contract in `docs/03-api/openapi.yaml` (generated, committed).
- Auth: access token (short-lived) in httpOnly cookie or `Authorization: Bearer`; refresh rotation.
- `Idempotency-Key` header required on POSTs that move money or start games.
- Pagination: cursor-based (`?cursor=&limit=`), default 20, max 100.
- Every response carries `X-Request-Id`.
- Money: `{ "amount": 50000, "currency": "RWF" }` integer minor units.
- Timestamps: ISO 8601 UTC.
- Rate limits returned via `429` with `Retry-After`.
