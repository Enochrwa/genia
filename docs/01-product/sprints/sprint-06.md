# Sprint 6: Game engine and withdrawals

- Dates: 11 Jan 2027 to 22 Jan 2027
- Capacity: 34 points; committed: 29 (85%); done: 0
- Capacity note: Normal capacity

## Sprint goal

Server-authoritative game runs through the API; entry selection screen done; withdrawal request flow with holds works.

## Stories

| ID | Epic | Story | Points | Owner role | Depends on | Status |
|---|---|---|---:|---|---|---|
| G-042 | E4 | Game session service: start with hold, question selection, server timers in Redis | 8 | Backend | G-020, G-040, G-041 | To do |
| G-043 | E4 | Answer endpoint: deadline with grace, scoring, settlement postings, idempotent | 8 | Backend | G-042 | To do |
| G-050 | E8 | Category and entry selection with rules summary and confirm screen | 5 | Frontend | G-041, G-014 | To do |
| G-053 | E3 | Withdrawal request flow: PIN, limit checks, fee preview, hold posting, state machine | 8 | Backend | G-013, G-023, G-030 | To do |

## Acceptance criteria

- **G-042**: One active game per user; questions never contain the correct answer
- **G-043**: Late answers rejected; settlement can run exactly once under concurrency
- **G-050**: Entry, prize, questions, time and refund rules shown on the confirm screen
- **G-053**: Double submit creates one withdrawal; funds held until outcome

## Sprint review demo

Play a full game via API with timers and settlement; request a withdrawal and see the hold.

## Risks

Settlement correctness under concurrency; timer fairness on slow networks.

## Intra-sprint dependencies

These stories depend on work finishing earlier in the same sprint, so sequence them accordingly: G-043.

## Exit criteria

- Every story meets the [definition of done](README.md#definition-of-done)
- Sprint goal demonstrated at review
- Money-critical changes reviewed by a second engineer
- Docs and ADRs updated where behaviour changed
- Retrospective actions recorded

Navigation: [previous](sprint-05.md) | [plan](sprint-plan.md) | [next](sprint-07.md)
