# Sprint 12: Security and legal

- Dates: 5 Apr 2027 to 16 Apr 2027
- Capacity: 30 points; committed: 26 (87%)
- Capacity note: Kwibuka commemoration period (from 7 April): reduced capacity

## Sprint goal

Pen test remediated, DR proven, notifications live, legal pages published after counsel review.

## Stories

| ID | Epic | Story | Points | Owner role | Depends on |
|---|---|---|---:|---|---|
| G-092 | E7 | Security review and penetration test with remediation | 8 | Security + Backend | G-060, G-080 |
| G-094 | E10 | Backup and restore drill, disaster recovery runbook, chaos tests | 5 | DevOps | G-035 |
| G-095 | E9 | Notifications: SMS, email and in-app for deposits, wins and withdrawals | 5 | Backend | G-016, G-061 |
| G-100 | E0 | Legal pages localized (terms, privacy, refund, responsible play, payment policy) after counsel review | 5 | PO + Counsel | G-002, G-084 |
| G-104 | E11 | Brand identity: logo, icons, store and social assets for Genia | 3 | Designer | G-004 |

## Acceptance criteria

- **G-092**: No open critical or high findings
- **G-094**: Restore within RTO 1 hour; chaos scenarios documented
- **G-095**: Templates in rw/en/fr; delivery tracked
- **G-100**: Published in rw, en, fr with licence details
- **G-104**: Assets approved by owner

## Sprint review demo

Show pen test report with zero critical or high findings, restore a backup, receive a win SMS.

## Risks

Counsel review delays blocking legal pages; critical findings late in the sprint.

## Exit criteria

- Every story meets the [definition of done](README.md#definition-of-done)
- Sprint goal demonstrated at review
- Money-critical changes reviewed by a second engineer
- Docs and ADRs updated where behaviour changed
- Retrospective actions recorded

Navigation: [previous](sprint-11.md) | [plan](sprint-plan.md) | [next](sprint-13.md)
