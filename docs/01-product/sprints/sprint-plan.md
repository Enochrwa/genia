# Sprint Plan

> Generated from [backlog.json](backlog.json) by `scripts/sprint/generate.mjs`. Edit the JSON, then run `node scripts/sprint/generate.mjs`. CI fails if the generated files are stale or the plan breaks its own rules.

## Summary

- Cadence: 16 sprints of 2 weeks, 19 Oct 2026 to 28 May 2027
- Scope: 75 stories, 417 story points planned against 500 points of capacity (83%)
- Rule: commit at most 90% of capacity per sprint; the rest is buffer for bugs, reviews and surprises
- Team assumed: 2 backend or full-stack engineers, 1 frontend engineer, designer 50%, QA 50%, content and operations 50%, product owner
- Target: Rwanda private beta in sprint 14 (3 May 2027), public launch gate in sprint 15 (28 May 2027), subject to the legal gate

## Sprint overview

| Sprint | Dates | Goal | Committed | Capacity | Load |
|---|---|---|---:|---:|---:|
| [0](sprint-00.md) Foundations and discovery | 19 Oct 2026 to 30 Oct 2026 | Legal counsel engaged, payout model signed off, owner access obtained, backend and web scaffolds running in CI | 23 | 26 | 88% |
| [1](sprint-01.md) Accounts | 2 Nov 2026 to 13 Nov 2026 | A user can register with phone OTP, keep a session and set a PIN; design discovery validated with players | 25 | 28 | 89% |
| [2](sprint-02.md) Design system and ledger | 16 Nov 2026 to 27 Nov 2026 | Design system v1 and auth screens usable; ledger service posts balanced, idempotent transactions | 26 | 30 | 87% |
| [3](sprint-03.md) Wallet and staging | 30 Nov 2026 to 11 Dec 2026 | Wallet shows balances and history from the ledger; provider interface exists; staging infrastructure live | 28 | 32 | 88% |
| [4](sprint-04.md) Deposits and limits | 14 Dec 2026 to 25 Dec 2026 | Deposit works end to end with the MTN MoMo sandbox including webhooks and the sweeper; limits enforced | 23 | 28 | 82% |
| [5](sprint-05.md) Question service and game config | 28 Dec 2026 to 8 Jan 2027 | Deposit UI done; question service, game configuration and first question pool in place; staging deploys on merge | 23 | 26 | 88% |
| [6](sprint-06.md) Game engine and withdrawals | 11 Jan 2027 to 22 Jan 2027 | Server-authoritative game runs through the API; entry selection screen done; withdrawal request flow with holds works | 29 | 34 | 85% |
| [7](sprint-07.md) Play UI and admin auth | 25 Jan 2027 to 5 Feb 2027 | A player can play 3 questions in the UI and see results; abandoned games recover; staff login with 2FA and audit | 27 | 32 | 84% |
| [8](sprint-08.md) Payouts and admin tools | 8 Feb 2027 to 19 Feb 2027 | MTN MoMo payouts complete in sandbox; staff manage users and questions; support can view user timelines | 26 | 34 | 76% |
| [9](sprint-09.md) Finance and country gating | 22 Feb 2027 to 5 Mar 2027 | Dual-control payout approvals, daily reconciliation, treasury caps and country gating protect funds and legality | 29 | 34 | 85% |
| [10](sprint-10.md) KYC and fraud | 8 Mar 2027 to 19 Mar 2027 | KYC tiers, age enforcement and fraud flag queue operate; admin KPI dashboard live | 29 | 34 | 85% |
| [11](sprint-11.md) Responsible play and readiness | 22 Mar 2027 to 2 Apr 2027 | Limits, self-exclusion and reality checks enforced; observability, load targets and abuse protection in place | 26 | 30 | 87% |
| [12](sprint-12.md) Security and legal | 5 Apr 2027 to 16 Apr 2027 | Pen test remediated, DR proven, notifications live, legal pages published after counsel review | 26 | 30 | 87% |
| [13](sprint-13.md) Beta preparation | 19 Apr 2027 to 30 Apr 2027 | Existing IHUGURE users and balances migrated with proof, support tooling and onboarding polished, production merchant onboarding done | 29 | 34 | 85% |
| [14](sprint-14.md) Private beta | 3 May 2027 to 14 May 2027 | Invited users play with real money under low caps; daily reconciliation ritual running; feedback loop closed | 29 | 34 | 85% |
| [15](sprint-15.md) Launch | 17 May 2027 to 28 May 2027 | Launch gate passed, production deploy proven, performance targets met, hypercare plan active | 19 | 34 | 56% |

