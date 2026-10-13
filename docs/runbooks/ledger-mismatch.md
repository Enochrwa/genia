# Runbook: Ledger Mismatch

## Symptoms

Reconciliation alert; sum-to-zero invariant failure; user balance disagrees with ledger.

## Immediate actions

1. Freeze payouts for the affected provider/users.
2. Snapshot DB and logs.
3. Identify first divergent transaction; compare with provider statement.

## Resolution

Post reversing/correcting ledger transactions (never edit entries), document, unfreeze after finance sign-off, root-cause review.
