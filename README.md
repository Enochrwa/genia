# Genia

> Answer. Compete. Earn. A transparent, skill-based quiz platform built for mobile-first markets, starting in Rwanda and designed to expand country by country.

Genia is the next generation of **IHUGURE APP**. It replaces the original prototype with a secure, server-authoritative platform featuring a double-entry wallet, mobile-money payments, multilingual UX and a full admin console.

> **Important:** real-money operation is subject to gambling/contest regulation that differs by country. Read [`docs/08-compliance`](docs/08-compliance/README.md) before enabling any cash feature. Real-money features are gated by per-country feature flags and are **off by default**.

## Repository layout

```text
genia/
├── web/
│   ├── player/      Player PWA (Next.js, TypeScript)
│   └── admin/       Admin console (Next.js)
├── mobile/
│   └── app/         React Native (Expo) app, later phase
├── backend/
│   └── api/         NestJS modular-monolith API (REST + WebSocket), domain logic, SQL migrations
├── common/
│   ├── types/       Shared types, zod schemas, money and state machines
│   ├── api-client/  Typed API client
│   ├── ui/          Design tokens and shared UI
│   ├── i18n/        Message catalogues (rw, en, fr) and helpers
│   └── config/      Shared TypeScript configuration
├── infra/           Terraform, Docker, Kubernetes
├── content/         Question bank sources by language
├── docs/            All project documentation (start at docs/README.md)
├── scripts/         Developer and ops scripts (doc link check, k6 load tests)
└── .github/         Workflows, composite actions, templates, CODEOWNERS
```

New top-level areas (for example `backend/workers` or `web/marketing`) are added as sibling folders and picked up automatically by the pnpm workspace globs.

## Tech stack

| Layer | Technology |
|---|---|
| Web | Next.js, React, TypeScript, Tailwind CSS, shadcn/ui, next-intl |
| API | NestJS (TypeScript), REST + OpenAPI, WebSocket gateway |
| Database | PostgreSQL (ledger-grade ACID), Prisma / SQL migrations |
| Cache, timers, queues | Redis, BullMQ |
| Payments | MTN MoMo, Airtel Money (Rwanda); card/regional adapters later |
| Auth | Phone OTP, argon2id, rotating refresh tokens, passkeys later |
| Infra | Docker, Terraform, AWS, Cloudflare |
| Quality | Vitest/Jest, Playwright, k6, GitHub Actions |

Full reasoning: [`docs/02-architecture/technology-decisions.md`](docs/02-architecture/technology-decisions.md).

## Quick start

```bash
# prerequisites: Node 20+, pnpm 9+, Docker
cp .env.example .env
docker compose up -d        # PostgreSQL, Redis, Mailpit
pnpm install
pnpm db:migrate             # needs DATABASE_URL from .env
pnpm test                   # unit tests for every workspace
pnpm dev                    # web :3000, api :4000, admin :3001
```

See [`docs/09-devops/local-development.md`](docs/09-devops/local-development.md) for details.

## Documentation

Start at [`docs/README.md`](docs/README.md). Key documents:

- Product: [`docs/01-product/prd.md`](docs/01-product/prd.md)
- Architecture: [`docs/02-architecture/overview.md`](docs/02-architecture/overview.md)
- Wallet and ledger: [`docs/05-money/wallet-and-ledger.md`](docs/05-money/wallet-and-ledger.md)
- Game engine: [`docs/06-game-engine/game-engine.md`](docs/06-game-engine/game-engine.md)
- Security: [`docs/07-security/security-baseline.md`](docs/07-security/security-baseline.md)
- Compliance: [`docs/08-compliance/README.md`](docs/08-compliance/README.md)

## Status

Early development: monorepo, shared libraries, domain logic (ledger, game scoring, economics), SQL ledger migration, tests and CI are in place. Application servers and UIs are next. See [`docs/01-product/roadmap.md`](docs/01-product/roadmap.md).

## License

Proprietary, all rights reserved, until the owners decide otherwise. See `LICENSE`.
