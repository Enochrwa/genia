# Sprint 7: Play UI and admin auth

- Dates: 25 Jan 2027 to 5 Feb 2027
- Capacity: 32 points; committed: 27 (84%); done: 0
- Capacity note: Heroes Day (1 February) falls in this sprint: reduced capacity

## Sprint goal

A player can play 3 questions in the UI and see results; abandoned games recover; staff login with 2FA and audit.

## Stories

| ID | Epic | Story | Points | Owner role | Depends on | Status |
|---|---|---|---:|---|---|---|
| G-051 | E8 | Game screen: countdown, question counter, answer cards, resume after disconnect | 8 | Frontend | G-043, G-050 | To do |
| G-052 | E8 | Results screen and game history list and detail | 5 | Frontend | G-043 | To do |
| G-054 | E4 | Game recovery job: settle or refund abandoned and crashed games per published rules | 3 | Backend | G-043 | To do |
| G-055 | E5 | Question pool to 500 per category and monthly refresh process | 3 | Content | G-044 | To do |
| G-060 | E6 | Admin authentication: staff login with TOTP 2FA, RBAC guard, audit log | 8 | Backend | G-011 | To do |

## Acceptance criteria

- **G-051**: Countdown reflects server expiresAt; reconnect resumes the same question
- **G-052**: Shows score, prize, correct answers and game reference
- **G-054**: No game remains active beyond its deadline plus grace
- **G-055**: Pool targets met; refresh calendar published
- **G-060**: Every admin action writes an audit record; roles per docs/07-security

## Sprint review demo

Play on a 320 px phone, kill the connection mid-game and resume, log in to admin with TOTP.

## Risks

Mobile network drops; UI performance on low-end Android.

## Exit criteria

- Every story meets the [definition of done](README.md#definition-of-done)
- Sprint goal demonstrated at review
- Money-critical changes reviewed by a second engineer
- Docs and ADRs updated where behaviour changed
- Retrospective actions recorded

Navigation: [previous](sprint-06.md) | [plan](sprint-plan.md) | [next](sprint-08.md)
