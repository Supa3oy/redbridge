-- RedBridge database schema
-- Run this in the Supabase SQL editor

create table if not exists users (
  id text primary key,  -- Clerk user ID
  email text not null,
  plan text not null default 'free' check (plan in ('free', 'pro', 'agency')),
  stripe_customer_id text,
  usage_count integer not null default 0,
  usage_reset_at timestamptz not null default date_trunc('month', now()) + interval '1 month',
  created_at timestamptz not null default now()
);

create table if not exists toolkits (
  id uuid primary key default gen_random_uuid(),
  user_id text not null references users(id) on delete cascade,
  brand_name text not null,
  result jsonb not null,
  created_at timestamptz not null default now()
);

create table if not exists toolkit_cache (
  cache_key text primary key,
  result jsonb not null,
  created_at timestamptz not null default now()
);

create table if not exists competitor_analyses (
  id uuid primary key default gen_random_uuid(),
  user_id text not null references users(id) on delete cascade,
  competitor_name text not null,
  industry text,
  result jsonb not null,
  created_at timestamptz not null default now()
);

create table if not exists trends_cache (
  industry text primary key,
  result jsonb not null,
  updated_at timestamptz not null default now()
);

create table if not exists saved_trends (
  id uuid primary key default gen_random_uuid(),
  user_id text not null references users(id) on delete cascade,
  industry text not null,
  result jsonb not null,
  created_at timestamptz not null default now(),
  unique (user_id, industry)
);

create table if not exists saved_competitors (
  id uuid primary key default gen_random_uuid(),
  user_id text not null references users(id) on delete cascade,
  competitor_name text not null,
  industry text,
  result jsonb not null,
  created_at timestamptz not null default now(),
  unique (user_id, competitor_name)
);

-- Indexes
create index if not exists toolkits_user_id_idx on toolkits(user_id);
create index if not exists toolkits_created_at_idx on toolkits(created_at desc);

-- -----------------------------------------------------------------------
-- Migration: onboarding + brand profile fields on users
-- Run this in the Supabase SQL editor if you already have a users table
-- -----------------------------------------------------------------------
alter table users add column if not exists onboarding_completed boolean not null default false;
alter table users add column if not exists brand_name        text;
alter table users add column if not exists website_url       text;
alter table users add column if not exists industry          text;
alter table users add column if not exists target_audience   jsonb default '[]'::jsonb;
alter table users add column if not exists selling_points    text;

-- -----------------------------------------------------------------------
-- New feature tables (v2)
-- -----------------------------------------------------------------------

create table if not exists saved_comments (
  id uuid primary key default gen_random_uuid(),
  user_id text not null references users(id) on delete cascade,
  comments jsonb not null default '[]',
  replies jsonb not null default '[]',
  created_at timestamptz not null default now()
);

create table if not exists saved_inbox (
  id uuid primary key default gen_random_uuid(),
  user_id text not null references users(id) on delete cascade,
  messages jsonb not null default '[]',
  replies jsonb not null default '[]',
  created_at timestamptz not null default now()
);

create table if not exists post_metrics (
  id uuid primary key default gen_random_uuid(),
  user_id text not null references users(id) on delete cascade,
  post_title text not null,
  likes integer not null default 0,
  comments integer not null default 0,
  shares integer not null default 0,
  saves integer not null default 0,
  posted_at date not null,
  created_at timestamptz not null default now()
);

create index if not exists saved_comments_user_id_idx on saved_comments(user_id);
create index if not exists saved_inbox_user_id_idx on saved_inbox(user_id);
create index if not exists post_metrics_user_id_idx on post_metrics(user_id);
create index if not exists post_metrics_posted_at_idx on post_metrics(posted_at desc);

-- Row Level Security
alter table users enable row level security;
alter table toolkits enable row level security;

-- Users can only read/update their own row
create policy "users_own_row" on users
  for all using (id = requesting_user_id());

-- Toolkits visible only to owner
create policy "toolkits_own" on toolkits
  for all using (user_id = requesting_user_id());

-- Helper function used by RLS (maps Clerk JWT sub to user id)
create or replace function requesting_user_id() returns text as $$
  select nullif(current_setting('request.jwt.claims', true)::json->>'sub', '')::text;
$$ language sql stable;
