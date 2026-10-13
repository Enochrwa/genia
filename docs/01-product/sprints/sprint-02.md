# Sprint 2: Design system and ledger

- Dates: 16 Nov 2026 to 27 Nov 2026
- Capacity: 30 points; committed: 26 (87%)
- Capacity note: Normal capacity

## Sprint goal

Design system v1 and auth screens usable; ledger service posts balanced, idempotent transactions.

## Stories

| ID | Epic | Story | Points | Owner role | Depends on |
|---|---|---|---:|---|---|
| G-014 | E11 | Design system v1: tokens, core components in common/ui, Figma library | 5 | Designer + Frontend | G-007 |
| G-015 | E8 | Web auth screens: language, onboarding, phone and OTP, age confirmation | 5 | Frontend | G-006, G-010 |
| G-020 | E2 | Ledger service over migration 0001: postings, idempotency, row-locked transactions | 8 | Backend | G-012 |
| G-021 | E2 | Wallet module: cash, bonus and hold balances derived from the ledger | 5 | Backend | G-020 |
| G-025 | E10 | Playwright suite: register, login, home smoke on chromium and mobile-chrome | 3 | QA | G-015 |

## Acceptance criteria

- **G-014**: Wallet card, category card, countdown, answer button, status chips, toast, modal available; AA contrast tests green
- **G-015**: Works at 320 px; rw/en/fr strings complete
- **G-020**: All postings in backend/api/src/domain/ledger.ts persisted; concurrent tests pass
- **G-021**: Balance equals ledger sum in property tests; cannot go negative
- **G-025**: e2e workflow runs green in CI

## Sprint review demo

Sign up in the UI, then show ledger entries produced by a test posting and the concurrency tests.

## Risks

Ledger concurrency bugs; design delays blocking UI work.

## Intra-sprint dependencies

These stories depend on work finishing earlier in the same sprint, so sequence them accordingly: G-021, G-025.

## Exit criteria

- Every story meets the [definition of done](README.md#definition-of-done)
- Sprint goal demonstrated at review
- Money-critical changes reviewed by a second engineer
- Docs and ADRs updated where behaviour changed
- Retrospective actions recorded

Navigation: [previous](sprint-01.md) | [plan](sprint-plan.md) | [next](sprint-03.md)
