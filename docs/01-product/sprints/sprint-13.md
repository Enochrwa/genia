# Sprint 13: Beta preparation

- Dates: 19 Apr 2027 to 30 Apr 2027
- Capacity: 34 points; committed: 29 (85%); done: 0
- Capacity note: Normal capacity

## Sprint goal

Existing IHUGURE users and balances migrated with proof, support tooling and onboarding polished, production merchant onboarding done.

## Stories

| ID | Epic | Story | Points | Owner role | Depends on | Status |
|---|---|---|---:|---|---|---|
| G-101 | E0 | Migration of IHUGURE users and balances: export, reconcile, opening postings, user comms | 8 | Backend + PO | G-001, G-020 | To do |
| G-102 | E9 | Support: in-app tickets, admin handling, WhatsApp line, localized macros | 8 | Backend + Frontend | G-074 | To do |
| G-103 | E8 | Onboarding, how-it-works, help centre, low-data mode, PWA install, accessibility pass | 8 | Frontend + Designer | G-015 | To do |
| G-110 | E3 | Production merchant onboarding with MTN and Airtel | 5 | PO + Backend | G-061 | To do |

## Acceptance criteria

- **G-101**: Every migrated balance proven against payment records; unprovable balances excluded
- **G-102**: Ticket numbers issued; first-response SLA tracked
- **G-103**: WCAG 2.2 AA checks in CI; LCP budget met on throttled 3G
- **G-110**: Production credentials in secret manager; test transactions succeed

## Sprint review demo

Migrate a dry-run dataset and reconcile it to zero difference; raise and resolve a support ticket.

## Risks

Unprovable legacy balances; merchant approval delays.

## Exit criteria

- Every story meets the [definition of done](README.md#definition-of-done)
- Sprint goal demonstrated at review
- Money-critical changes reviewed by a second engineer
- Docs and ADRs updated where behaviour changed
- Retrospective actions recorded

Navigation: [previous](sprint-12.md) | [plan](sprint-plan.md) | [next](sprint-14.md)
