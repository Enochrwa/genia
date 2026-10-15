# Sprint 5: Question service and game config

- Dates: 28 Dec 2026 to 8 Jan 2027
- Capacity: 26 points; committed: 23 (88%); done: 0
- Capacity note: New Year holidays: reduced capacity (about 80 percent)

## Sprint goal

Deposit UI done; question service, game configuration and first question pool in place; staging deploys on merge.

## Stories

| ID | Epic | Story | Points | Owner role | Depends on | Status |
|---|---|---|---:|---|---|---|
| G-034 | E8 | Deposit UI with live status and failure recovery | 5 | Frontend | G-033, G-024 | To do |
| G-040 | E5 | Question service: schema, CRUD API, lifecycle states, importer for content/ JSON | 5 | Backend | G-005 | To do |
| G-041 | E4 | Game config module: versioned prize tables, entry levels, per-country flags | 5 | Backend | G-003, G-012 | To do |
| G-044 | E5 | Seed question pool v1: 3 categories, English and Kinyarwanda, sourced and peer-reviewed | 5 | Content | G-040 | To do |
| G-045 | E10 | Staging infrastructure part 2: ECS services, CDN and WAF, deploy pipeline to staging | 3 | DevOps | G-035 | To do |

## Acceptance criteria

- **G-034**: Pending, Processing, Completed, Failed shown; success only after backend confirms
- **G-040**: Importer validates schema, sources and answer index; duplicates rejected
- **G-041**: Config snapshot stored with every game; defaults off for real money
- **G-044**: At least 300 reviewed questions per category by end of sprint, 500 target in sprint 5
- **G-045**: Merge to main deploys staging with smoke test

## Sprint review demo

Import questions from content/, show a versioned prize table, deploy by merge.

## Risks

Question content quality and review throughput.

## Intra-sprint dependencies

These stories depend on work finishing earlier in the same sprint, so sequence them accordingly: G-044.

## Exit criteria

- Every story meets the [definition of done](README.md#definition-of-done)
- Sprint goal demonstrated at review
- Money-critical changes reviewed by a second engineer
- Docs and ADRs updated where behaviour changed
- Retrospective actions recorded

Navigation: [previous](sprint-04.md) | [plan](sprint-plan.md) | [next](sprint-06.md)
