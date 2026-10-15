# Sprint 3: Wallet and staging

- Dates: 30 Nov 2026 to 11 Dec 2026
- Capacity: 32 points; committed: 28 (88%); done: 0
- Capacity note: Normal capacity

## Sprint goal

Wallet shows balances and history from the ledger; provider interface exists; staging infrastructure live.

## Stories

| ID | Epic | Story | Points | Owner role | Depends on | Status |
|---|---|---|---:|---|---|---|
| G-022 | E2 | Transaction history API and receipts with reference IDs | 5 | Backend | G-021 | To do |
| G-024 | E8 | Wallet UI: balance card, history list, status chips, receipt view | 5 | Frontend | G-021, G-014 | To do |
| G-026 | E2 | Invariant and concurrency test pack: double spend, replay, crash between steps | 5 | QA + Backend | G-020 | To do |
| G-030 | E3 | Provider adapter interface plus fake provider with configurable delay and failure | 5 | Backend | G-021 | To do |
| G-035 | E10 | Staging infrastructure part 1: Terraform VPC, RDS PostgreSQL, Redis, secrets | 8 | DevOps | G-005 | To do |

## Acceptance criteria

- **G-022**: Paginated, filterable by type and status; receipt includes date, amount, fee, status, reference
- **G-024**: Handles loading, empty and error states; accessible
- **G-026**: Tests fail if any invariant in docs/05-money breaks
- **G-030**: Fake provider drives all deposit and withdrawal states in tests
- **G-035**: Staging database reachable from app; terraform workflow green

## Sprint review demo

Open the wallet UI with seeded history; deploy to staging.

## Risks

Terraform and cloud account setup delays.

## Exit criteria

- Every story meets the [definition of done](README.md#definition-of-done)
- Sprint goal demonstrated at review
- Money-critical changes reviewed by a second engineer
- Docs and ADRs updated where behaviour changed
- Retrospective actions recorded

Navigation: [previous](sprint-02.md) | [plan](sprint-plan.md) | [next](sprint-04.md)
