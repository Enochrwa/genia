# Wallet and Ledger Specification

## Rules

1. Integer minor units plus currency code on every amount. No floats.
2. Double-entry, append-only ledger. Entries are never edited; corrections are new reversing transactions.
3. Balances are derived from, and reconcilable to, the ledger.
4. Every money operation carries an idempotency key.
5. Updates run in DB transactions with row locks (`SELECT ... FOR UPDATE`); balances can never go negative.

## Accounts

| Account | Purpose |
|---|---|
| `user:{id}:cash` | Withdrawable funds |
| `user:{id}:bonus` | Promotional funds with release rules |
| `user:{id}:hold` | Entry reserved during a game |
| `platform:game_pool` | Entries for active games |
| `platform:revenue` | Retained margin and fees |
| `platform:payout_reserve` | Funds backing prizes |
| `provider:{name}:clearing` | Money in flight with providers |

## Postings

| Event | Debit | Credit |
|---|---|---|
| Deposit confirmed | provider clearing | user cash |
| Game start | user cash | user hold |
| Win | hold + reserve | user cash (prize) and revenue (margin as defined) |
| Loss | user hold | platform revenue |
| Abandoned / system failure | user hold | user cash (refund per rules) |
| Withdrawal requested | user cash | user hold (withdrawal) |
| Withdrawal completed | user hold | provider clearing |
| Withdrawal failed | user hold | user cash |

## State machines

- Deposit: `CREATED -> PENDING -> COMPLETED | FAILED | EXPIRED`
- Withdrawal: `REQUESTED -> RISK_REVIEW -> APPROVED -> PROCESSING -> COMPLETED | FAILED -> REVERSED`
- Success is declared only after provider confirmation.

## Controls

Transaction PIN, verified phone, KYC thresholds, daily/monthly limits, new-account cooling period, manual review above thresholds, block while fraud flags are open.

## Multi-currency

One wallet per currency. Conversion is an explicit, logged ledger operation with recorded rate. No silent auto-conversion.

## Receipts

Human-readable reference, timestamp, amounts, fee, status; downloadable.