## Progress

24 of 417 points done (6%).

| Sprint | Done | In progress | To do |
|---|---:|---:|---:|
| 0 | 5 | 0 | 18 |
| 1 | 19 | 6 | 0 |
| 2 | 0 | 0 | 26 |
| 3 | 0 | 0 | 28 |
| 4 | 0 | 0 | 23 |
| 5 | 0 | 0 | 23 |
| 6 | 0 | 0 | 29 |
| 7 | 0 | 0 | 27 |
| 8 | 0 | 0 | 26 |
| 9 | 0 | 0 | 29 |
| 10 | 0 | 0 | 29 |
| 11 | 0 | 0 | 26 |
| 12 | 0 | 0 | 26 |
| 13 | 0 | 0 | 29 |
| 14 | 0 | 0 | 29 |
| 15 | 0 | 0 | 19 |

## Release milestones

| Milestone | Sprint | What it means |
|---|---|---|
| M0 Foundations | 0 | Legal engaged, payout model signed, CI and scaffolds running |
| M1 Money core | 4 | Ledger, wallet and sandbox deposits work end to end |
| M2 Playable | 7 | A player can play and see results; staff can log in with 2FA |
| M3 Payable | 8 | Sandbox payouts complete; admin manages users and questions |
| M4 Controlled | 10 | Dual control, reconciliation, treasury caps, KYC and fraud flags |
| M5 Safe | 12 | Responsible play, security review, load, DR and legal pages done |
| M6 Private beta | 14 | Invited users, real money, low caps |
| M7 Launch gate | 15 | Launch checklist ticked and production deploy proven |

## Epics

| Epic | Name | Stories | Points | Sprints |
|---|---|---:|---:|---|
| E0 | Discovery, legal and launch | 7 | 29 | 0, 12, 13, 15 |
| E1 | Authentication and accounts | 4 | 19 | 1 |
| E2 | Ledger and wallet | 7 | 44 | 2, 3, 4, 9 |
| E3 | Payments | 7 | 44 | 3, 4, 6, 8, 13 |
| E4 | Game engine | 4 | 24 | 5, 6, 7 |
| E5 | Question bank | 3 | 13 | 5, 7 |
| E6 | Admin console | 6 | 39 | 7, 8, 9, 10 |
| E7 | Risk, KYC and responsible play | 8 | 50 | 9, 10, 11, 12 |
| E8 | Player experience | 9 | 59 | 2, 3, 5, 6, 7, 13, 14, 15 |
| E9 | Notifications and support | 4 | 19 | 12, 13, 14, 15 |
| E10 | DevOps and observability | 13 | 66 | 0, 1, 2, 3, 5, 11, 12, 14, 15 |
| E11 | Design and brand | 3 | 11 | 1, 2, 12 |

## Critical path

Longest chain of dependent work (58 points): G-005 -> G-012 -> G-020 -> G-021 -> G-023 -> G-053 -> G-061 -> G-071 -> G-111 -> G-120.

- G-005: Backend scaffold: NestJS app, typed config, health and ready endpoints, Dockerfile (sprint 0)
- G-012: Users and profile model: migration, locale, country, status, one account per phone (sprint 1)
- G-020: Ledger service over migration 0001: postings, idempotency, row-locked transactions (sprint 2)
- G-021: Wallet module: cash, bonus and hold balances derived from the ledger (sprint 2)
- G-023: Limits model: deposit, loss and time limits stored and enforceable (sprint 4)
- G-053: Withdrawal request flow: PIN, limit checks, fee preview, hold posting, state machine (sprint 6)
- G-061: MTN MoMo disbursement adapter and payout worker with retries (sprint 8)
- G-071: Daily reconciliation job against provider statements with mismatch alert and freeze (sprint 9)
- G-111: Beta release: caps and allow-list configuration, daily reconciliation review ritual (sprint 14)
- G-120: Launch gate review: legal gate, reserve funded, reconciliation clean for 14 days (sprint 15)

