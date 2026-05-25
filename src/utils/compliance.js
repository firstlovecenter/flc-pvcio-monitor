// src/utils/compliance.js
// Cross-reference logic: who should have filed vs who did file.
//
// Step 1 — Leader lists: currently mock data from leaders.js.
//          Swap fetch functions to real Neo4j queries without changing callers.
// Step 2 — Expected activities: derived from activities.js + cycle week.
// Step 3 — Actual logs: queried from Supabase activity_logs.
// Step 4 — Cross-reference to produce compliance rows.

import { startOfISOWeek, subWeeks, getISOWeek, getISOWeekYear } from 'date-fns'
import { ACTIVITIES } from '../data/activities'
import { supabase } from './supabase'
import { adminRunNeo4jQuery } from './neo4j'
import { getCycleWeekForMonday, getMondayOfISOWeek } from './timeline'

// ── ISO week helpers ──────────────────────────────────────────────────────────

export function getISOWeekString(date) {
  const weekStart = startOfISOWeek(date)
  const year = weekStart.getFullYear()
  const week = getISOWeek(weekStart)
  return `${year}-W${String(week).padStart(2, '0')}`
}

export function getCurrentWeekString() {
  return getISOWeekString(new Date())
}

export function getLastWeekString() {
  return getISOWeekString(subWeeks(new Date(), 1))
}

// ── Neo4j fetch functions ────────────────────────────────────────────────────
// Each function returns a Promise<leader[]> — same shape for all callers.
// Council / gov / leader still use mock data — swap when queries are confirmed.

const LEADER_FIELDS = `
  u.id                                        AS userId,
  u.firstName + ' ' + coalesce(u.lastName,'') AS fullName
`

export async function fetchLeadersForStream(streamId) {
  const query = `
    // ── Overseers ──────────────────────────────────────────────────────────
    MATCH (s:Stream {id: $streamId})-[:HAS]->(c:Council)
    MATCH (u:User:Member)-[:LEADS]->(c)
    RETURN ${LEADER_FIELDS},
           'overseer'  AS level,
           s.id        AS streamId,    s.name AS streamName,
           c.id        AS councilId,   c.name AS councilName,
           null        AS governorshipId, null AS governorshipName,
           null        AS bacentaId,   null   AS bacentaName

    UNION ALL

    // ── Governors ──────────────────────────────────────────────────────────
    MATCH (s:Stream {id: $streamId})-[:HAS]->(c:Council)-[:HAS]->(g:Governorship)
    MATCH (u:User:Member)-[:LEADS]->(g)
    RETURN ${LEADER_FIELDS},
           'governorship' AS level,
           s.id           AS streamId,        s.name AS streamName,
           c.id           AS councilId,        c.name AS councilName,
           g.id           AS governorshipId,   g.name AS governorshipName,
           null           AS bacentaId,        null   AS bacentaName

    UNION ALL

    // ── Bacenta leaders ────────────────────────────────────────────────────
    MATCH (s:Stream {id: $streamId})-[:HAS]->(c:Council)
          -[:HAS]->(g:Governorship)-[:HAS]->(b:Bacenta)
    MATCH (u:User:Member)-[:LEADS]->(b)
    RETURN ${LEADER_FIELDS},
           'bacenta' AS level,
           s.id      AS streamId,        s.name                        AS streamName,
           c.id      AS councilId,       c.name                        AS councilName,
           g.id      AS governorshipId,  g.name                        AS governorshipName,
           b.id      AS bacentaId,       b.name AS bacentaName
  `
  return adminRunNeo4jQuery(query, { streamId })
}

