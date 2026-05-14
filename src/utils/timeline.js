// src/utils/timeline.js
// Builds the weekly timeline for TimelineScreen.
//
// Two entry types:
//   recurring  — generated client-side from activities.js rules (Phase 1)
//   scheduled  — from Supabase scheduled_activities table (Phase 2)
//
// Phase 1 generates both freq='weekly' and freq='cycle' activities, applying:
//   - cycleWeek matching for cycle activities
//   - weekOverrides for activities that change in specific cycle weeks
//   - streamFilter for stream-specific activities
//   - streamRotation for activities that rotate by stream each week
//   - visibility, interaction, specialEvent forwarded to timeline entries
// Phase 2: just pass scheduledEntries into buildTimeline — zero UI changes.

import {
  startOfISOWeek,
  addWeeks,
  addDays,
  format,
  getISOWeek,
  getISOWeekYear,
} from 'date-fns'
import { ACTIVITIES } from '../data/activities'

// Monday=1 … Sunday=7  (ISO day numbers)
const DAY_TO_ISO = {
  Monday: 1,
  Tuesday: 2,
  Wednesday: 3,
  Thursday: 4,
  Friday: 5,
  Saturday: 6,
  Sunday: 7,
}

// ── Cycle week calculation ────────────────────────────────────────────────
// Week 1 of this cycle starts May 12, 2026 (Tuesday).
// The ISO Monday anchor for Week 1 is May 11, 2026.

/** Monday of cycle Week 1. */
export const CYCLE_START = new Date('2026-05-11')

/**
 * Returns the cycle week number (1–6) for a given Monday Date.
 * Cycles repeat: week 7 = week 1, week 8 = week 2, etc.
 */
export function getCycleWeekForMonday(monday) {
  const msPerWeek = 7 * 24 * 60 * 60 * 1000
  const weekOffset = Math.round((monday - CYCLE_START) / msPerWeek)
  return ((weekOffset % 6) + 6) % 6 + 1 // always 1–6
}

/** Returns the current cycle week (1–6). */
export function getCurrentCycleWeek() {
  return getCycleWeekForMonday(startOfISOWeek(new Date()))
}

/**
 * Maps an arbitrary 1-based week number to a cycle week (1–6).
 * Useful for infinite-scroll timelines that go beyond week 6.
 */
export function cycleWeekForWeekNum(weekNum) {
  return ((weekNum - 1) % 6) + 1
}

/** Returns ISO week string like '2026-W20'. */
export function isoWeekStr(date) {
  const week = getISOWeek(date)
  const year = getISOWeekYear(date)
  return `${year}-W${String(week).padStart(2, '0')}`
}

/** Returns today's ISO week string. */
export function currentISOWeek() {
  return isoWeekStr(new Date())
}

/** Returns the Monday Date for a given ISO week string like '2026-W20'. */
export function getMondayOfISOWeek(weekStr) {
  const [yearStr, wStr] = weekStr.split('-W')
  const year = parseInt(yearStr, 10)
  const week = parseInt(wStr, 10)
  // Jan 4 is always in ISO week 1
  const jan4 = new Date(year, 0, 4)
  const dow = jan4.getDay() || 7 // 1=Mon..7=Sun
  const monday = new Date(jan4)
  monday.setDate(jan4.getDate() - dow + 1 + (week - 1) * 7)
  return monday
}

/**
 * Returns the 7 ISO date strings (Mon–Sun) for the given ISO week string.
 * @param {string} weekStr — e.g. '2026-W20'
 * @returns {string[]} — ['2026-05-11', '2026-05-12', ..., '2026-05-17']
 */
export function getDaysOfISOWeek(weekStr) {
  const monday = getMondayOfISOWeek(weekStr)
  return Array.from({ length: 7 }, (_, i) =>
    format(addDays(monday, i), 'yyyy-MM-dd'),
  )
}

/**
 * Human-readable label for an ISO week string.
 * '2026-W20' → 'Week of 11–17 May 2026'
 */
export function weekLabel(weekStr) {
  const monday = getMondayOfISOWeek(weekStr)
  const sunday = addDays(monday, 6)

  const dStart = format(monday, 'd')
  const monthStart = format(monday, 'MMM')
  const dEnd = format(sunday, 'd')
  const monthEnd = format(sunday, 'MMM')
  const yr = format(sunday, 'yyyy')

  if (monthStart === monthEnd) {
    return `Week of ${dStart}–${dEnd} ${monthEnd} ${yr}`
  }
  return `Week of ${dStart} ${monthStart}–${dEnd} ${monthEnd} ${yr}`
}

/**
 * Short separator label for weeks after the current one.
 * '2026-W21' → 'Week 2 · 18–24 May'  (where weekIndex is the 1-based offset)
 */
export function weekSeparatorLabel(weekStr, weekIndex) {
  const monday = getMondayOfISOWeek(weekStr)
  const sunday = addDays(monday, 6)

  const dStart = format(monday, 'd')
  const monthStart = format(monday, 'MMM')
  const dEnd = format(sunday, 'd')
  const monthEnd = format(sunday, 'MMM')

  const range =
    monthStart === monthEnd
      ? `${dStart}–${dEnd} ${monthEnd}`
      : `${dStart} ${monthStart}–${dEnd} ${monthEnd}`

  return `Week ${weekIndex} · ${range}`
}

// ── Stream + week visibility ──────────────────────────────────────────────

/**
 * Returns false if the activity (possibly with overrides applied) should be
 * hidden for this user in this cycle week due to stream filtering.
 *
 * @param {object} activity   — raw activity from ACTIVITIES (before overrides)
 * @param {object} user       — enriched user object
 * @param {number} cycleWeek  — 1–6
 */
