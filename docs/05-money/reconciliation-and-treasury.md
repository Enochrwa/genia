# Reconciliation and Treasury

## Daily reconciliation job
1. Pull provider settlement statements.
2. Compare to ledger totals per provider and per day.
3. Compare ledger sum-to-zero invariant and materialised balances.
4. Any mismatch: alert finance, freeze affected payouts, open an incident.

## Treasury controls
- Payout reserve must stay above `max_outstanding_exposure x safety_multiple`.
- Alert at 150% and pause new high-entry games at 110% of the minimum.
- Daily platform payout cap; per-user daily cap; per-game cap.
- Separate float accounts per provider with minimum balances.

## Reporting
Daily: deposits, withdrawals, revenue, prizes paid, reserve level, failed payments.
Monthly: tax and regulatory reports as required per jurisdiction.
