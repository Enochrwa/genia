# Runbook: Payment Provider Outage

## Symptoms
Spike in failed/pending deposits or payouts; provider status page red; webhook lag.

## Immediate actions
1. Confirm with provider status and sandbox health check.
2. Enable the provider's circuit breaker flag (pauses new deposits/payouts, shows banner).
3. Keep pending items; do not mark failed without provider confirmation.

## Resolution
When restored, run the pending-status sweeper; reconcile; resume. Post-incident review within 3 days.
