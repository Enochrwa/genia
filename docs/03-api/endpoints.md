# Endpoint Catalogue (v1)

| Area | Endpoint | Notes |
|---|---|---|
| Auth | `POST /auth/otp/request` | Rate limited per phone and IP |
| Auth | `POST /auth/otp/verify` | Issues session |
| Auth | `POST /auth/refresh`, `POST /auth/logout` | Rotating refresh |
| Me | `GET/PATCH /me` | Profile, locale, country |
| Me | `POST /me/pin`, `PUT /me/pin` | Set and change PIN |
| Me | `GET/PUT /me/limits`, `POST /me/self-exclude` | Responsible play |
| KYC | `POST /kyc/sessions`, `GET /kyc/status` | Provider-hosted flow |
| Wallet | `GET /wallet` | Balances by currency |
| Wallet | `GET /wallet/transactions` | Paginated |
| Wallet | `POST /wallet/deposits` | Idempotent |
| Wallet | `POST /wallet/withdrawals` | PIN, idempotent |
| Wallet | `GET /transactions/{id}/receipt` | PDF or JSON |
| Games | `GET /game-configs` | By country, includes rules and prize table |
| Games | `POST /games` | Idempotent; places hold |
| Games | `GET /games/{id}` | Current question without answer |
| Games | `POST /games/{id}/answers` | `{questionId, optionId}` |
| Games | `GET /games/{id}/result` | After settlement, with correct answers |
| History | `GET /games` | Own games |
| Leaderboard | `GET /leaderboards/{period}` | daily, weekly, monthly, all-time |
| Questions | `POST /questions/{id}/report` | Player reports |
| Support | `POST /tickets`, `GET /tickets` | |
| Webhooks | `POST /webhooks/{provider}` | Signature verified, deduplicated |
| Admin | `/admin/users`, `/questions`, `/payouts`, `/flags`, `/reports`, `/audit`, `/limits`, `/config` | RBAC, 2FA |
| Health | `GET /health`, `GET /ready` | Liveness and readiness |
