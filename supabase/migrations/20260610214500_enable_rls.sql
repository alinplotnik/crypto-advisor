-- Enable Row Level Security on all app tables.
-- Every app query runs with the anon key as the logged-in user (via @supabase/ssr
-- cookies), so these policies restrict each user to their own rows. Profile
-- creation on signup is unaffected: the handle_new_user trigger is security
-- definer and bypasses RLS.
-- (select auth.uid()) instead of bare auth.uid() lets Postgres evaluate it once
-- per query instead of once per row.

alter table profiles enable row level security;
alter table preferences enable row level security;
alter table feedback enable row level security;
alter table insights enable row level security;

-- Profiles: read own + update own (onboarding marks onboarding_completed).
-- No insert policy: rows are created by the signup trigger.
create policy "Users can view own profile"
  on profiles for select to authenticated
  using ((select auth.uid()) = id);

create policy "Users can update own profile"
  on profiles for update to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- Preferences: the onboarding upsert needs insert + update; dashboard reads them.
create policy "Users can view own preferences"
  on preferences for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can insert own preferences"
  on preferences for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users can update own preferences"
  on preferences for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

-- Feedback: the voting upsert needs insert + update (re-voting updates the row).
create policy "Users can view own feedback"
  on feedback for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can insert own feedback"
  on feedback for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users can update own feedback"
  on feedback for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

-- Insights: daily cache is read + inserted per user. No update policy needed:
-- the upsert uses ignoreDuplicates (ON CONFLICT DO NOTHING), which never updates.
create policy "Users can view own insights"
  on insights for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can insert own insights"
  on insights for insert to authenticated
  with check ((select auth.uid()) = user_id);
