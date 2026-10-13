# Sprint Process

How Genia is planned, built and reviewed. The schedule itself is in [sprint-plan.md](sprint-plan.md) and the per-sprint pages `sprint-00.md` to `sprint-15.md`.

## Cadence

- Two-week sprints starting on Monday and ending on the second Friday
- Sprint 0 starts Monday 19 October 2026
- Release train: merge to `main` continuously; staging deploys on merge; production only through the approved release workflow

## Roles

| Role | Responsibility |
|---|---|
| Product owner | Owns the backlog order, payout model, legal gate and acceptance. Works with the business owner of IHUGURE |
| Tech lead | Architecture, ADRs, reviews money-critical code, protects the critical path |
| Engineers | Deliver stories, write tests and docs |
| Designer | Flows, design system, usability tests |
| QA | Test plans, invariant and e2e suites, release sign-off |
| Content and operations | Question pool, translations, support playbooks |

One person may hold several roles in a small team. Two roles must stay separate for money safety: the person who requests a payout and the person who approves it.

## Ceremonies

| Ceremony | When | Length | Output |
|---|---|---|---|
| Backlog refinement | Wednesday of week 1 | 60 min | Next sprint's stories meet the definition of ready |
| Sprint planning | Monday of week 1 | 90 min | Goal, committed stories (at most 90% of capacity), owners |
| Daily standup | Every day | 15 min | Blockers surfaced; async written update is fine for remote teams |
| Mid-sprint check | Wednesday of week 2 | 30 min | Scope adjusted early if the goal is at risk |
| Sprint review and demo | Friday of week 2 | 45 min | Working software shown against the demo script in the sprint page |
| Retrospective | Friday of week 2 | 45 min | Up to 3 actions with owners, tracked in the next sprint |
| Money and risk review | Fridays from sprint 4 | 20 min | Reconciliation status, reserve level, fraud flags, open incidents |

## Estimation

- Story points on the scale 1, 2, 3, 5, 8, 13. One point is about half an ideal day
- Anything above 8 is split before it enters a sprint. The beta fix budget (G-112) is the only deliberate 13
- Re-estimate against measured velocity after sprint 2, then every 3 sprints
- Velocity is the average of completed points over the last 3 sprints; planning uses 90% of it

## Definition of ready

A story is ready when:

- It has a clear user value and acceptance criteria
- Dependencies are done or scheduled earlier
- Designs, copy keys (rw, en, fr) and API contracts exist where needed
- It is 8 points or fewer
- Money, security or regulatory impact is stated

## Definition of done

A story is done when:

- Code is merged to `main` through a reviewed pull request with Conventional Commit title
- Unit tests and, for money, game or database logic, integration and invariant tests pass
- CI is green (`CI passed`), including lint, types, format, build and security checks
- No secrets or personal data in code or logs
- User-facing text exists in rw, en and fr
- Accessibility checks pass for UI changes (WCAG 2.2 AA)
- API changes update the OpenAPI spec and [docs/03-api](../../03-api/endpoints.md)
- Docs and ADRs are updated when behaviour or architecture changed
- Deployed to staging and verified with a smoke test
- Acceptance criteria demonstrated to the product owner

Additional rules for money-critical stories (ledger, wallet, payments, game settlement, admin payouts):

- A second engineer reviews the change (enforced by CODEOWNERS)
- Tests cover failure, retry, concurrency and replay paths
- Idempotency and ledger invariants from [docs/05-money](../../05-money/wallet-and-ledger.md) are re-checked

## Board and labels

GitHub Projects board with columns: Backlog, Ready, In progress, In review, Staging verification, Done.

| Label | Meaning |
|---|---|
| `epic:E0` to `epic:E11` | Epic membership (see the plan) |
| `money` | Touches ledger, wallet, payments or payouts; needs second review |
| `security` | Security or privacy impact |
| `compliance` | Legal or regulatory impact |
| `blocked` | Waiting on an external party, with the blocker named |
| `size:1` to `size:13` | Story points |

Create the milestones and issues from the backlog with `node scripts/sprint/create-github-issues.mjs` (dry run by default; needs a token with Issues write permission).

## Handling change

- Mid-sprint additions replace equal-size work; the product owner decides
- Production incidents and security fixes interrupt the sprint; record the displaced work
- Carry-over stories are re-estimated for the remaining effort and discussed at the retrospective
- Scope cuts follow this order: polish, secondary admin views, Release 2 candidates. Never cut ledger tests, reconciliation, game integrity or the legal gate

## Health metrics

Tracked at each review:

- Committed vs completed points and the 3-sprint velocity trend
- Escaped defects and time to fix
- CI duration and flaky test count
- Money safety: reconciliation mismatches (target 0), payout success rate (above 99%), reserve level
- Support first-response time once the beta starts

## Plan maintenance

`backlog.json` is the source of truth. After editing it run:

```bash
node scripts/sprint/generate.mjs          # regenerate the pages
node scripts/sprint/generate.mjs --check  # CI: validate and detect stale pages
```

The validator rejects duplicate IDs, unknown dependencies, dependencies scheduled after the dependent story, cycles, points off the scale, missing acceptance criteria and any sprint committed above 90% of capacity.
