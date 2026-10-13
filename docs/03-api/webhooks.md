# Webhooks (Payment Providers)

1. Verify signature and source IP/allow-list where the provider supports it.
2. Store the raw event in `webhook_events` with provider reference (unique) before processing.
3. Respond 2xx quickly; process via queue.
4. Deduplicate by `(provider, provider_ref)`.
5. Never trust the payload alone: re-query the provider API to confirm status.
6. Apply a state transition only if allowed by the state machine; otherwise log and alert.
7. Retries from the provider must be harmless (idempotent handlers).