export async function fetchLeadersForCouncil(councilId) {
  const query = `
    // ── Overseer ───────────────────────────────────────────────────────────
    MATCH (c:Council {id: $councilId})<-[:HAS]-(s:Stream)
    MATCH (u:User:Member)-[:LEADS]->(c)
    RETURN ${LEADER_FIELDS},
           'overseer' AS level,
           s.id AS streamId,   s.name AS streamName,
           c.id AS councilId,  c.name AS councilName,
           null AS governorshipId, null AS governorshipName,
           null AS bacentaId,  null   AS bacentaName

    UNION ALL

    // ── Governors ──────────────────────────────────────────────────────────
    MATCH (c:Council {id: $councilId})<-[:HAS]-(s:Stream)
    MATCH (c)-[:HAS]->(g:Governorship)
    MATCH (u:User:Member)-[:LEADS]->(g)
    RETURN ${LEADER_FIELDS},
           'governorship' AS level,
           s.id AS streamId,        s.name AS streamName,
           c.id AS councilId,       c.name AS councilName,
           g.id AS governorshipId,  g.name AS governorshipName,
           null AS bacentaId,       null   AS bacentaName

    UNION ALL

    // ── Bacenta leaders ────────────────────────────────────────────────────
    MATCH (c:Council {id: $councilId})<-[:HAS]-(s:Stream)
    MATCH (c)-[:HAS]->(g:Governorship)-[:HAS]->(b:Bacenta)
    MATCH (u:User:Member)-[:LEADS]->(b)
    RETURN ${LEADER_FIELDS},
           'bacenta' AS level,
           s.id AS streamId,        s.name AS streamName,
           c.id AS councilId,       c.name AS councilName,
           g.id AS governorshipId,  g.name AS governorshipName,
           b.id AS bacentaId,       b.name AS bacentaName
  `
  return adminRunNeo4jQuery(query, { councilId })
}

export async function fetchLeadersForGovernorship(govId) {
  const query = `
    // ── Governor ───────────────────────────────────────────────────────────
    MATCH (g:Governorship {id: $govId})<-[:HAS]-(c:Council)<-[:HAS]-(s:Stream)
    MATCH (u:User:Member)-[:LEADS]->(g)
    RETURN ${LEADER_FIELDS},
           'governorship' AS level,
           s.id AS streamId,        s.name AS streamName,
           c.id AS councilId,       c.name AS councilName,
           g.id AS governorshipId,  g.name AS governorshipName,
           null AS bacentaId,       null   AS bacentaName

    UNION ALL

    // ── Bacenta leaders ────────────────────────────────────────────────────
    MATCH (g:Governorship {id: $govId})<-[:HAS]-(c:Council)<-[:HAS]-(s:Stream)
    MATCH (g)-[:HAS]->(b:Bacenta)
    MATCH (u:User:Member)-[:LEADS]->(b)
    RETURN ${LEADER_FIELDS},
           'bacenta' AS level,
           s.id AS streamId,        s.name AS streamName,
           c.id AS councilId,       c.name AS councilName,
           g.id AS governorshipId,  g.name AS governorshipName,
           b.id AS bacentaId,       b.name AS bacentaName
  `
  return adminRunNeo4jQuery(query, { govId })
}

export async function fetchLeaderById(userId) {
  // Tries each leadership level in order — bacenta first, then governorship,
  // then council (overseer). Returns the first match found.
  const query = `
    MATCH (u:User:Member {id: $userId})

    OPTIONAL MATCH (u)-[:LEADS]->(b:Bacenta)<-[:HAS]-(g:Governorship)
                                             <-[:HAS]-(c:Council)
                                             <-[:HAS]-(s:Stream)

    OPTIONAL MATCH (u)-[:LEADS]->(g2:Governorship)<-[:HAS]-(c2:Council)
                                                   <-[:HAS]-(s2:Stream)

    OPTIONAL MATCH (u)-[:LEADS]->(c3:Council)<-[:HAS]-(s3:Stream)

    RETURN ${LEADER_FIELDS},
           CASE
             WHEN b  IS NOT NULL THEN 'bacenta'
             WHEN g2 IS NOT NULL THEN 'governorship'
             WHEN c3 IS NOT NULL THEN 'overseer'
           END AS level,
           coalesce(s.id,   s2.id,   s3.id)   AS streamId,
           coalesce(s.name, s2.name, s3.name) AS streamName,
           coalesce(c.id,   c2.id,   c3.id)   AS councilId,
           coalesce(c.name, c2.name, c3.name) AS councilName,
           coalesce(g.id,   g2.id)            AS governorshipId,
           coalesce(g.name, g2.name)          AS governorshipName,
           b.id   AS bacentaId,
           b.name AS bacentaName
    LIMIT 1
  `
  const rows = await adminRunNeo4jQuery(query, { userId })
  return rows[0] ?? null
}

// ── Expected activities ───────────────────────────────────────────────────────

/**
 * Returns the activityIds a leader at `level` is expected to file
 * in the ISO week identified by `weekStr` (e.g. '2026-W20').
 *
 * Excludes activities the leader merely monitors or ensures (visibility:
 * 'monitor' | 'ensure') since those are supervisory, not personal logs.
 */
