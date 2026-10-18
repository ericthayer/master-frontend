-- Pilot Notes schema. Learners can read their own rows; only the service role
-- (Netlify Functions) can grant access or record Stripe customers.

create table public.stripe_customers (
  user_id uuid primary key references auth.users (id) on delete cascade,
  customer_id text not null unique,
  created_at timestamptz not null default now()
);

-- One row per grant. course = '*' means the All-Access Pass.
create table public.entitlements (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  course text not null,
  source text not null check (source in ('purchase', 'pass', 'comp')),
  -- null = lifetime (single-course purchase); set for the yearly pass.
  expires_at timestamptz,
  stripe_ref text,
  created_at timestamptz not null default now(),
  unique (user_id, course, source)
);
create index entitlements_user_idx on public.entitlements (user_id);

-- Learner progress as one merged JSON document (see src/lib/progress.ts).
create table public.progress (
  user_id uuid primary key references auth.users (id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- Stripe webhook idempotency.
create table public.stripe_events (
  id text primary key,
  type text not null,
  received_at timestamptz not null default now()
);

alter table public.stripe_customers enable row level security;
alter table public.entitlements enable row level security;
alter table public.progress enable row level security;
alter table public.stripe_events enable row level security;

create policy "read own entitlements" on public.entitlements
  for select to authenticated using ((select auth.uid()) = user_id);

create policy "read own progress" on public.progress
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "insert own progress" on public.progress
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "update own progress" on public.progress
  for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

-- stripe_customers and stripe_events: no policies → service role only.

-- Private bucket for e-book PDFs (served through short-lived signed URLs).
insert into storage.buckets (id, name, public) values ('ebooks', 'ebooks', false)
  on conflict (id) do nothing;
