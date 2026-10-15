# Data Model

```text
users(id, phone_e164 UNIQUE, country, email, locale, status, kyc_level, birth_confirmed_at, created_at, updated_at)   [implemented]
otp_challenges(id, phone_e164, code_hash, attempts, expires_at, consumed_at, requested_ip, created_at)             [implemented]
sessions(id, user_id, device_id, user_agent, ip, created_at, last_seen_at, revoked_at, revoke_reason)             [implemented]
refresh_tokens(id, session_id, token_hash UNIQUE, created_at, expires_at, used_at)                                [implemented]
credentials(user_id, pin_hash, pin_set_at, failed_pin_count, pin_locked_until)                                    [implemented]
passkeys(id, user_id, public_key, counter)
wallets(id, user_id, currency, status)
ledger_accounts(id, owner_type, owner_id, currency, kind)
ledger_transactions(id, type, idempotency_key UNIQUE, status, reference, metadata, created_at)
ledger_entries(id, txn_id, account_id, direction, amount_minor, currency, created_at)
deposits(id, user_id, provider, provider_ref, amount, fee, status, created_at)
withdrawals(id, user_id, provider, destination_hash, amount, fee, status, reviewed_by)
webhook_events(id, provider, provider_ref UNIQUE, payload, processed_at)
categories(id, key, translations)
questions(id, category_id, language, difficulty, body, options, correct_option, status, stats)
game_configs(id, country, entry_amount, question_count, seconds, prize_table, version, active)
games(id, user_id, config_id, config_snapshot, status, score, prize, started_at, settled_at)
game_questions(game_id, question_id, option_order, shown_at, expires_at, answered_at, answer)
leaderboard_entries(period, user_id, points)
notifications(id, user_id, channel, template, status)
support_tickets(id, user_id, category, status)
ticket_messages(id, ticket_id, author, body)
fraud_flags(id, user_id, rule, severity, status)
limits(user_id, type, amount, period, set_by, effective_at)
audit_logs(id, actor_id, action, target, before, after, ip, at)
outbox(id, topic, payload, created_at, published_at)
```

## Constraints

- UNIQUE: `ledger_transactions.idempotency_key`, `(provider, provider_ref)`, phone per country.
- Foreign keys everywhere; `CHECK (balance_minor >= 0)` on any materialised balance.
- `ledger_entries` are insert-only (revoke UPDATE/DELETE from the app role).
- Sum of entries per `txn_id` must be zero per currency (enforced in code and by a deferred constraint/trigger).