export function getExpectedActivityIds(level, weekStr) {
  const monday = getMondayOfISOWeek(weekStr)
  const cycleWeek = getCycleWeekForMonday(monday)

  // Normalise bishop → overseer (same activities)
  const normLevel = level === 'bishop' ? 'overseer' : level

  return ACTIVITIES.filter((activity) => {
    // Must apply to this level
    if (!activity.appliesTo.includes(normLevel)) return false

    // Supervisory-only activities don't require a personal log
    const vis = activity.visibility ?? 'lead'
    if (vis === 'monitor' || vis === 'ensure') return false

    // Weekly — always expected (stream filters not applied here, keep simple)
    if (activity.freq === 'weekly') return true

    // Cycle-specific — only expected in the matching cycle week
    if (activity.freq === 'cycle') return activity.cycleWeek === cycleWeek

    return false
  }).map((a) => a.id)
}

// ── Supabase log fetch ────────────────────────────────────────────────────────

/**
 * Returns all activity log rows for the given ISO week filed by any of
 * the given leader IDs.
 * Each row: { submitted_by_id, activity_id, submitted_by_name, submitted_at }
 *
 * Note: filters by submitted_by_id rather than stream_name because
 * stream_name is not reliably populated in older log rows.
 */
export async function fetchLogsForWeek(weekStr, leaderIds) {
  if (!leaderIds?.length) return []

  const { data, error } = await supabase
    .from('activity_logs')
    .select('submitted_by_id, activity_id, submitted_by_name, submitted_at')
    .eq('iso_week', weekStr)
    .in('submitted_by_id', leaderIds)
    .eq('type', 'activity')

  if (error) throw error
  return data ?? []
}

/**
 * Admin version of fetchLogsForWeek — calls the admin-fetch-logs edge function
 * which uses the Supabase service role key to bypass RLS.
 * Use this in all admin screens instead of fetchLogsForWeek.
 */
export async function adminFetchLogsForWeek(weekStr, leaderIds) {
  if (!leaderIds?.length) return []

  const adminKey = import.meta.env.VITE_ADMIN_API_KEY
  if (!adminKey) throw new Error('VITE_ADMIN_API_KEY is not set')

  const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-fetch-logs`
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${adminKey}`,
    },
    body: JSON.stringify({ weekStr, leaderIds }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }))
    throw new Error(
      err.error || `admin-fetch-logs failed with status ${res.status}`,
    )
  }

  const { data } = await res.json()
  return data ?? []
}

// ── Cross-reference ───────────────────────────────────────────────────────────

/**
 * For each leader, determine which activities they filed and which they missed.
 *
 * @param {object[]} leaders  — array of leader objects
 * @param {string}   weekStr  — ISO week string e.g. '2026-W20'
 * @param {object[]} logs     — array of { submitted_by_id, activity_id }
 * @returns {object[]} compliance rows — one per leader
 */
export function computeCompliance(leaders, weekStr, logs) {
  const logSet = new Set(
    logs.map((l) => `${l.submitted_by_id}::${l.activity_id}`),
  )

  return leaders.map((leader) => {
    const expected = getExpectedActivityIds(leader.level, weekStr)
    const filled = expected.filter((actId) =>
      logSet.has(`${leader.userId}::${actId}`),
    )
    const missing = expected.filter(
      (actId) => !logSet.has(`${leader.userId}::${actId}`),
    )

    return {
      ...leader,
      expected: expected.length,
      filled: filled.length,
      missing: missing.length,
      filledIds: filled,
      missingIds: missing,
      pct: expected.length
        ? Math.round((filled.length / expected.length) * 100)
        : 100,
      compliant: missing.length === 0,
    }
  })
}

/**
 * Roll up compliance rows to summary numbers for a parent node.
 * @param {object[]} rows — compliance rows from computeCompliance
 * @returns {{ total, filled, missing, pct }}
 */
export function rollUp(rows) {
  const total = rows.reduce((s, r) => s + r.expected, 0)
  const filled = rows.reduce((s, r) => s + r.filled, 0)
  const missing = total - filled
  const pct = total ? Math.round((filled / total) * 100) : 100
  return { total, filled, missing, pct }
}

/**
 * Roll up compliance rows by leader headcount.
 * A leader is "compliant" when all their expected activities are filed.
 * @param {object[]} rows — compliance rows from computeCompliance
 * @returns {{ compliant, total, pct, defaulters }}
 */
