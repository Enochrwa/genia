# Migrations and Retention

## Migrations

- Versioned, forward-only, reviewed. Destructive changes use expand/contract in separate releases.
- Run in CI against a real Postgres; run in deploy before the new app version.

## Retention

| Data | Retention |
|---|---|
| Ledger, transactions, audit logs | At least 7 years (confirm per jurisdiction) |
| Game records and answers | Same as ledger |
| KYC documents | As required by law; encrypted; deleted after retention |
| OTP codes | 10 minutes |
| Sessions | Until expiry/revocation, then 90 days of metadata |
| Logs | 30-90 days, PII redacted |

## Privacy requests

Export and deletion processes preserve legally required financial records while anonymising profile data.
