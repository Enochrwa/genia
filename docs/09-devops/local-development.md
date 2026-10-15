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

## Running the API

```bash
cp .env.example .env                 # development secrets are pre-filled
export $(grep -v '^#' .env | xargs)  # or use direnv / your shell's dotenv support
pnpm --filter @genia/api db:migrate
pnpm --filter @genia/api dev         # bundles and restarts on change, listens on :4000
```

With `SMS_PROVIDER=console` the one-time codes are printed in the API log (`[sms:console]`).
Quick check: `curl localhost:4000/ready` should report database and redis `up`.

## Tests

```bash
pnpm --filter @genia/api test                 # unit tests, no services needed
DATABASE_URL=postgresql://genia:genia@localhost:5432/genia \
  pnpm --filter @genia/api test:integration   # needs docker compose up -d and migrations applied
```

## Ports

Web 3000, Admin 3001, API 4000, Postgres 5432, Redis 6379, Mailpit UI 8025.

## Useful commands

`pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm test:e2e`, `pnpm format`.

## Payments in development

Use sandbox credentials, or `PAYMENTS_ENABLED=false` with the fake provider that auto-confirms after a delay.

## SMS in development

`SMS_PROVIDER=console` prints OTPs to the API log.
