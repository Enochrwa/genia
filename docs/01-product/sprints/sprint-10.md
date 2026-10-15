# Sprint 10: KYC and fraud

- Dates: 8 Mar 2027 to 19 Mar 2027
- Capacity: 34 points; committed: 29 (85%); done: 0
- Capacity note: Normal capacity

## Sprint goal

KYC tiers, age enforcement and fraud flag queue operate; admin KPI dashboard live.

## Stories

| ID | Epic | Story | Points | Owner role | Depends on | Status |
|---|---|---|---:|---|---|---|
| G-073 | E6 | Admin dashboard KPIs: users, deposits, withdrawals, games, revenue, reserve | 5 | Frontend | G-070 | To do |
| G-080 | E7 | KYC integration (Smile Identity): tiers and withdrawal gating | 8 | Backend | G-053 | To do |
| G-081 | E7 | Age enforcement: verified 18+ before first withdrawal, under-age block | 3 | Backend | G-080 | To do |
| G-082 | E7 | Fraud rules engine v1: device, IP and phone linkage, response-time anomalies, rapid cycling | 8 | Backend | G-043 | To do |
| G-085 | E7 | Fraud and flag review queue in admin with actions and appeal notes | 5 | Frontend | G-082, G-060 | To do |

## Acceptance criteria

- **G-073**: Numbers reconcile with ledger queries
- **G-080**: Tier 2 required for first withdrawal; documents encrypted
- **G-081**: Under-age accounts cannot deposit or withdraw
- **G-082**: Rules produce flags with evidence; no automatic accusation
- **G-085**: Analyst can restrict, clear or escalate with audit trail

## Sprint review demo

Complete KYC in sandbox, trigger a fraud flag and review it.

## Risks

KYC provider coverage for Rwandan IDs; false-positive fraud flags.

## Intra-sprint dependencies

These stories depend on work finishing earlier in the same sprint, so sequence them accordingly: G-081, G-085.

## Exit criteria

- Every story meets the [definition of done](README.md#definition-of-done)
- Sprint goal demonstrated at review
- Money-critical changes reviewed by a second engineer
- Docs and ADRs updated where behaviour changed
- Retrospective actions recorded

Navigation: [previous](sprint-09.md) | [plan](sprint-plan.md) | [next](sprint-11.md)
