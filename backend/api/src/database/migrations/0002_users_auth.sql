-- Accounts, OTP challenges, sessions with rotating refresh tokens, PIN credentials (sprint 1)

create table if not exists users (
  id                  uuid primary key default gen_random_uuid(),
  phone_e164          text not null,
  country             char(2) not null check (country ~ '^[A-Z]{2}$'),
  email               text,
  locale              text not null default 'rw' check (locale in ('rw', 'en', 'fr')),
  status              text not null default 'ACTIVE' check (status in ('ACTIVE', 'SUSPENDED', 'SELF_EXCLUDED', 'CLOSED')),
  kyc_level           smallint not null default 0 check (kyc_level between 0 and 3),
  birth_confirmed_at  timestamptz,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  constraint users_phone_e164_format check (phone_e164 ~ '^\+[1-9][0-9]{6,14}$'),
  constraint users_phone_unique unique (phone_e164)
);

create index if not exists users_country_idx on users (country);

create table if not exists otp_challenges (
  id            uuid primary key default gen_random_uuid(),
  phone_e164    text not null,
  code_hash     text not null,
  attempts      integer not null default 0 check (attempts >= 0),
  expires_at    timestamptz not null,
  consumed_at   timestamptz,
  requested_ip  text,
  created_at    timestamptz not null default now()
);

create index if not exists otp_challenges_phone_idx on otp_challenges (phone_e164, created_at desc);

create table if not exists sessions (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references users(id),
  device_id      text,
  user_agent     text,
  ip             text,
  created_at     timestamptz not null default now(),
  last_seen_at   timestamptz not null default now(),
  revoked_at     timestamptz,
  revoke_reason  text
);

create index if not exists sessions_user_idx on sessions (user_id) where revoked_at is null;

create table if not exists refresh_tokens (
  id          uuid primary key default gen_random_uuid(),
  session_id  uuid not null references sessions(id),
  token_hash  text not null unique,
  created_at  timestamptz not null default now(),
  expires_at  timestamptz not null,
  used_at     timestamptz
);

create index if not exists refresh_tokens_session_idx on refresh_tokens (session_id);

create table if not exists credentials (
  user_id            uuid primary key references users(id),
  pin_hash           text,
  pin_set_at         timestamptz,
  failed_pin_count   integer not null default 0 check (failed_pin_count >= 0),
  pin_locked_until   timestamptz
);
