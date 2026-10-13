# Sprint 4: Deposits and limits

- Dates: 14 Dec 2026 to 25 Dec 2026
- Capacity: 28 points; committed: 23 (82%)
- Capacity note: Christmas week: reduced capacity (about 85 percent)

## Sprint goal

Deposit works end to end with the MTN MoMo sandbox including webhooks and the sweeper; limits enforced.

## Stories

| ID | Epic | Story | Points | Owner role | Depends on |
|---|---|---|---:|---|---|
| G-023 | E2 | Limits model: deposit, loss and time limits stored and enforceable | 5 | Backend | G-021 |
| G-031 | E3 | MTN MoMo collections adapter (sandbox) for deposits | 8 | Backend | G-030 |
| G-032 | E3 | Webhook ingestion: signature check, raw event store, dedupe, queue processing | 5 | Backend | G-030 |
| G-033 | E3 | Deposit state machine, pending sweeper job and receipts | 5 | Backend | G-031, G-032 |

## Acceptance criteria

- **G-023**: Decreases effective immediately, increases after cooling period
- **G-031**: Sandbox deposit completes end to end; provider errors mapped to states
- **G-032**: Replayed webhooks are harmless; provider status re-queried before posting
- **G-033**: Stale pending deposits reach EXPIRED or COMPLETED only after provider check

## Sprint review demo

Deposit in the sandbox, replay the webhook, watch the state machine.

## Risks

MTN sandbox instability and onboarding documentation gaps.

## Intra-sprint dependencies

These stories depend on work finishing earlier in the same sprint, so sequence them accordingly: G-033.

## Exit criteria

- Every story meets the [definition of done](README.md#definition-of-done)
- Sprint goal demonstrated at review
- Money-critical changes reviewed by a second engineer
- Docs and ADRs updated where behaviour changed
- Retrospective actions recorded

Navigation: [previous](sprint-03.md) | [plan](sprint-plan.md) | [next](sprint-05.md)
