# Game Economics

Assumption: 3 questions, 3 options, winner receives 2x entry only if all 3 are correct.

- Guesser: win chance (1/3)^3 = 3.7%, expected return 0.074 per unit staked.
- Player with per-question accuracy p: expected return 2 x p^3.
- Platform break-even: p = 0.5^(1/3), about 79.4%.

| Accuracy | Win chance | Expected return |
|---|---|---|
| 33% | 3.7% | 0.07 |
| 50% | 12.5% | 0.25 |
| 70% | 34.3% | 0.69 |
| 80% | 51.2% | 1.02 |
| 90% | 72.9% | 1.46 |

## Rules derived

- Retire questions whose correct rate exceeds about 85%.
- Per-game, per-user-per-day and platform-per-day payout caps.
- Maintain the payout reserve above a configured multiple of maximum outstanding exposure.
- Difficulty and prize table are fixed and disclosed before play. No hidden adaptation.
- Partial results (1 or 2 of 3 correct) must be explicitly defined: nothing, refund, or partial prize.
