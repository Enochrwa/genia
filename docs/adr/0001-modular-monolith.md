# ADR-0001: Modular monolith first

- Status: accepted
- Date: 2026-10-13

## Context
Small team, money-critical consistency, fast iteration.

## Decision
Build one deployable NestJS application with strict module boundaries; extract services only when scale or team size requires.

## Consequences
Simpler transactions across wallet, ledger and games; lower ops cost; discipline needed to keep boundaries clean.

## Alternatives considered
Microservices from day one (more operational overhead, distributed transactions for money).
