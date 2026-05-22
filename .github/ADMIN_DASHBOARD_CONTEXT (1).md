# PVCIO Monitor — Admin Compliance Dashboard
## Context file for GitHub Copilot
## Read alongside: PROJECT_CONTEXT.md, APP_STRUCTURE_V3.md,
##                 OFFICIAL_CALENDAR_CONTEXT.md, SUPABASE_CONTEXT.md, auth.js

---

## What This Is

A compliance dashboard built into the existing PVCIO app as a protected
route. Admins log in with a static shared password, select a stream, and
drill down through 4 levels (Stream → Council → Governorship → Bacenta)
to see who has and hasn't filled their activity forms for the current and
previous week.

The compliance check cross-references:
- **Neo4j** — who *should* have filled (the real leader list)
- **Supabase** — who *actually* filled (the activity logs)

---

## Route Structure

Add these routes to App.jsx alongside the existing leader routes:

```
/admin                → AdminLoginScreen
/admin/dashboard      → AdminDashboardScreen  (stream selector)
/admin/stream/:id     → StreamOverviewScreen
/admin/council/:id    → CouncilScreen
/admin/gov/:id        → GovernorshipScreen
/admin/bacenta/:id    → BacentaScreen
/admin/leader/:id     → LeaderDetailScreen
```

All `/admin/*` routes check for admin session before rendering.
If not authenticated as admin, redirect to `/admin`.

---

## Admin Authentication

Static shared password — no JWT, no external auth service.

```js
// src/utils/adminAuth.js

const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD  // set in .env

export function adminLogin(password) {
  if (password !== ADMIN_PASSWORD) throw new Error('Incorrect password')
  sessionStorage.setItem('adminAuth', 'true')
}

export function isAdminAuthed() {
  return sessionStorage.getItem('adminAuth') === 'true'
}

export function adminLogout() {
  sessionStorage.removeItem('adminAuth')
}
```

Use `sessionStorage` (not localStorage) so the session ends when the
browser tab is closed.

Add to .env:
```
VITE_ADMIN_PASSWORD=your-chosen-password-here
```

**AdminLoginScreen** — simple: password field + "Enter Dashboard" button.
On success → navigate to `/admin/dashboard`.
No username. No roles. Just the password.

After login, show a stream selector. One card per stream pulled from Neo4j.
Tapping a stream → `/admin/stream/:streamId`.

---

## The Compliance Logic

### Step 1 — Get expected leaders from Neo4j

For a given scope (stream / council / gov / bacenta), query Neo4j for all
leaders and their level. This gives you the "should have filled" list.

```js
// src/utils/compliance.js

// TODO: replace with real Neo4j queries when provided
// Query shape expected back from Neo4j per leader:
// {
//   userId: "uuid",
//   fullName: "Ama Boateng",
//   level: "bacenta",           // 'bacenta' | 'governorship' | 'overseer' | 'bishop'
//   streamName: "Colossians",
//   councilName: "Colossians 1",
//   governorshipName: "Haatso Mabey",
//   bacentaName: "God Chasers",  // null if not bacenta level
// }

export async function fetchLeadersForStream(streamId) {
  // TODO: Neo4j query — get all leaders in a stream
  // Returns array of leader objects (shape above)
}

export async function fetchLeadersForCouncil(councilId) {
  // TODO: Neo4j query — get all leaders in a council
}

export async function fetchLeadersForGovernorship(govId) {
  // TODO: Neo4j query — leaders in a governorship
}

export async function fetchLeadersForBacenta(bacentaId) {
  // TODO: Neo4j query — leader(s) of a bacenta
}
```

### Step 2 — Get expected activities for the week

Use the cycle week to determine which activities were expected.
Recurring activities are expected every week.
Cycle-specific activities only expected if the cycle week matches.

```js
// src/utils/compliance.js (continued)

import { cycleWeekForWeekNum, getISOWeekNumber } from './timeline'
import { ACTIVITIES } from '../data/activities'

// Returns array of activityIds expected for a given level in a given ISO week
export function getExpectedActivities(level, isoWeek) {
  const weekNum    = isoWeekToWeekNum(isoWeek)   // convert ISO week to cycle week
  const cycleWeek  = cycleWeekForWeekNum(weekNum)

  return ACTIVITIES.filter(activity => {
    // Must apply to this level
    const appliesToLevel = activity.appliesTo.includes(level) ||
      (level === 'bishop' && activity.appliesTo.includes('overseer'))

    if (!appliesToLevel) return false

    // Monitor-only activities don't require a log from this leader
    if (activity.monitorOnly) return false

    // Recurring — always expected
    if (activity.freq === 'weekly') return true

    // Cycle-specific — only expected if cycle week matches
    if (activity.freq === 'cycle') return activity.cycleWeek === cycleWeek

    return false
  }).map(a => a.id)
}
```

### Step 3 — Get actual logs from Supabase

