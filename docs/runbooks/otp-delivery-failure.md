# Runbook: OTP delivery failures

## Symptoms

- Players report no SMS, or sign-up conversion drops
- Log lines `SMS_DELIVERY_FAILED provider=... reason=...` appear, or API answers 502 `SMS_DELIVERY_FAILED` on `POST /v1/auth/otp/request`

## Alert

Fire when `SMS_DELIVERY_FAILED` exceeds 5 in 10 minutes or 10 percent of OTP requests. (Wiring the alert rule is part of the observability work in sprint 11; until then watch the log search.)

## Immediate actions

1. Check the provider status page and the account balance with Africa's Talking.
2. Send a test message from the provider console to a team phone.
3. Check network errors vs rejections in the log reason: `network error` and `HTTP 5xx` are provider or connectivity; `rejected` with a status means sender ID, balance or number problems.
4. If the provider is down, switch `SMS_PROVIDER` to the backup provider once one is configured (planned: Infobip or Twilio Verify behind the same interface) and redeploy.

## What is safe

- Failed sends invalidate the code, so a retry always works and nothing is left half-open.
- Do not switch to the `console` provider in production; the API refuses to start with it.
- Do not raise rate limits to "help" users; the limits protect SMS cost and brute force.

## Follow-up

- Record duration, cause and number of affected requests in the incident log.
- Consider a WhatsApp fallback for OTP if one network is unreliable.
