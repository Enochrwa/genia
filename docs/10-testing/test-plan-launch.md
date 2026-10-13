# Launch Test Plan

1. Functional regression of all Phase 1 stories.
2. Payment sandbox end-to-end with failure and timeout scenarios.
3. Reconciliation drill with injected mismatch.
4. Load test at 5x expected peak.
5. Chaos tests: kill API pod mid-game, drop Redis, delay provider webhook.
6. Penetration test and remediation.
7. Backup restore drill.
8. Closed beta with caps, monitored daily.
Exit criteria: no open critical/high defects, reconciliation clean for 14 days, restore drill passed.
