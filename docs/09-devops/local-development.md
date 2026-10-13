# Local Development

## Prerequisites
Node 20+, pnpm 9+, Docker, Git.

## Setup
```bash
cp .env.example .env
docker compose up -d
pnpm install
pnpm db:migrate
pnpm dev
```

## Ports
Web 3000, Admin 3001, API 4000, Postgres 5432, Redis 6379, Mailpit UI 8025.

## Useful commands
`pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm test:e2e`, `pnpm format`.

## Payments in development
Use sandbox credentials, or `PAYMENTS_ENABLED=false` with the fake provider that auto-confirms after a delay.

## SMS in development
`SMS_PROVIDER=console` prints OTPs to the API log.