function isVisibleToUser(activity, user, cycleWeek) {
  const userStream = user.stream?.name || null

  // streamFilter: only show to matching streams
  if (activity.streamFilter && activity.streamFilter.length > 0) {
    if (!userStream || !activity.streamFilter.includes(userStream)) return false
  }

  // streamRotation: show only on weeks where the user's stream is listed
  if (activity.streamRotation) {
    const streamsThisWeek = activity.streamRotation[cycleWeek] || []
    if (!userStream || !streamsThisWeek.includes(userStream)) return false
  }

  return true
}

// ── Generate recurring entries ────────────────────────────────────────────

/**
 * Generates recurring timeline entries for the user's level.
 * Handles both freq='weekly' and freq='cycle' activities, including:
 *   - weekOverrides applied per cycle week
 *   - streamFilter and streamRotation visibility rules
 *   - interaction, visibility, specialEvent forwarded to entries
 *
 * @param {object} user        — enriched user from getCurrentUser()
 * @param {number} weeksAhead  — how many future weeks to generate
 * @param {number} weeksBack   — how many past weeks to include
 * @returns {object[]}
 */
export function generateRecurring(user, weeksAhead = 12, weeksBack = 2) {
  const today = new Date()
  const currentMonday = startOfISOWeek(today)

  // Bishop uses the same activity list as overseer
  const levelToUse = user.level === 'bishop' ? 'overseer' : user.level

  const allActivities = ACTIVITIES.filter((a) =>
    a.appliesTo.includes(levelToUse),
  )

  const entries = []

  for (let w = -weeksBack; w < weeksAhead; w++) {
    const monday = addWeeks(currentMonday, w)
    const cycleWeek = getCycleWeekForMonday(monday)

    for (const baseActivity of allActivities) {
      // Cycle activities: only show in the matching cycle week
      // (streamRotation activities use freq:'weekly' but filtered per week below)
      if (
        baseActivity.freq === 'cycle' &&
        !baseActivity.streamRotation &&
        baseActivity.cycleWeek !== cycleWeek
      ) {
        continue
      }

      // Stream visibility (applies before overrides so base activity filters work)
      if (!isVisibleToUser(baseActivity, user, cycleWeek)) continue

      // Apply week overrides — shallow merge so overridden fields win
      const override = baseActivity.weekOverrides?.[cycleWeek] || {}
      const activity = { ...baseActivity, ...override }
      // If override explicitly provides fields (even []), use it
      if ('fields' in override) activity.fields = override.fields

      const isoDay = DAY_TO_ISO[activity.day]
      if (!isoDay) continue

      const date = addDays(monday, isoDay - 1)
      const dateStr = format(date, 'yyyy-MM-dd')
      const week = isoWeekStr(date)

      entries.push({
        id: `recurring_${baseActivity.id}_${dateStr}`,
        type: 'recurring',
        activityId: baseActivity.id,
        activityName: activity.name,
        category: activity.category,
        level: user.level,
        date: dateStr,
        day: format(date, 'EEE'),
        isoWeek: week,
        cycleWeek,
        interaction: activity.interaction || 'form',
        visibility: activity.visibility || 'lead',
        specialEvent: activity.specialEvent || false,
        fields: activity.fields || [],
        logId: null,
        done: false,
      })
    }
  }

  return entries
}

// ── Merge + sort + mark done ──────────────────────────────────────────────

/**
 * Builds the full timeline for display.
 *
 * @param {object} user               — enriched user object
 * @param {object[]} scheduledEntries — Phase 2 entries from Supabase (pass [] for now)
 * @param {Map<string,Set<string>>} loggedMap
 *   — Map<activityId, Set<dateStr>> from getLogsForTimeline()
 * @param {number} weeksAhead
 * @returns {object[]} — flat sorted array of timeline entries with `done` set
 */
export function buildTimeline(
  user,
  scheduledEntries = [],
  loggedMap = new Map(),
  weeksAhead = 12,
) {
  const recurring = generateRecurring(user, weeksAhead)
  const scheduled = scheduledEntries.filter((e) => e.level === user.level)
  const all = [...recurring, ...scheduled]
  all.sort((a, b) => a.date.localeCompare(b.date))

  return all.map((e) => ({
    ...e,
    done: (loggedMap.get(e.activityId) || new Set()).has(e.date),
  }))
}

// ── Group for rendering ───────────────────────────────────────────────────

/**
 * Groups entries by ISO week.
 * Each week object has `isoWeek` + `dayMap` (Map<dateStr, entry[]>).
 *
 * @param {object[]} entries
 * @returns {{ isoWeek: string, dayMap: Map<string, object[]> }[]}
 */
export function groupByWeekAndDay(entries) {
  const weekMap = new Map()

  for (const entry of entries) {
    if (!weekMap.has(entry.isoWeek)) {
      weekMap.set(entry.isoWeek, {
        isoWeek: entry.isoWeek,
        dayMap: new Map(),
      })
    }
    const week = weekMap.get(entry.isoWeek)
    if (!week.dayMap.has(entry.date)) week.dayMap.set(entry.date, [])
    week.dayMap.get(entry.date).push(entry)
  }

  return Array.from(weekMap.values()).sort((a, b) =>
    a.isoWeek.localeCompare(b.isoWeek),
  )
}

/**
 * Returns total and done counts for the given ISO week from a flat entry list.
 */
export function weekProgress(entries, isoWeek) {
  const inWeek = entries.filter((e) => e.isoWeek === isoWeek)
  return { total: inWeek.length, done: inWeek.filter((e) => e.done).length }
}
