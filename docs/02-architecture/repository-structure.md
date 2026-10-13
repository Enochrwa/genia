# Repository and Module Structure

pnpm workspaces plus Turborepo. Top-level folders group code by platform; each workspace is a package named `@genia/<name>`.

```text
web/player        @genia/web-player   Player PWA
web/admin         @genia/web-admin    Admin console
mobile/app        @genia/mobile-app   React Native (Expo), later
backend/api       @genia/api          NestJS API, domain logic, migrations
common/types      @genia/types        zod schemas, Money, state machines, error codes
common/api-client @genia/api-client   Typed API client
common/ui         @genia/ui           Design tokens
common/i18n       @genia/i18n         Catalogues rw, en, fr
common/config     @genia/config       tsconfig.base.json
```

Workspace globs: `web/*`, `mobile/*`, `backend/*`, `common/*`. Adding `backend/workers` or `web/marketing` needs no configuration change.

## API layout

```text
backend/api/
  scripts/migrate.mjs            forward-only SQL migration runner
  src/domain/                    pure business logic (ledger, game, economics), no framework imports
  src/modules/<name>/            NestJS modules (auth, users, wallet, ledger, payments, games, ...)
  src/database/migrations/*.sql  versioned migrations
  tests/                         unit tests; tests/integration needs DATABASE_URL
```

## Web layout

```text
web/player/src/app          routes (locale-prefixed)
web/player/src/features     feature folders (wallet, game, auth, history)
web/player/src/components   shared UI
common/i18n/messages        rw.json, en.json, fr.json
```

## Dependency rules

Apps (`web`, `mobile`, `backend`) may depend on `common`; `common` never depends on apps; `domain/` code imports nothing from NestJS. Packages export TypeScript source directly (`"exports": "./src/index.ts"`), so there is no build step between workspaces during development.
