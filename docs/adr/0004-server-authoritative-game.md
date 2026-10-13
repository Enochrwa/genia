# ADR-0004: Server-authoritative game logic

- Status: accepted
- Date: 2026-10-13

## Decision
Questions, answers, timers, scoring and prizes are owned by the server. Clients never receive correct answers and never decide outcomes.

## Consequences
Cheat resistance and dispute evidence; requires resilient resume logic for flaky mobile networks.