```js
// src/utils/compliance.js (continued)

import { supabase } from './supabase'

// Returns set of { userId, activityId } pairs logged in a given ISO week
export async function fetchLogsForWeek(isoWeek, streamName) {
  const { data, error } = await supabase
    .from('activity_logs')
    .select('submitted_by_id, activity_id, submitted_by_name, submitted_at')
    .eq('iso_week', isoWeek)
    .eq('stream_name', streamName)
    .eq('type', 'activity')

  if (error) throw error
  return data
}
```

### Step 4 — Cross-reference to get compliance

```js
// src/utils/compliance.js (continued)

export function computeCompliance(leaders, expectedActivitiesMap, logs) {
  // expectedActivitiesMap: { [userId]: string[] }  — activityIds expected per leader
  // logs: array of { submitted_by_id, activity_id }

  const logSet = new Set(logs.map(l => `${l.submitted_by_id}::${l.activity_id}`))

  return leaders.map(leader => {
    const expected = expectedActivitiesMap[leader.userId] ||
                     getExpectedActivities(leader.level, currentIsoWeek)

    const filled   = expected.filter(actId =>
      logSet.has(`${leader.userId}::${actId}`)
    )
    const missing  = expected.filter(actId =>
      !logSet.has(`${leader.userId}::${actId}`)
    )

    return {
      ...leader,
      expected: expected.length,
      filled:   filled.length,
      missing:  missing.length,
      filledIds: filled,
      missingIds: missing,
      pct: expected.length ? Math.round(filled.length / expected.length * 100) : 100,
      compliant: missing.length === 0,
    }
  })
}

// Roll up compliance to a parent level (stream, council, gov)
export function rollUp(complianceRows) {
  const total    = complianceRows.reduce((s, r) => s + r.expected, 0)
  const filled   = complianceRows.reduce((s, r) => s + r.filled,   0)
  const missing  = total - filled
  const pct      = total ? Math.round(filled / total * 100) : 100
  return { total, filled, missing, pct }
}
```

---

## Dashboard Screens

### AdminDashboardScreen — Stream selector

```
┌─────────────────────────────────────────┐
│  PVCIO Admin · First Love Church        │
│  Week of 18–24 May (last) + current     │
│                                         │
│  Select a stream to review:             │
│                                         │
│  ┌─────────────────┐ ┌───────────────┐  │
│  │ Colossians      │ │ Ephesians     │  │
│  │ 47/112 · 42%   │ │ 31/80 · 39%  │  │
│  │ ████░░░░░░      │ │ ███░░░░░░░   │  │
│  └─────────────────┘ └───────────────┘  │
│  ┌─────────────────┐ ┌───────────────┐  │
│  │ Galatians       │ │ Philippians   │  │
│  │ ...             │ │ ...           │  │
│  └─────────────────┘ └───────────────┘  │
└─────────────────────────────────────────┘
```

Shows rolled-up compliance across all leaders in each stream.
Two numbers shown: last week (completed) + this week (in progress, lighter).

---

### StreamOverviewScreen — Council drill-down

```
┌─────────────────────────────────────────┐
│  ← Colossians Stream                    │
│  Week 18–24 May · 47/112 filled · 42%  │
│  ████████░░░░░░░░░░░░                   │
│                                         │
│  By Council                             │
│  ┌───────────────────────────────────┐  │
│  │ Colossians 1   18/38   ██████░░░  │  │
│  │ Isaac Agyeman          47%      › │  │
│  ├───────────────────────────────────┤  │
│  │ Colossians 2   14/40   ████░░░░░  │  │
│  │ Edwin Ogoe             35%      › │  │
│  ├───────────────────────────────────┤  │
│  │ Colossians 3   15/34   █████░░░░  │  │
│  │ Nathan Kudowor         44%      › │  │
│  └───────────────────────────────────┘  │
│                                         │
│  This week (in progress)                │
│  ┌───────────────────────────────────┐  │
│  │ Colossians 1   8/38    ██░░░░░░░  │  │
│  │                        21%      › │  │
│  └─── ...                             │  │
└─────────────────────────────────────────┘
```

---

### CouncilScreen — Governorship drill-down

Same layout as Stream, but listing governorships under the council.
Each row: governorship name, governor name, filled/expected, %, arrow.

---

### GovernorshipScreen — Leader detail

