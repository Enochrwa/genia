# ADR-0002: PostgreSQL as system of record

- Status: accepted
- Date: 2026-10-13

## Context

Ledger needs ACID transactions, constraints, row locking.

## Decision

PostgreSQL 16 for all financial and game data; Redis only for ephemeral state (timers, rate limits, leaderboards cache).

## Consequences

Strong consistency; reconciliation straightforward. MongoDB not used for money.
