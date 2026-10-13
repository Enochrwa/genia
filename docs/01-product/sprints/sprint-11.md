# Sprint 11: Responsible play and readiness

- Dates: 22 Mar 2027 to 2 Apr 2027
- Capacity: 30 points; committed: 26 (87%)
- Capacity note: Easter (late March) falls in this sprint: reduced capacity

## Sprint goal

Limits, self-exclusion and reality checks enforced; observability, load targets and abuse protection in place.

## Stories

| ID | Epic | Story | Points | Owner role | Depends on |
|---|---|---|---:|---|---|
| G-083 | E7 | Responsible play: limits UI, self-exclusion, cool-off and reality checks | 8 | Frontend + Backend | G-023 |
| G-090 | E10 | Observability: OpenTelemetry, Sentry, dashboards and alerts for payments, ledger, reserve | 8 | DevOps | G-045 |
| G-091 | E10 | Load testing and tuning at 5x expected peak with k6 | 5 | QA + DevOps | G-045, G-043 |
| G-093 | E7 | Abuse hardening: Cloudflare bot protection, API rate limits, webhook allow-lists | 5 | DevOps + Backend | G-045 |

## Acceptance criteria

- **G-083**: Excluded users cannot play or deposit; tested end to end
- **G-090**: Alert rules from docs/09-devops/observability.md live in staging
- **G-091**: p95 under 300 ms and answers under 150 ms at target load
- **G-093**: Rate limit and bot tests pass in staging

## Sprint review demo

Self-exclude and try to play; show dashboards and the load test result.

## Risks

Load test environment parity with production.

## Exit criteria

- Every story meets the [definition of done](README.md#definition-of-done)
- Sprint goal demonstrated at review
- Money-critical changes reviewed by a second engineer
- Docs and ADRs updated where behaviour changed
- Retrospective actions recorded

Navigation: [previous](sprint-10.md) | [plan](sprint-plan.md) | [next](sprint-12.md)
