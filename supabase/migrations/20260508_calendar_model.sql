-- ═══════════════════════════════════════════════════════════════
-- Migration: calendar_model
-- Date: 2026-05-08
--
-- What this changes from the initial schema:
--
--  profiles
--    • level check expanded to include 'overseer' and 'bishop'
--      (replaces 'oversight')
--
--  activity_logs
--    • level check expanded to include 'overseer' and 'bishop'
--      (replaces 'oversight')
--    • freq check changed to ('weekly', 'cycle')
--      (removes 'monthly' and 'flexible')
--    • category check expanded to include 'summary'
--    • NEW column: type  text  default 'activity'
--    • NEW column: iso_week  text  (e.g. '2026-W20')
--
-- Safe to run on an existing database. Uses ALTER TABLE so existing
-- rows are not touched. The check-constraint changes drop old
-- constraints and add new ones — safe as long as no rows contain the
-- removed values ('oversight', 'monthly', 'flexible').
-- ═══════════════════════════════════════════════════════════════


-- ─────────────────────────────────────────────────────────────────
-- profiles — level check
-- ─────────────────────────────────────────────────────────────────

alter table public.profiles
  drop constraint if exists profiles_level_check;

alter table public.profiles
  add constraint profiles_level_check
    check (level in ('bacenta', 'governorship', 'overseer', 'bishop'));


-- ─────────────────────────────────────────────────────────────────
-- activity_logs — level check
-- ─────────────────────────────────────────────────────────────────

alter table public.activity_logs
  drop constraint if exists activity_logs_level_check;

alter table public.activity_logs
  add constraint activity_logs_level_check
    check (level in ('bacenta', 'governorship', 'overseer', 'bishop'));


-- ─────────────────────────────────────────────────────────────────
-- activity_logs — freq check
-- ─────────────────────────────────────────────────────────────────

alter table public.activity_logs
  drop constraint if exists activity_logs_freq_check;

alter table public.activity_logs
  add constraint activity_logs_freq_check
    check (freq in ('weekly', 'cycle'));


-- ─────────────────────────────────────────────────────────────────
-- activity_logs — category check (add 'summary')
-- ─────────────────────────────────────────────────────────────────

alter table public.activity_logs
  drop constraint if exists activity_logs_category_check;

alter table public.activity_logs
  add constraint activity_logs_category_check
    check (category in ('prayer', 'visitation', 'counseling', 'teaching', 'outreaches', 'summary'));


-- ─────────────────────────────────────────────────────────────────
-- activity_logs — new columns: type, iso_week
-- ─────────────────────────────────────────────────────────────────

alter table public.activity_logs
  add column if not exists type text not null default 'activity'
    check (type in ('activity', 'weekly_summary'));

alter table public.activity_logs
  add column if not exists iso_week text;


-- ─────────────────────────────────────────────────────────────────
-- Optional index — speeds up weekly summary lookups
-- ─────────────────────────────────────────────────────────────────

create index if not exists activity_logs_iso_week_idx
  on public.activity_logs (submitted_by_id, iso_week, type);