Delays on this chain move the launch date. Protect it first when capacity drops.

## Capacity adjustments

| Sprint | Note |
|---|---|
| 4 | Christmas week: reduced capacity (about 85 percent) |
| 5 | New Year holidays: reduced capacity (about 80 percent) |
| 7 | Heroes Day (1 February) falls in this sprint: reduced capacity |
| 11 | Easter (late March) falls in this sprint: reduced capacity |
| 12 | Kwibuka commemoration period (from 7 April): reduced capacity |
| 15 | Light commitment on purpose: buffer for launch issues |

Verify public holidays against the official Rwandan calendar before each sprint planning.

## Plan assumptions and decisions

1. **MTN MoMo first.** Launch uses MTN MoMo only. Airtel Money collections and payouts (R-001, R-002) are a fast follow. If the owner needs Airtel at launch, add about two sprints.
2. **Legal gate.** Real money stays behind the country feature flag. If counsel's opinion or licensing is not complete by sprint 12, the beta and launch slip and the product can run in free-to-play mode (see `docs/08-compliance`).
3. **Payout model.** Sprint 0 must fix the meaning of "200%" and partial results (G-003). Game configuration (G-041) and prize logic depend on it.
4. **Migration.** Existing IHUGURE balances migrate only when provable against payment records (G-101).
5. **Content is capacity.** Question writing and review uses the content and operations person; if that role is missing, the pool targets in G-044 and G-055 will not be met.
6. **Estimates are relative.** Points use 1, 2, 3, 5, 8, 13; 1 point is roughly half an ideal day. Re-estimate after sprint 2 using measured velocity.

## If the team is smaller

The plan scales with velocity. Planned work is 417 points.

| Team | Velocity per sprint | Sprints needed (at 90% commitment) | Approx. duration |
|---|---:|---:|---|
| Baseline team (this plan, includes ramp-up and holiday dips) | 34 peak | 16 | about 7 months |
| 2 full-time engineers | 22 | 22 | about 10 months |
| 1 full-time engineer | 12 | 39 | about 18 months |
| 1 part-time engineer (about 15 h per week) | 6 | 78 | about 36 months |

For a solo or part-time team, cut scope instead of stretching dates: launch with one category, a smaller admin and manual payout approval first, and keep the money-critical items (ledger, payments, game integrity, reconciliation, legal gate) intact.

## Release 2 backlog (not scheduled)

Epic-sized items; split and estimate them when they enter a sprint.

| ID | Item | Points | Why |
|---|---|---:|---|
| R-001 | Airtel Money collections adapter (deposits) | 5 | Second payment rail; launch is MTN MoMo first. Move into the plan if the owner requires Airtel at launch (adds about 2 sprints) |
| R-002 | Airtel Money disbursement adapter (payouts) | 5 | Pairs with R-001 |
| R-003 | Report-question flow in game results | 3 | Improves question quality; admin tools already support retirement |
| R-004 | Question pool to 1000 per category with correct-rate retirement | 5 | Anti-memorisation; needs real play data |
| R-005 | Leaderboards (daily, weekly, monthly, all-time) and monthly rewards programme with published rules | 8 | Retention and replaces the informal monthly reward |
| R-006 | Achievements and streaks | 5 | Retention |
| R-007 | Daily challenge | 5 | Retention |
| R-008 | Difficulty tiers and additional categories (Rwanda, Africa, World, Technology, Science) | 8 | Content breadth |
| R-009 | Push notifications and analytics dashboard | 13 | Engagement and decision support |
| R-010 | Passkeys (WebAuthn) for players | 5 | Stronger, simpler login |
| R-011 | Card and regional payment adapters behind the provider interface | 13 | Global expansion; only after legal gate for each country |
| R-012 | Second-market readiness: legal opinion, licensing, languages, currency, KYC | 13 | Follows docs/08-compliance/market-entry-checklist.md |
| R-013 | React Native app on shared packages | 13 | Native distribution and push |
| R-014 | Multiplayer rooms, head-to-head and tournaments | 21 | Growth feature; high regulatory and fraud exposure, needs its own design |

See also [process and ceremonies](README.md).
