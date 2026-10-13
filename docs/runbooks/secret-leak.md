# Runbook: Secret Leak

1. Revoke/rotate the secret immediately (provider console, secret manager).
2. Invalidate sessions/tokens if signing keys were exposed.
3. Search logs and provider activity for misuse.
4. Remove from git history if needed; assume it is compromised regardless.
5. Document and add a prevention measure (scanner rule, process change).
