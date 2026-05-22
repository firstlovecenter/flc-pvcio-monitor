-- Prevent duplicate activity logs for the same user + activity + date.
-- The edge function already checks before inserting, but this constraint
-- is the absolute database-level backstop.

alter table public.activity_logs
  add constraint activity_logs_unique_per_user_activity_date
  unique (submitted_by_id, activity_id, activity_date);
