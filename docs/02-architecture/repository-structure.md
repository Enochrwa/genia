# Repository and Module Structure

pnpm workspaces plus Turborepo.

```text
apps/web        Player PWA
apps/admin      Admin console
apps/api        NestJS API
apps/mobile     React Native (later)
packages/shared-types   zod schemas and TS types
packages/api-client     OpenAPI-generated client
packages/ui             Shared components
packages/i18n           Translation helpers
packages/config         ESLint, tsconfig, prettier
```

## API module layout
```text
apps/api/src/modules/<name>/
  <name>.module.ts
  <name>.controller.ts
  <name>.service.ts
  dto/            zod-validated request/response schemas
  domain/         pure business logic, no framework
  repository/     data access
  events/         domain events
  __tests__/
```

## Web layout
```text
apps/web/src/app          routes (locale-prefixed)
apps/web/src/features     feature folders (wallet, game, auth, history)
apps/web/src/components   shared UI
apps/web/src/lib          api client, utils
apps/web/messages         en.json, fr.json, rw.json
```

## Dependency rules
Apps may depend on packages; packages never depend on apps; `domain/` code imports nothing from NestJS.
