# Architecture Overview

Style: **modular monolith** first, split into services only when scale or team size demands it.

```text
Clients: PWA (Next.js) | React Native (later) | Admin console
        | HTTPS
Cloudflare (CDN, WAF, bot protection)
        |
NestJS API (modules)
  Auth | Wallet | Ledger | Payments | Games | Questions
  Risk | Notifications | Admin | Support | Leaderboard
        |
  PostgreSQL | Redis | BullMQ workers | Object storage
```

## Patterns

- **Outbox:** state change and outgoing event commit in one transaction.
- **Provider adapters:** each payment provider implements one interface.
- **Feature flags per country** gate real-money functions.
- **Idempotency** on every money-affecting endpoint.
- **Server-authoritative game logic**; the client renders only.
- **Event-driven side effects** (notifications, leaderboards, analytics) via queues.

## Module boundaries

Modules expose services and events, never repositories. Cross-module calls go through public interfaces. Ledger is the only module allowed to write ledger tables. Enforced by lint rules and review.
