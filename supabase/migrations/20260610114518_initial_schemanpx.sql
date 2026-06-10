-- Profiles table: extends Supabase's built-in auth.users
-- Stores display info and onboarding status
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  email text not null,
  onboarding_completed boolean default false,
  created_at timestamptz default now()
);

-- Preferences table: stores onboarding quiz answers
-- One row per user (enforced by unique constraint)
create table preferences (
  id bigint generated always as identity primary key,
  user_id uuid not null references profiles(id) on delete cascade,
  -- Crypto assets the user is interested in (e.g. {'bitcoin','ethereum'})
  assets text[] not null default '{}',
  -- Investor type (e.g. 'HODLer', 'Day Trader', 'NFT Collector')
  investor_type text not null,
  -- Content types the user wants to see (e.g. {'news','charts','fun'})
  content_types text[] not null default '{}',
  updated_at timestamptz default now(),
  unique (user_id)
);

-- Feedback table: stores thumbs up/down votes per dashboard section
-- Designed for future model training (bonus section in the task)
create table feedback (
  id bigint generated always as identity primary key,
  user_id uuid not null references profiles(id) on delete cascade,
  -- Which dashboard section the vote belongs to
  section text not null check (section in ('news', 'prices', 'insight', 'meme')),
  -- External identifier of the voted item (article id, coin id, meme id, etc.)
  content_id text not null,
  -- 1 = thumbs up, -1 = thumbs down
  vote smallint not null check (vote in (1, -1)),
  created_at timestamptz default now(),
  -- A user can vote only once per item; new votes update the existing one
  unique (user_id, section, content_id)
);