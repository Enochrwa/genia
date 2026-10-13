# ADR-0005: Per-country feature gating

- Status: accepted
- Date: 2026-10-13

## Decision

Real-money features, payment methods, limits and game configs are enabled per country via configuration and feature flags; default is off.

## Consequences

Safe global expansion path; legal readiness is a product gate, not an afterthought.
