# Sprint 8: Payouts and admin tools

- Dates: 8 Feb 2027 to 19 Feb 2027
- Capacity: 34 points; committed: 26 (76%); done: 0
- Capacity note: Normal capacity

## Sprint goal

MTN MoMo payouts complete in sandbox; staff manage users and questions; support can view user timelines.

## Stories

| ID | Epic | Story | Points | Owner role | Depends on | Status |
|---|---|---|---:|---|---|---|
| G-061 | E3 | MTN MoMo disbursement adapter and payout worker with retries | 8 | Backend | G-053, G-031 | To do |
| G-062 | E6 | Admin users list and detail: suspend, view limits and status | 5 | Frontend | G-060 | To do |
| G-063 | E6 | Question management UI: CRUD, bulk import, search, filter, disable | 8 | Frontend | G-060, G-040 | To do |
| G-074 | E6 | Support dispute view: timeline of a user's games, questions, answers and ledger entries | 5 | Frontend | G-062 | To do |

## Acceptance criteria

- **G-061**: Sandbox payouts complete; failures return funds via reversing postings
- **G-062**: Actions require role and are audited
- **G-063**: Non-technical editor can add 20 questions in 10 minutes
- **G-074**: Support can resolve a dispute without database access

## Sprint review demo

Approve a sandbox payout, add 20 questions in the admin, open a dispute timeline.

## Risks

Disbursement edge cases (timeouts, partial failures).

## Intra-sprint dependencies

These stories depend on work finishing earlier in the same sprint, so sequence them accordingly: G-074.

## Exit criteria

- Every story meets the [definition of done](README.md#definition-of-done)
- Sprint goal demonstrated at review
- Money-critical changes reviewed by a second engineer
- Docs and ADRs updated where behaviour changed
- Retrospective actions recorded

Navigation: [previous](sprint-07.md) | [plan](sprint-plan.md) | [next](sprint-09.md)
