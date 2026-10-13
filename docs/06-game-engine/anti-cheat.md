# Anti-Cheat

| Threat | Control |
|---|---|
| Reading answers in API responses | Answers never leave the server |
| Client timer manipulation | Server-side `expiresAt`; client countdown cosmetic |
| Replay / duplicate submits | Nonces, unique `(game_id, question_id)` answer, idempotency |
| Bots and automation | Rate limits, bot protection, response-time analysis (too fast, too regular) |
| Multi-accounting | Phone uniqueness, device and IP linkage, KYC |
| Pool leakage and memorisation | Large pool, rotation, exposure limits, retire high-correct-rate questions |
| Collusion in multiplayer | Behavioural analysis, shared-device checks |
| Insider abuse | RBAC, 2FA, audit log, separation of duties for payout approvals |

Flag, review, then act. Never auto-accuse users; keep evidence for disputes.
