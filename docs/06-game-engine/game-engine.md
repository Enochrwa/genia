# Game Engine Specification

## Principles
Server-authoritative: the browser renders; the server owns the question, correct answer, timer, score and prize.

## Flow
1. `POST /games {entryLevel, category}` with idempotency key.
2. Server verifies eligibility (age/KYC, limits, balance, country flag), places hold, selects questions.
3. Server returns question 1 without answer: `questionId`, shuffled options, `expiresAt`.
4. Client posts `{questionId, optionId}`; server accepts if `now <= expiresAt + grace` (fixed 300-500 ms, disclosed).
5. After the last question the server scores, settles the ledger, returns result with correct answers.
6. Disconnects: the server timer continues; unanswered questions count as missed; client may resume while the game is active.

## Question selection
Random from the approved pool by category and fixed difficulty; per-user exposure limits; minimum pool 500+ per category; monthly refresh.

## Scoring and prizes
Prize table is configuration (`game_configs.prize_table`), versioned, snapshotted into each game. Partial outcomes explicitly defined (none, refund, partial).

## Caps and risk limits
Per-game, per-user-daily, platform-daily payout caps; automatic pause when reserve is low.

## Question lifecycle
`draft -> review -> approved -> active -> flagged -> retired`. Each question stores language, difficulty, source, correct-rate statistics, report count.

## Fairness evidence
Persist question IDs, option order, timestamps, answers for every game. Later: publish a per-game seed commitment for verifiability.