```
┌─────────────────────────────────────────┐
│  ← Haatso Mabey Governorship            │
│  Week 18–24 May · 4/8 filled · 50%     │
│                                         │
│  Governor                               │
│  Malcolm Otchere    3/4  ██████░░  75% │
│                                         │
│  Bacentas                               │
│  ┌───────────────────────────────────┐  │
│  │ God Chasers                       │  │
│  │ David Dag          2/2  ████████  │  │
│  │                    ✓ Compliant  › │  │
│  ├───────────────────────────────────┤  │
│  │ Fruitful Haatso                   │  │
│  │ Leader Name        0/2  ░░░░░░░░  │  │
│  │                    ✗ Nothing filed›│  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

---

### LeaderDetailScreen — Activity breakdown

```
┌─────────────────────────────────────────┐
│  ← David Dag Vanderpuije                │
│  God Chasers · Bacenta Leader           │
│                                         │
│  Week 18–24 May                         │
│  ┌───────────────────────────────────┐  │
│  │ ✓ Telepastoring                   │  │
│  │   Logged Tue 19 May · 8:42am      │  │
│  │   Called 6 members                │  │
│  ├───────────────────────────────────┤  │
│  │ ✗ Bacenta Morning Prayer          │  │
│  │   Expected Thu 21 May · Not filed │  │
│  ├───────────────────────────────────┤  │
│  │ — Council All Night               │  │
│  │   Not expected this cycle week    │  │
│  └───────────────────────────────────┘  │
│                                         │
│  This week (in progress)                │
│  ┌───────────────────────────────────┐  │
│  │ ○ Telepastoring · Due Tue 26 May  │  │
│  │ ○ Bacenta Morning Prayer · Thu    │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

---

## Week display — both weeks shown

Always show two sections:

1. **Last completed week** (previous Mon–Sun ISO week) — shows final compliance,
   marked as complete. Numbers are fixed.

2. **This week in progress** (current Mon–Sun ISO week) — shows live compliance
   as leaders fill forms. Numbers update on refresh. Label: "In progress".

```js
// src/utils/compliance.js

import { format, startOfISOWeek, subWeeks } from 'date-fns'

export function getISOWeekString(date) {
  // Returns e.g. '2026-W20'
  const weekStart = startOfISOWeek(date)
  const year      = weekStart.getFullYear()
  const week      = getISOWeekNumber(weekStart)
  return `${year}-W${String(week).padStart(2, '0')}`
}

export function getLastWeekString() {
  return getISOWeekString(subWeeks(new Date(), 1))
}

export function getCurrentWeekString() {
  return getISOWeekString(new Date())
}
```

---

## Compliance status labels and colours

| pct | Label | Colour |
|---|---|---|
| 100% | Compliant | Green #34D399 |
| 75–99% | Mostly done | Amber #FBBF24 |
| 50–74% | Partially done | Orange #F97316 |
| 1–49% | Behind | Red #F87060 |
| 0% | Nothing filed | Deep red #DC2626 |

---

## New Supabase columns needed

The compliance query filters by `iso_week` and `stream_name`.
Both already exist in the schema from SUPABASE_CONTEXT.md.

Confirm these columns exist on `activity_logs`:
- `iso_week`    text  — e.g. '2026-W20'  (added in SUPABASE_CONTEXT.md)
- `stream_name` text  — e.g. 'Colossians' (already in schema)
- `type`        text  — 'activity' | 'weekly_summary'

No new columns needed.

---

## File structure — new files

```
src/
  utils/
    adminAuth.js        # Static password session management
    compliance.js       # Neo4j fetch stubs + cross-reference logic
  screens/
    admin/
      AdminLoginScreen.jsx
      AdminDashboardScreen.jsx    # Stream selector
      StreamOverviewScreen.jsx
      CouncilScreen.jsx
      GovernorshipScreen.jsx
      BacentaScreen.jsx           # Optional — or merge into Gov screen
      LeaderDetailScreen.jsx
  components/
    admin/
      ComplianceBar.jsx    # Reusable progress bar with pct + label
      DrillDownRow.jsx     # Reusable row: name + bar + pct + arrow
      WeekToggle.jsx       # Switch between last week / this week
      ActivityStatusRow.jsx # ✓ / ✗ / — row for leader detail
```

---

## Build order for Copilot

1. `src/utils/adminAuth.js` — session management, 10 lines
2. `AdminLoginScreen.jsx` — password form, redirect on success
3. `src/utils/compliance.js` — stubs + cross-reference logic (no Neo4j yet,
   use mock leader data from leaders.js)
4. `ComplianceBar.jsx` + `DrillDownRow.jsx` — shared UI components
5. `AdminDashboardScreen.jsx` — stream cards using mock data
6. `StreamOverviewScreen.jsx` → `CouncilScreen.jsx` → `GovernorshipScreen.jsx`
   — drill-down chain, all using mock data and rollUp()
7. `LeaderDetailScreen.jsx` — activity breakdown for one leader
8. Wire Neo4j fetch functions when queries are provided (swap mocks in
   compliance.js — UI needs zero changes)

---

## Key design decisions

**Why sessionStorage for admin auth?**
Closes automatically when the browser tab closes. No persistent tokens
sitting around. Simple and appropriate for a static password.

**Why not use the JWT auth for admins?**
No role assignment exists in the app yet. Static password is the fastest
path to a working dashboard without needing backend changes.

**Why Neo4j for the expected leader list?**
Neo4j already has the authoritative leadership structure. Duplicating it
in Supabase would create a sync problem. Query Neo4j for who should file,
query Supabase for who did file — cross-reference in the app.

**Why show both weeks?**
Last week tells you what actually happened (accountability).
This week tells you where things stand right now (intervention opportunity).
Admins need both to be useful.
