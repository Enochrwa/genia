# GitHub Actions

All workflows live in `.github/workflows`. A composite action, `.github/actions/setup`, installs pnpm, Node and dependencies with caching.

| Workflow | Trigger | What it does |
|---|---|---|
| `ci.yml` | push to main, PR, merge queue | Lint, format check, typecheck, unit tests on Node 20 and 22, coverage artifact, build. On PRs only affected workspaces run (`turbo --filter=...[origin/base]`). The final job `CI passed` is the single required status check. |
| `backend.yml` | `backend/**`, `common/types/**` | Money-critical tests with coverage thresholds, PostgreSQL + Redis integration tests (ledger triggers, auth, sessions, PIN, rate limits, OpenAPI contract), Docker image build and boot check with runtime-generated secrets, migration safety lint. |
| `web.yml` | `web/**`, `common/**` | Lint, typecheck, test, build for player and admin. |
| `mobile.yml` | `mobile/**`, `common/**` | Lint, typecheck, test, build for the mobile app. |
| `common.yml` | `common/**` | Shared packages, translation parity (rw, en, fr), then dependants. |
| `e2e.yml` | PR, main, manual | Playwright on chromium and mobile-chrome. Skips until `web/player/playwright.config.ts` exists. |
| `security.yml` | PR, main, daily | gitleaks, dependency review, `pnpm audit`, Trivy filesystem scan (SARIF), guard that the public question type never exposes answers. |
| `codeql.yml` | PR, main, weekly | CodeQL for JavaScript and TypeScript. |
| `docs.yml` | Markdown and script changes | markdownlint, relative-link check (`scripts/check-doc-links.mjs`), sprint plan validation and freshness (`scripts/sprint/generate.mjs --check`), required docs exist. |
| `terraform.yml` | `infra/terraform/**` | `fmt -check`, `validate`, Trivy config scan. |
| `nightly.yml` | daily | Full suite with Postgres and Redis on Node 20 and 22, coverage artifacts. |
| `load-test.yml` | manual, weekly | k6 against staging (`scripts/load/k6-game-flow.js`), thresholds p95 < 300 ms. |
| `release.yml` | push to main | release-please opens a release PR from Conventional Commits and tags releases. |
| `deploy-staging.yml` | after CI on main, manual | Migrations, deploy, smoke test. Runs only when repository variable `DEPLOY_ENABLED=true`. |
| `deploy-production.yml` | manual with tag | Verifies tag and passing CI, requires environment approval, migrations, deploy, smoke test. Same `DEPLOY_ENABLED` gate. |
| `pr-title.yml` | PR | Enforces Conventional Commit PR titles. |
| `labeler.yml` | PR | Labels by area (`web`, `mobile`, `backend`, `common`, `infra`, `docs`, `money`). |
| `stale.yml` | daily | Closes inactive issues and PRs (security and money labels exempt). |
| `dependabot.yml` | weekly | npm, GitHub Actions, Docker, Terraform updates. |

## Repository settings to configure once

1. Branch protection on `main`: require pull request, require status check **CI passed**, require CODEOWNERS review, require linear history.
2. Environments `staging` and `production`; add required reviewers to `production`.
3. Variables: `DEPLOY_ENABLED`, `STAGING_URL`, `PRODUCTION_URL`. Secrets: `STAGING_DATABASE_URL`, `PRODUCTION_DATABASE_URL`, `LOAD_TEST_TOKEN`.
4. Enable GitHub code scanning, secret scanning with push protection, and Dependabot alerts.

## Running the same checks locally

```bash
pnpm lint && pnpm format:check && pnpm typecheck && pnpm test && pnpm build
docker compose up -d && export DATABASE_URL=postgresql://genia:genia@localhost:5432/genia
pnpm --filter @genia/api db:migrate && pnpm --filter @genia/api test:integration
node scripts/check-doc-links.mjs
```
