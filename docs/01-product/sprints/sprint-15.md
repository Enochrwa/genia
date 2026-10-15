# Sprint 15: Launch

- Dates: 17 May 2027 to 28 May 2027
- Capacity: 34 points; committed: 19 (56%); done: 0
- Capacity note: Light commitment on purpose: buffer for launch issues

## Sprint goal

Launch gate passed, production deploy proven, performance targets met, hypercare plan active.

## Stories

| ID | Epic | Story | Points | Owner role | Depends on | Status |
|---|---|---|---:|---|---|---|
| G-120 | E0 | Launch gate review: legal gate, reserve funded, reconciliation clean for 14 days | 3 | PO | G-100, G-111 | To do |
| G-122 | E10 | Production deploy pipeline with approvals, automatic rollback and smoke tests | 5 | DevOps | G-121 | To do |
| G-123 | E8 | Performance and polish pass against budgets | 5 | Frontend | G-112 | To do |
| G-124 | E9 | Launch communications and localized marketing assets | 3 | PO + Designer | G-104 | To do |
| G-125 | E10 | Hypercare plan: first 2 weeks monitoring, daily standups, rollback criteria | 3 | Team | G-121 | To do |

## Acceptance criteria

- **G-120**: docs/12-operations/launch-checklist.md fully ticked
- **G-122**: deploy-production workflow succeeds on a release candidate
- **G-123**: LCP under 2.5 s on 3G for home and game routes
- **G-124**: Assets approved; support briefed
- **G-125**: Plan agreed and rotas filled

## Sprint review demo

Production release with approvals, smoke tests and rollback rehearsal.

## Risks

Legal gate not cleared (launch slips; keep free-to-play mode); last-minute defects.

## Exit criteria

- Every story meets the [definition of done](README.md#definition-of-done)
- Sprint goal demonstrated at review
- Money-critical changes reviewed by a second engineer
- Docs and ADRs updated where behaviour changed
- Retrospective actions recorded

Navigation: [previous](sprint-14.md) | [plan](sprint-plan.md)
