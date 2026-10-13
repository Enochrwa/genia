# Product Requirements Document (PRD)

## 1. Problem
Players want a fair, understandable way to test knowledge for rewards on mobile. The current prototype lacks wallet, transparency and security.

## 2. Personas
Casual player, competitive player, admin/operations, finance manager, support agent.

## 3. Scope by phase

### Phase 1: Foundation (must have)
- Responsive PWA; install to home screen
- Phone + OTP registration and login; transaction PIN; 18+ verification before first withdrawal
- Wallet: cash, bonus, holds, history, receipts
- Deposits and withdrawals via MTN MoMo and Airtel Money with status states
- Game flow: entry level, category, rules and prize shown, confirm, play, result with correct answers
- Server-side question selection, timers, scoring, prize calculation
- Admin console: users, questions, categories, deposits, withdrawals, payout approvals, flags, audit log
- Terms, privacy, refund, responsible-play pages in en/fr/rw
- Support tickets and contact channels

### Phase 2: Retention and quality
Game history review, leaderboards, difficulty tiers, more categories, question reporting, notifications (in-app, SMS, email, push), achievements, daily challenge, limits and self-exclusion, analytics.

### Phase 3: Global growth
More currencies and payment rails, more languages, multiplayer and tournaments, referrals with abuse controls, native apps, ML fraud scoring, public API.

## 4. Non-functional requirements
| Area | Target |
|---|---|
| Availability | 99.9% |
| API latency | p95 < 300 ms; answer processing p95 < 150 ms |
| Recovery | RPO <= 5 min, RTO <= 1 h |
| Accessibility | WCAG 2.2 AA |
| Devices | 320 px and up, low-end Android, 3G |
| Locales | en, fr, rw at launch; extensible |

## 5. Out of scope (for now)
Social feed, chat, crypto/NFT, anything that adds regulatory exposure before licensing.

## 6. Open decisions
See `docs/12-operations/owner-questions.md`.
