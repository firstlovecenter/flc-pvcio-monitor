    -- ═══════════════════════════════════════════════════════════════
    -- PVCIO Monitor — Supabase Schema
    -- Run this in the Supabase SQL editor (Dashboard → SQL Editor)
    --
    -- KEY DESIGN: activity_logs stores church UNIT IDs (bacenta_id,
    -- governorship_id, council_id, stream_id) — not just leader IDs.
    -- This means data belongs to the unit forever, even when the
    -- leader changes.
    -- ═══════════════════════════════════════════════════════════════


    -- ─────────────────────────────────────────────────────────────────
    -- TABLE: profiles
    -- Stores leader profile data derived from the JWT.
    -- Created/updated (upserted) on every login so it stays in sync.
    -- ─────────────────────────────────────────────────────────────────
    create table if not exists public.profiles (
    id                uuid primary key,         -- matches userId from external JWT
    email             text not null,
    first_name        text not null,
    last_name         text not null,
    level             text not null
                        check (level in ('bacenta', 'governorship', 'overseer', 'bishop')),
    roles             text[] not null default '{}',

    -- Church unit references (IDs sourced from the FLC Members system)
    bacenta_id        text,
    bacenta_name      text,
    governorship_id   text,
    governorship_name text,
    council_id        text,
    council_name      text,
    stream_id         text,
    stream_name       text,

    created_at        timestamptz default now(),
    updated_at        timestamptz default now()
    );


    -- ─────────────────────────────────────────────────────────────────
    -- TABLE: activity_logs
    -- One row per submitted activity form.
    --
    -- UNIT-CENTRIC DESIGN:
    --   bacenta_id / governorship_id / council_id / stream_id are the
    --   stable identifiers for the church unit this log belongs to.
    --   submitted_by_id is just the audit trail for who pressed Submit.
    --   Query by unit ID to get all history for a unit across leader changes.
    -- ─────────────────────────────────────────────────────────────────
    create table if not exists public.activity_logs (
    id                uuid primary key default gen_random_uuid(),

    -- Activity metadata (from activities.js)
    activity_id       text not null,            -- e.g. 'p1', 'o7'
    activity_name     text not null,            -- e.g. 'Bacenta Prayer Meeting'
    category          text not null
                        check (category in ('prayer', 'visitation', 'counseling', 'teaching', 'outreaches', 'summary')),
    level             text not null             -- activity's level (not submitter's level)
                        check (level in ('bacenta', 'governorship', 'overseer', 'bishop')),
    freq              text not null
                        check (freq in ('weekly', 'cycle')),

    -- Log type: 'activity' for normal logs, 'weekly_summary' for end-of-week summaries
    type              text not null default 'activity'
                        check (type in ('activity', 'weekly_summary')),
    -- ISO week string (e.g. '2026-W20') for grouping and summary lookups
    iso_week          text,

    -- ── UNIT IDs ── (stable; survives leader changes) ─────────────
    -- For a bacenta-level log:  bacenta_id is set; governorship_id = parent gov
    -- For a governorship log:   bacenta_id is null; governorship_id is set
    -- For an oversight log:     council_id is set; others may be null
    -- Always store every ancestor ID you have available.
    bacenta_id        text,                     -- set for bacenta-level activities
    governorship_id   text,                     -- set for gov + bacenta activities
    council_id        text,                     -- set when council ID is known
    stream_id         text,                     -- always set when known

    -- Unit display names (denormalised for fast display)
    -- These reflect the name at time of submission; the IDs are the truth.
    bacenta_name      text,
    governorship_name text,
    council_name      text,
    stream_name       text,

    -- ── Submitter (audit trail only) ──────────────────────────────
    submitted_by_id   uuid not null references public.profiles(id),
    submitted_by_name text not null,            -- denormalised: "{firstName} {lastName}"

    -- ── Form data ─────────────────────────────────────────────────
    -- Flexible JSON — structure varies by activity type. Examples:
    --   Prayer:     { "attendance": 12, "note": "Good turnout" }
    --   Visitation: { "visitedCount": 8, "visitedNames": ["Ama","Kojo"] }
    --   Counseling: { "issueType": "General", "counseledCount": 3 }
    --   Teaching:   { "bacentasPreached": ["God Chasers","Victory"] }
    --   Outreach:   { "attendance": 45, "salvations": 3, "photoUrl": "..." }
    fields            jsonb not null default '{}',

    -- Photo stored in Supabase Storage bucket 'activity-photos'
    photo_url         text,

    submitted_at      timestamptz default now(),
    created_at        timestamptz default now()
    );


    -- ─────────────────────────────────────────────────────────────────
    -- INDEXES
    -- ─────────────────────────────────────────────────────────────────

    -- Unit-centric queries (primary pattern for reporting/dashboards)
    create index if not exists activity_logs_bacenta_idx
    on public.activity_logs (bacenta_id, submitted_at desc);

    create index if not exists activity_logs_governorship_idx
    on public.activity_logs (governorship_id, submitted_at desc);

    create index if not exists activity_logs_council_idx
    on public.activity_logs (council_id, submitted_at desc);

    create index if not exists activity_logs_stream_idx
    on public.activity_logs (stream_id, submitted_at desc);

    -- Per-leader home feed
    create index if not exists activity_logs_user_idx
    on public.activity_logs (submitted_by_id, submitted_at desc);

    -- Oversight / Looker Studio queries
    create index if not exists activity_logs_level_cat_idx
    on public.activity_logs (level, category, submitted_at desc);


    -- ─────────────────────────────────────────────────────────────────
    -- ROW LEVEL SECURITY
    --
    -- NOTE: RLS policies using auth.uid() only work when the external
    -- JWT is signed with the same secret set in Supabase:
    --   Settings → API → JWT Secret
    -- Coordinate with the auth system owner (First Love Center) to
    -- confirm the secret matches, or disable RLS and enforce access
    -- rules server-side instead.
    -- ─────────────────────────────────────────────────────────────────
    alter table public.profiles       enable row level security;
    alter table public.activity_logs  enable row level security;

    -- profiles: each leader can only read/write their own row
    create policy "profiles_select_own"
    on public.profiles for select
    using (auth.uid() = id);

    create policy "profiles_insert_own"
    on public.profiles for insert
    with check (auth.uid() = id);

    create policy "profiles_update_own"
    on public.profiles for update
    using (auth.uid() = id);

    -- activity_logs: leaders can insert and read their own logs
    create policy "logs_insert_own"
    on public.activity_logs for insert
    with check (auth.uid() = submitted_by_id);

    create policy "logs_select_own"
    on public.activity_logs for select
    using (auth.uid() = submitted_by_id);

    create policy "logs_delete_own"
    on public.activity_logs for delete
    using (auth.uid() = submitted_by_id);

    -- Admin / oversight read-all: use a Supabase Edge Function with the
    -- service role key — never expose the service role key to the client.


    -- ─────────────────────────────────────────────────────────────────
    -- STORAGE BUCKET: activity-photos
    -- Path convention: {userId}/{timestamp}.{ext}
    -- ─────────────────────────────────────────────────────────────────
    insert into storage.buckets (id, name, public)
    values ('activity-photos', 'activity-photos', false)
    on conflict (id) do nothing;

    create policy "photos_upload_own"
    on storage.objects for insert
    with check (
        bucket_id = 'activity-photos'
        and auth.uid()::text = (storage.foldername(name))[1]
    );

    create policy "photos_read_own"
    on storage.objects for select
    using (
        bucket_id = 'activity-photos'
        and auth.uid()::text = (storage.foldername(name))[1]
    );
