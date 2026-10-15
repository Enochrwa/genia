# Sprint 9: Finance and country gating

- Dates: 22 Feb 2027 to 5 Mar 2027
- Capacity: 34 points; committed: 29 (85%); done: 0
- Capacity note: Normal capacity

## Sprint goal

Dual-control payout approvals, daily reconciliation, treasury caps and country gating protect funds and legality.

## Stories

| ID | Epic | Story | Points | Owner role | Depends on | Status |
|---|---|---|---:|---|---|---|
| G-070 | E6 | Payout and deposit admin views with approval queue and dual control | 8 | Frontend + Backend | G-060, G-061 | To do |
| G-071 | E2 | Daily reconciliation job against provider statements with mismatch alert and freeze | 8 | Backend | G-061 | To do |
| G-072 | E2 | Treasury: reserve tracking, per game, user and platform daily caps, auto-pause | 8 | Backend | G-043 | To do |
| G-084 | E7 | Country feature gating framework and localized legal page host | 5 | Backend + Frontend | G-041 | To do |

## Acceptance criteria

- **G-070**: Approver differs from requester; large payouts need approval
- **G-071**: Injected mismatch triggers alert and freezes affected payouts
- **G-072**: Games pause when reserve falls below configured minimum
- **G-084**: Real money disabled for any country without an explicit enabled flag (ADR-0005)

## Sprint review demo

Inject a reconciliation mismatch and watch the alert and freeze; show a country with real money disabled.

## Risks

Reconciliation against real provider statement formats.

## Exit criteria

- Every story meets the [definition of done](README.md#definition-of-done)
- Sprint goal demonstrated at review
- Money-critical changes reviewed by a second engineer
- Docs and ADRs updated where behaviour changed
- Retrospective actions recorded

Navigation: [previous](sprint-08.md) | [plan](sprint-plan.md) | [next](sprint-10.md)
