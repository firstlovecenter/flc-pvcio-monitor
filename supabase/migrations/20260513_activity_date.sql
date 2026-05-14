-- Add activity_date column to activity_logs for timeline matching.
-- activity_date is the date the activity actually happened (leader-selected, up to 4 weeks back).
-- submitted_at remains the audit timestamp for when the form was submitted.

alter table public.activity_logs
  add column if not exists activity_date date;

-- Index for timeline done-check queries (submitted_by_id + date range)
create index if not exists activity_logs_activity_date_idx
  on public.activity_logs (submitted_by_id, activity_date);
