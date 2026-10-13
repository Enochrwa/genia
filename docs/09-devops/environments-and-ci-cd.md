# Environments and CI/CD

| Env | Purpose | Data |
|---|---|---|
| local | Development | Seed data |
| staging | Production-like, sandbox providers | Synthetic |
| production | Live | Real |

## Pipeline
lint -> typecheck -> unit tests -> integration tests (real Postgres/Redis) -> build -> container scan -> deploy staging -> e2e -> manual approval -> deploy production -> smoke tests -> automatic rollback on failure.

## Releases
Trunk-based, short-lived branches, semantic version tags, changelog from Conventional Commits.

## Database
Migrations run before app rollout; backward-compatible changes only (expand/contract).

## Config and secrets
Per-environment secrets in the cloud secret manager; no secrets in images or repo.
