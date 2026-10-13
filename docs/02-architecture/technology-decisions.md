# Technology Decisions

| Layer | Choice | Reason | Alternatives |
|---|---|---|---|
| Web | Next.js, React, TypeScript, Tailwind, shadcn/ui | SSR/SEO, PWA, ecosystem | Vite SPA, Nuxt |
| i18n | next-intl | Locale routing, ICU plurals | i18next |
| Mobile (later) | React Native (Expo) | Reuse skills and types | Flutter |
| API | NestJS | Structure, DI, guards, testability | FastAPI, Go |
| Database | PostgreSQL 16 | ACID, constraints, row locking | MongoDB (unsuited to ledgers) |
| ORM | Prisma or Drizzle plus raw SQL for ledger | Type safety, reviewable migrations | TypeORM |
| Cache/timers | Redis | Rate limits, locks, leaderboards | Memcached |
| Queues | BullMQ | Retries, delays, reconciliation | SQS/Kafka at scale |
| Realtime | WebSocket gateway + Redis pub/sub | Live features | Ably, Pusher |
| Auth | OTP + argon2id + rotating refresh tokens; passkeys later | Phone-first market | Keycloak, Auth0 |
| SMS | Africa's Talking / Infobip; Twilio globally | Local delivery | |
| Payments | MTN MoMo, Airtel Money (direct or aggregator); Stripe/regional where permitted | Local rails | Adyen |
| KYC | Smile Identity (Africa), Sumsub/Veriff (global) | Liveness and ID | |
| Hosting | AWS + Cloudflare | Reliability, DDoS | Fly.io/Render early |
| IaC | Terraform | Repeatable | Pulumi |
| CI/CD | GitHub Actions | Integrated | |
| Observability | OpenTelemetry, Sentry, Grafana | Detect problems early | Datadog |
| Testing | Vitest/Jest, Playwright, k6 | Money flows need depth | |

Each decision becomes an ADR when finalised (see `docs/adr`).
