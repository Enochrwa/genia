# Genia

> Answer. Compete. Earn. A transparent, skill-based quiz platform built for mobile-first markets, starting in Rwanda and designed to expand country by country.

Genia is the next generation of **IHUGURE APP**. It replaces the original prototype with a secure, server-authoritative platform featuring a double-entry wallet, mobile-money payments, multilingual UX and a full admin console.

> **Important:** real-money operation is subject to gambling/contest regulation that differs by country. Read [`docs/08-compliance`](docs/08-compliance/README.md) before enabling any cash feature. Real-money features are gated by per-country feature flags and are **off by default**.

## Repository layout

```text
genia/
├── apps/
│   ├── web/        Next.js (React, TypeScript) PWA for players
│   ├── api/        NestJS modular-monolith API (REST + WebSocket)
│   ├── admin/      Admin console (Next.js)
│   └── mobile/     React Native (Expo) app, later phase
├── packages/
│   ├── shared-types/  Types and zod schemas shared by all apps
│   ├── api-client/    Typed client generated from the OpenAPI spec
│   ├── ui/            Shared design-system components
│   ├── i18n/          Shared translation helpers
│   └── config/        Shared ESLint, TypeScript, Prettier configs
├── infra/          Terraform, Docker, Kubernetes manifests
├── content/        Question bank source files by language
├── docs/           All project documentation (start at docs/README.md)
├── scripts/        Developer and ops scripts
└── .github/        CI/CD workflows, templates, CODEOWNERS
```

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
pnpm db:migrate
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

Pre-development: planning and documentation phase. See [`docs/01-product/roadmap.md`](docs/01-product/roadmap.md).

## License

Proprietary, all rights reserved, until the owners decide otherwise. See `LICENSE`.
