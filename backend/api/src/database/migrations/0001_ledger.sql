-- Append-only, double-entry ledger (see docs/05-money/wallet-and-ledger.md)

create table if not exists ledger_transactions (
  id               uuid primary key default gen_random_uuid(),
  type             text not null,
  idempotency_key  text not null unique,
  status           text not null default 'POSTED',
  reference        text,
  metadata         jsonb not null default '{}'::jsonb,
  created_at       timestamptz not null default now()
);

create table if not exists ledger_entries (
  id            bigserial primary key,
  txn_id        uuid not null references ledger_transactions(id),
  account       text not null,
  direction     text not null check (direction in ('DEBIT', 'CREDIT')),
  amount_minor  bigint not null check (amount_minor > 0),
  currency      char(3) not null check (currency ~ '^[A-Z]{3}$'),
  created_at    timestamptz not null default now()
);

create index if not exists ledger_entries_account_idx on ledger_entries (account);
create index if not exists ledger_entries_txn_idx on ledger_entries (txn_id);

-- Entries and transactions can never be changed or removed. Corrections are new reversing transactions.
create or replace function ledger_forbid_mutation() returns trigger as $$
begin
  raise exception 'ledger is append-only (% on %)', tg_op, tg_table_name;
end;
$$ language plpgsql;

drop trigger if exists ledger_entries_append_only on ledger_entries;
create trigger ledger_entries_append_only
  before update or delete on ledger_entries
  for each row execute function ledger_forbid_mutation();

drop trigger if exists ledger_transactions_append_only on ledger_transactions;
create trigger ledger_transactions_append_only
  before update or delete on ledger_transactions
  for each row execute function ledger_forbid_mutation();

-- Per currency, debits must equal credits when the transaction commits.
create or replace function ledger_assert_balanced() returns trigger as $$
declare
  unbalanced record;
begin
  select currency,
         sum(case direction when 'DEBIT' then amount_minor else -amount_minor end) as net
    into unbalanced
    from ledger_entries
   where txn_id = new.txn_id
   group by currency
  having sum(case direction when 'DEBIT' then amount_minor else -amount_minor end) <> 0
   limit 1;
  if found then
    raise exception 'unbalanced ledger transaction % (currency %, net %)',
      new.txn_id, unbalanced.currency, unbalanced.net;
  end if;
  return null;
end;
$$ language plpgsql;

drop trigger if exists ledger_entries_balanced on ledger_entries;
create constraint trigger ledger_entries_balanced
  after insert on ledger_entries
  deferrable initially deferred
  for each row execute function ledger_assert_balanced();
