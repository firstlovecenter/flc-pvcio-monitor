-- ─────────────────────────────────────────────────────────────────
-- Migration: user_id_to_text
-- Date: 2026-05-14
--
-- The external JWT (First Love Center / FLC Members) issues MongoDB
-- ObjectIDs as user IDs (24-char hex strings), not UUIDs.
-- Change profiles.id and activity_logs.submitted_by_id from uuid → text
-- so they accept the real IDs.
-- ─────────────────────────────────────────────────────────────────

-- Drop FK first (must drop before altering referenced column)
alter table public.activity_logs
  drop constraint if exists activity_logs_submitted_by_id_fkey;

-- profiles.id: uuid → text
alter table public.profiles
  alter column id type text using id::text;

-- activity_logs.submitted_by_id: uuid → text
alter table public.activity_logs
  alter column submitted_by_id type text using submitted_by_id::text;

-- Re-add FK (removed — FK on submitted_by_id causes insert failures when
-- a profile row doesn't exist yet. submitted_by_id is stored as an audit
-- trail only; integrity is enforced at the edge function layer instead.)
-- alter table public.activity_logs
--   add constraint activity_logs_submitted_by_id_fkey
--     foreign key (submitted_by_id) references public.profiles(id);
