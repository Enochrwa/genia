# Sprint 14: Private beta

- Dates: 3 May 2027 to 14 May 2027
- Capacity: 34 points; committed: 29 (85%)
- Capacity note: Normal capacity; protect the beta fix budget

## Sprint goal

Invited users play with real money under low caps; daily reconciliation ritual running; feedback loop closed.

## Stories

| ID | Epic | Story | Points | Owner role | Depends on |
|---|---|---|---:|---|---|
| G-111 | E10 | Beta release: caps and allow-list configuration, daily reconciliation review ritual | 5 | Backend + PO | G-071, G-072 |
| G-112 | E8 | Beta feedback fixes and UX iteration budget | 13 | Team | G-103 |
| G-114 | E9 | Support training, dispute playbooks and SLA dashboard | 3 | Ops | G-102 |
| G-121 | E10 | Production infrastructure, runbooks, on-call rota and public status page | 8 | DevOps | G-045, G-090 |

## Acceptance criteria

- **G-111**: Beta limited to invited users with low caps
- **G-112**: Top 10 beta issues resolved or scheduled
- **G-114**: Agents pass scenario drills
- **G-121**: Production environment passes smoke tests; runbooks rehearsed

## Sprint review demo

Daily beta review: volumes, reconciliation, top issues.

## Risks

Real-money incidents; beta feedback overwhelming capacity.

## Exit criteria

- Every story meets the [definition of done](README.md#definition-of-done)
- Sprint goal demonstrated at review
- Money-critical changes reviewed by a second engineer
- Docs and ADRs updated where behaviour changed
- Retrospective actions recorded

Navigation: [previous](sprint-13.md) | [plan](sprint-plan.md) | [next](sprint-15.md)