export function rollUpLeaders(rows) {
  const total = rows.length
  const compliant = rows.filter((r) => r.compliant).length
  const defaulters = rows.filter((r) => !r.compliant)
  const pct = total ? Math.round((compliant / total) * 100) : 100
  return { compliant, total, pct, defaulters }
}

// ── Status label + colour ─────────────────────────────────────────────────────

export function complianceStatus(pct) {
  if (pct === 100) return { label: 'Compliant', color: '#34D399' }
  if (pct >= 75) return { label: 'Mostly done', color: '#FBBF24' }
  if (pct >= 50) return { label: 'Partially done', color: '#F97316' }
  if (pct >= 1) return { label: 'Behind', color: '#F87060' }
  return { label: 'Nothing filed', color: '#DC2626' }
}

// ── Convenience: fetch + compute for a scope in both weeks ───────────────────

/**
 * Load leaders for a scope, then compute compliance for last week and
 * current week from Supabase.
 *
 * @param {'stream'|'council'|'governorship'} scope
 * @param {string} scopeId
 * @returns {{ leaders, lastWeek: { weekStr, rows, summary },
 *             thisWeek: { weekStr, rows, summary } }}
 */
export async function loadCompliance(scope, scopeId) {
  let leaders
  if (scope === 'stream') leaders = await fetchLeadersForStream(scopeId)
  else if (scope === 'council') leaders = await fetchLeadersForCouncil(scopeId)
  else leaders = await fetchLeadersForGovernorship(scopeId)

  const lastWeekStr = getLastWeekString()
  const currentWeekStr = getCurrentWeekString()

  const leaderIds = leaders.map((l) => l.userId)
  const [lastLogs, thisLogs] = await Promise.all([
    adminFetchLogsForWeek(lastWeekStr, leaderIds),
    adminFetchLogsForWeek(currentWeekStr, leaderIds),
  ])

  const lastRows = computeCompliance(leaders, lastWeekStr, lastLogs)
  const thisRows = computeCompliance(leaders, currentWeekStr, thisLogs)

  return {
    leaders,
    lastWeek: {
      weekStr: lastWeekStr,
      rows: lastRows,
      summary: rollUpLeaders(lastRows),
    },
    thisWeek: {
      weekStr: currentWeekStr,
      rows: thisRows,
      summary: rollUpLeaders(thisRows),
    },
  }
}

/**
 * Fetch + compute compliance for a single leader in both weeks.
 */
export async function loadLeaderCompliance(userId) {
  const leader = await fetchLeaderById(userId)
  if (!leader) throw new Error(`Leader ${userId} not found`)

  const lastWeekStr = getLastWeekString()
  const currentWeekStr = getCurrentWeekString()

  const [lastLogs, thisLogs] = await Promise.all([
    adminFetchLogsForWeek(lastWeekStr, [leader.userId]),
    adminFetchLogsForWeek(currentWeekStr, [leader.userId]),
  ])

  function buildDetail(weekStr, logs) {
    const logSet = new Set(
      logs.map((l) => `${l.submitted_by_id}::${l.activity_id}`),
    )
    const logMap = {}
    logs
      .filter((l) => l.submitted_by_id === userId)
      .forEach((l) => {
        logMap[l.activity_id] = l
      })

    const expectedIds = getExpectedActivityIds(leader.level, weekStr)

    // All activities visible to the leader's level, for the detail screen
    const monday = getMondayOfISOWeek(weekStr)
    const cycleWeek = getCycleWeekForMonday(monday)
    const normLevel = leader.level === 'bishop' ? 'overseer' : leader.level

    const allActivities = ACTIVITIES.filter((a) =>
      a.appliesTo.includes(normLevel),
    )

    const rows = allActivities.map((activity) => {
      const isExpected = expectedIds.includes(activity.id)
      const isFiled = logSet.has(`${userId}::${activity.id}`)
      const log = logMap[activity.id]

      // Determine status
      let status
      if (!isExpected) status = 'not-expected'
      else if (isFiled) status = 'filed'
      else status = 'missing'

      return { activity, status, log, isExpected }
    })

    const expected = rows.filter((r) => r.isExpected)
    const filed = expected.filter((r) => r.status === 'filed')
    const pct = expected.length
      ? Math.round((filed.length / expected.length) * 100)
      : 100

    return {
      weekStr,
      rows,
      summary: { expected: expected.length, filled: filed.length, pct },
    }
  }

  return {
    leader,
    lastWeek: buildDetail(lastWeekStr, lastLogs),
    thisWeek: buildDetail(currentWeekStr, thisLogs),
  }
}
