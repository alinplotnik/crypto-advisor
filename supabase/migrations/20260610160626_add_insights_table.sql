-- Daily AI insights: one generated insight per user per day.
-- Stored to avoid burning free-tier LLM quota on every page load.
create table insights (
  id bigint generated always as identity primary key,
  user_id uuid not null references profiles(id) on delete cascade,
  insight_date date not null default current_date,
  content text not null,
  created_at timestamptz default now(),
  unique (user_id, insight_date)
);