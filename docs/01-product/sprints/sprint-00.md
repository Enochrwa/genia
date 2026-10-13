# Sprint 0: Foundations and discovery

- Dates: 19 Oct 2026 to 30 Oct 2026
- Capacity: 26 points; committed: 23 (88%)
- Capacity note: Normal capacity

## Sprint goal

Legal counsel engaged, payout model signed off, owner access obtained, backend and web scaffolds running in CI.

## Stories

| ID | Epic | Story | Points | Owner role | Depends on |
|---|---|---|---:|---|---|
| G-001 | E0 | Owner discovery: interview owner, get access to current IHUGURE code, DB, domain and payment accounts | 3 | PO | none |
| G-002 | E0 | Engage Rwandan counsel: classification and licensing opinion kicked off, regulator contact plan | 3 | PO | none |
| G-003 | E0 | Payout model sign-off: define 200%, partial results, caps, reserve size | 5 | PO + Backend | G-001 |
| G-004 | E0 | Brand clearance for Genia: trademark, domain, app-store names, native-speaker check | 2 | PO | none |
| G-005 | E10 | Backend scaffold: NestJS app, typed config, health and ready endpoints, Dockerfile | 5 | Backend | none |
| G-006 | E10 | Web scaffolds: Next.js player and admin with Tailwind, next-intl, PWA manifest | 5 | Frontend | none |

## Acceptance criteria

- **G-001**: docs/12-operations/owner-questions.md answered and access list recorded
- **G-002**: Counsel engaged, scope and delivery date agreed in writing
- **G-003**: Signed prize table, per-game/user/day/platform caps and reserve target committed to docs/00-overview/economics.md
- **G-004**: Search report stored; go/no-go on name recorded in ADR-0007
- **G-005**: GET /health and /ready return 200 in CI and docker compose; env validation fails fast
- **G-006**: Both apps build in CI; locale routing /rw /en /fr works

## Sprint review demo

Walk through green CI, health endpoints, signed prize table and counsel engagement letter.

## Risks

Owner unavailable or slow to share data; counsel timeline longer than expected.

## Intra-sprint dependencies

These stories depend on work finishing earlier in the same sprint, so sequence them accordingly: G-003.

## Exit criteria

- Every story meets the [definition of done](README.md#definition-of-done)
- Sprint goal demonstrated at review
- Money-critical changes reviewed by a second engineer
- Docs and ADRs updated where behaviour changed
- Retrospective actions recorded

Navigation: [plan](sprint-plan.md) | [next](sprint-01.md)
