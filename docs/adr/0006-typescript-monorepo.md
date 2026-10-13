# ADR-0006: TypeScript monorepo (pnpm + Turborepo)

- Status: accepted
- Date: 2026-10-13

## Decision

One repository with apps (web, admin, api, mobile) and shared packages; shared zod schemas and generated API client.

## Consequences

Type safety end to end; atomic cross-cutting changes; CI must use caching to stay fast.
