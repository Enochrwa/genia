# Payments Integration

## Provider adapter interface

```ts
interface PaymentProvider {
  initiateDeposit(req: DepositRequest): Promise<ProviderResult>;
  initiatePayout(req: PayoutRequest): Promise<ProviderResult>;
  getStatus(providerRef: string): Promise<ProviderStatus>;
  verifyWebhook(headers: Headers, body: Buffer): boolean;
  parseWebhook(body: Buffer): ProviderEvent;
}
```

## Rwanda (Phase 1)

- MTN MoMo (Collections for deposits, Disbursements for payouts)
- Airtel Money
- Sandbox first; production requires merchant onboarding and compliance documents.

## Flow: deposit

1. Client `POST /wallet/deposits` with idempotency key.
2. Create `CREATED` deposit; call provider; set `PENDING`.
3. Provider webhook or polling confirms; verify via `getStatus`.
4. Post ledger entries; set `COMPLETED`; notify user.
5. Timeout job moves stale `PENDING` to `EXPIRED` after verification.

## Flow: withdrawal

1. Validate PIN, limits, KYC, flags.
2. Post cash -> hold; status `REQUESTED`; risk rules run; manual review if needed.
3. Approved -> queue payout; `PROCESSING`; provider confirms.
4. Completed -> release hold to clearing; failed -> return funds.

## Global expansion

Add adapters per market (card/regional wallets) behind the same interface and a per-country configuration of allowed methods, limits and fees. Check each processor's acceptable-use policy for real-money games before integrating.
