// src/utils/logs.js
// Activity log CRUD — backed by Supabase.
//
// UNIT-CENTRIC STORAGE: every log stores the church unit's stable IDs
// (bacenta_id, governorship_id, council_id, stream_id) so that all
// history for a unit is queryable even after a leader change.
// submitted_by_id is the audit trail only.

import { supabase } from './supabase'

// ── Edge Function client ──────────────────────────────────────────────────

/**
 * POST to a Supabase Edge Function with the FLC JWT attached.
 * Throws if the response is not OK.
 * @param {string} fnName — Edge Function name (e.g. 'log-activity')
 * @param {object} body   — JSON-serialisable request body
 * @returns {Promise<object>}
 */
async function callEdgeFunction(fnName, body) {
  const token = localStorage.getItem('accessToken')
  if (!token) throw new Error('Not authenticated — no accessToken found')

  const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/${fnName}`
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }))
    throw new Error(
      err.error || `Edge function "${fnName}" failed with status ${res.status}`,
    )
  }

  return res.json()
}

// ── Helpers ──────────────────────────────────────────────────────────────

/**
 * Returns ISO week string like '2026-W20'.
 * @param {Date} date
 * @returns {string}
 */
export function getISOWeekString(date) {
  const d = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()),
  )
  const day = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - day)
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  const week = Math.ceil(((d - yearStart) / 86400000 + 1) / 7)
  return `${d.getUTCFullYear()}-W${String(week).padStart(2, '0')}`
}

// ── Read ──────────────────────────────────────────────────────────────────

/**
 * Returns a Map<activityId, Set<dateStr>> for all logs by the given user
 * whose activity_date falls within [rangeStart, rangeEnd] (inclusive, 'yyyy-MM-dd').
 * Used by TimelineScreen to mark which activities are done on which days.
 * @param {string} userId
 * @param {string} rangeStart — 'yyyy-MM-dd'
 * @param {string} rangeEnd   — 'yyyy-MM-dd'
 * @returns {Promise<Map<string, Set<string>>>}
 */
export async function getLogsForTimeline(userId, rangeStart, rangeEnd) {
  const { data, error } = await supabase
    .from('activity_logs')
    .select('activity_id, activity_date')
    .eq('submitted_by_id', userId)
    .eq('type', 'activity')
    .gte('activity_date', rangeStart)
    .lte('activity_date', rangeEnd)
  if (error) throw error

  const map = new Map()
  for (const row of data) {
    if (!row.activity_date) continue
    if (!map.has(row.activity_id)) map.set(row.activity_id, new Set())
    map.get(row.activity_id).add(row.activity_date)
  }
  return map
}

/**
 * Returns the last `limit` logs for the given user (home feed).
 * @param {string} userId
 * @param {number} limit
 * @returns {Promise<object[]>}
 */
export async function getRecentLogs(userId, limit = 20) {
  const { data, error } = await supabase
    .from('activity_logs')
    .select('*')
    .eq('submitted_by_id', userId)
    .order('submitted_at', { ascending: false })
    .limit(limit)
  if (error) throw error
  return data
}

/**
 * Returns all logs for a user filtered by category.
 * @param {string} userId
 * @param {string} categoryId
 * @returns {Promise<object[]>}
 */
export async function getLogsByCategory(userId, categoryId) {
  const { data, error } = await supabase
    .from('activity_logs')
    .select('*')
    .eq('submitted_by_id', userId)
    .eq('category', categoryId)
    .order('submitted_at', { ascending: false })
  if (error) throw error
  return data
}

/**
 * Returns all logs for a specific church unit (unit-centric query).
 * Use this instead of querying by leader when building dashboards.
 * @param {'bacenta'|'governorship'|'council'} unitType
 * @param {string} unitId
 * @returns {Promise<object[]>}
 */
export async function getLogsByUnit(unitType, unitId) {
  const column = `${unitType}_id` // 'bacenta_id' | 'governorship_id' | 'council_id'
  const { data, error } = await supabase
    .from('activity_logs')
    .select('*')
    .eq(column, unitId)
    .order('submitted_at', { ascending: false })
  if (error) throw error
  return data
}

// ── Write ─────────────────────────────────────────────────────────────────

/**
 * Save a new activity log entry.
 *
 * Stores unit IDs alongside unit names so the record belongs to the
 * church unit permanently, regardless of future leader changes.
 *
 * @param {object} user    — enriched user object from getCurrentUser()
 * @param {object} entry   — { activityId, activityName, category, level, freq, fields }
 * @param {File|null} photoFile — raw File object if a photo was captured
 * @returns {Promise<object>} — the inserted row
 */
export async function addLog(user, entry, photoFile = null) {
  let photoUrl = null
  if (photoFile) {
    photoUrl = await uploadPhoto(user.userId, photoFile)
  }

  // Resolve the active church context — this is the unit being logged for.
  const active = user.activeChurch || null

  // Build stable unit IDs. We store every ancestor ID we have so
  // oversight dashboards can filter by any level.
  const bacentaId = active?.level === 'bacenta' ? active.id : null
  const governorshipId =
    active?.level === 'governorship' ? active.id : user.governorship?.id || null
  const councilId =
    active?.level === 'oversight' ? active.id : user.council?.id || null
  const streamId = user.stream?.id || null

  const row = {
    // Activity type + ISO week
    type: 'activity',
    iso_week: getISOWeekString(new Date()),

    activity_id: entry.activityId,
    activity_name: entry.activityName,
    category: entry.category,
    level: entry.level,
    freq: entry.freq,
    activity_date: entry.activityDate,

    // Unit IDs (unit-centric — the source of truth for reporting)
    bacenta_id: bacentaId,
    governorship_id: governorshipId,
    council_id: councilId,
    stream_id: streamId,

    // Unit display names (denormalised for fast display)
    bacenta_name: active?.level === 'bacenta' ? active.name : null,
    governorship_name:
      active?.level === 'governorship'
        ? active.name
        : user.governorship?.name || null,
    council_name:
      active?.level === 'oversight' ? active.name : user.council?.name || null,
    stream_name: user.stream?.name || null,

    // Audit trail
    submitted_by_id: user.userId,
    submitted_by_name: `${user.firstName} ${user.lastName}`,

    fields: entry.fields,
    photo_url: photoUrl,
  }

  return callEdgeFunction('log-activity', { row })
}

/**
 * Delete a log entry by its UUID.
 * RLS ensures only the submitter can delete their own logs.
 * @param {string} logId
 */
export async function deleteLog(logId) {
  const { error } = await supabase
    .from('activity_logs')
    .delete()
    .eq('id', logId)
  if (error) throw error
}

// ── Photos ────────────────────────────────────────────────────────────────

/**
 * Upload a photo file to Supabase Storage and return its public URL.
 * Path: {userId}/{timestamp}.{ext}
 * @param {string} userId
 * @param {File} file
 * @returns {Promise<string>} public URL
 */
export async function uploadPhoto(userId, file) {
  const ext = file.name.split('.').pop()
  const filename = `${userId}/${Date.now()}.${ext}`

  const { error: uploadError } = await supabase.storage
    .from('activity-photos')
    .upload(filename, file, { upsert: false })

  if (uploadError) throw uploadError

  const { data } = supabase.storage
    .from('activity-photos')
    .getPublicUrl(filename)

  return data.publicUrl
}

// ── Profile sync ──────────────────────────────────────────────────────────

/**
 * Upsert the leader's profile in Supabase from the enriched user object.
 * Call this on every login to keep profile data in sync with the JWT.
 * @param {object} user — enriched user object from enrichUser()
 */
export async function upsertProfile(user) {
  await callEdgeFunction('upsert-profile', {
    profile: {
      id: user.userId,
      email: user.email,
      first_name: user.firstName,
      last_name: user.lastName,
      level: user.level,
      roles: user.roles || [],
      bacenta_id: user.bacenta?.id || null,
      bacenta_name: user.bacenta?.name || null,
      governorship_id: user.governorship?.id || null,
      governorship_name: user.governorship?.name || null,
      council_id: user.council?.id || null,
      council_name: user.council?.name || null,
      stream_id: user.stream?.id || null,
      stream_name: user.stream?.name || null,
      updated_at: new Date().toISOString(),
    },
  })
}

// ── Weekly Summary ────────────────────────────────────────────────────────

/**
 * Returns the weekly summary log for a given ISO week, or null if none.
 * @param {string} userId
 * @param {string} isoWeek — e.g. '2026-W20'
 * @returns {Promise<object|null>}
 */
export async function getWeeklySummary(userId, isoWeek) {
  const { data, error } = await supabase
    .from('activity_logs')
    .select('*')
    .eq('submitted_by_id', userId)
    .eq('type', 'weekly_summary')
    .eq('iso_week', isoWeek)
    .maybeSingle()
  if (error) throw error
  return data
}

/**
 * Save a weekly summary log entry.
 * @param {object} user — enriched user object
 * @param {string} isoWeek — e.g. '2026-W20'
 * @param {object} summary — { logsThisWeek, missedActivities, note }
 * @returns {Promise<object>}
 */
export async function addWeeklySummary(
  user,
  isoWeek,
  { logsThisWeek, missedActivities, note },
) {
  const active = user.activeChurch || null
  const row = {
    type: 'weekly_summary',
    iso_week: isoWeek,
    activity_id: 'weekly_summary',
    activity_name: 'Weekly Summary',
    category: 'summary',
    level: user.level,
    freq: 'weekly',
    bacenta_id: active?.level === 'bacenta' ? active.id : null,
    governorship_id:
      active?.level === 'governorship'
        ? active.id
        : user.governorship?.id || null,
    council_id:
      active?.level === 'overseer' ? active.id : user.council?.id || null,
    stream_id: user.stream?.id || null,
    bacenta_name: active?.level === 'bacenta' ? active.name : null,
    governorship_name:
      active?.level === 'governorship'
        ? active.name
        : user.governorship?.name || null,
    council_name:
      active?.level === 'overseer' ? active.name : user.council?.name || null,
    stream_name: user.stream?.name || null,
    submitted_by_id: user.userId,
    submitted_by_name: `${user.firstName} ${user.lastName}`,
    fields: { logsThisWeek, missedActivities, note },
    photo_url: null,
  }
  return callEdgeFunction('log-activity', { row })
}
