# User Stories and Acceptance Criteria

## Account

- As a player I register with my phone number and OTP so my account is verified.
  - AC: one account per number; OTP expires in 5 minutes; 5 attempts max; rate limited.
- As a player I set a 4-digit PIN to authorise withdrawals.
  - AC: PIN stored only as argon2id hash with pepper; 5 wrong tries lock for 30 minutes.

## Wallet

- As a player I deposit with mobile money and see status until confirmed.
  - AC: states Pending, Processing, Completed, Failed; success only after provider confirmation.
- As a player I withdraw winnings and see fee and net amount before confirming.
  - AC: PIN required; limits enforced; idempotent on retry.
- As a player I view every transaction with date, type, amount, status, reference.

## Game

- As a player I see entry, questions, time per question, prize table and refund policy before paying.
  - AC: confirm button on same screen; config version stored with the game.
- As a player I see a 12-second countdown and question counter.
  - AC: server owns the deadline; client countdown is cosmetic.
- As a player I see correct answers and my prize on the results screen.
- As a player on a dropped connection I can resume; server decides the outcome.

## Admin

- As an admin I add, edit, disable and bulk-import questions in any language.
- As a finance manager I approve or reject flagged withdrawals and see reconciliation status.
- As a support agent I view a user's games and ledger entries to resolve disputes.

## Safety

- As a player I set deposit, loss and time limits and self-exclude.
