# ADR-0003: Append-only double-entry ledger

- Status: accepted
- Date: 2026-10-13

## Decision
All money movements are balanced entries in an insert-only ledger; balances derive from it; corrections are reversing transactions. Idempotency key unique per ledger transaction.

## Consequences
Auditable and reconcilable; slightly more complex writes; protects against silent balance edits.
