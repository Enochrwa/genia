# Threat Model (STRIDE summary)

| Asset | Threat | Mitigation |
|---|---|---|
| Wallet funds | Double spend, race conditions | Row locks, idempotency, ledger invariants |
| Withdrawals | Account takeover | PIN, device checks, cooling period, limits, manual review |
| Webhooks | Forged events | Signature + provider re-query |
| Game integrity | Answer leakage, timer abuse | Server authority, no answers in responses |
| Admin console | Credential theft | 2FA, IP rules, audit, least privilege |
| KYC data | Breach | Field encryption, restricted access, retention limits |
| API | Abuse, DDoS | WAF, rate limits, autoscaling |
| Supply chain | Malicious packages | Lockfile, scanning, pinned versions, review |
| Insider | Fraudulent payout approval | Dual control for large payouts, audit |

Review quarterly and after any major feature.
