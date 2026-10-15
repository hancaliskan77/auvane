-- Auvane core schema. Users read only their own rows (RLS); all writes go through server functions (service role).

create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  device_tz text,
  notify_hour int default 8,
  notify_enabled boolean not null default false,
  ai_consent_at timestamptz,
  age_confirmed_at timestamptz,
  last_seen_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table birth_inputs (
  user_id uuid primary key references profiles(id) on delete cascade,
  name text not null,
  birth_date date not null,
  birth_time time,
  time_known boolean not null default true,
  place_name text not null,
  lat double precision not null,
  lon double precision not null,
  tz text not null,                 -- IANA zone
  utc_offset_minutes int,           -- offset at birth moment
  birth_utc timestamptz,            -- null when time unknown
  created_at timestamptz not null default now()
);

create table charts (
  user_id uuid primary key references profiles(id) on delete cascade,
  natal jsonb, human_design jsonb, chinese jsonb, numerology jsonb, matrix jsonb,
  version int not null default 1,
  created_at timestamptz not null default now()
);

create table sky_daily (
  day date primary key,
  longitudes jsonb not null
);

create table readings (
  id bigint generated always as identity primary key,
  user_id uuid not null references profiles(id) on delete cascade,
  kind text not null check (kind in ('story','daily','weekly','theme')),
  theme text not null default '',
  day date not null default current_date,
  body text not null,
  model text, tokens_in int, tokens_out int, cost_usd numeric(10,5),
  flagged boolean not null default false,
  unique (user_id, kind, theme, day)
);

create table unlocks (
  id bigint generated always as identity primary key,
  user_id uuid not null references profiles(id) on delete cascade,
  theme text not null,
  day date not null default current_date,
  created_at timestamptz not null default now(),
  unique (user_id, day)             -- 1 theme per day, enforced server-side
);

create table entitlements (
  user_id uuid primary key references profiles(id) on delete cascade,
  active boolean not null default false,
  product text, expires_at timestamptz
);

create table llm_spend (
  day date primary key,
  usd numeric(10,4) not null default 0
);

create table jobs (
  id bigint generated always as identity primary key,
  user_id uuid references profiles(id) on delete cascade,
  kind text not null,               -- e.g. 'register_retry', 'daily_batch'
  payload jsonb,
  attempts int not null default 0,
  last_error text,
  run_after timestamptz not null default now(),
  done boolean not null default false
);

-- RLS: read own rows only; no insert/update/delete policies (service role bypasses RLS).
alter table profiles enable row level security;
alter table birth_inputs enable row level security;
alter table charts enable row level security;
alter table readings enable row level security;
alter table unlocks enable row level security;
alter table entitlements enable row level security;
alter table sky_daily enable row level security;
alter table llm_spend enable row level security;
alter table jobs enable row level security;

create policy own_profile on profiles for select using (id = auth.uid());
create policy own_birth on birth_inputs for select using (user_id = auth.uid());
create policy own_chart on charts for select using (user_id = auth.uid());
create policy own_readings on readings for select using (user_id = auth.uid());
create policy own_unlocks on unlocks for select using (user_id = auth.uid());
create policy own_entitlement on entitlements for select using (user_id = auth.uid());
create policy sky_public on sky_daily for select using (true);
-- llm_spend and jobs: no policies = clients cannot read them.
