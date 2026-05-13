# PVCIO Monitor — Revised App Structure (v3)
## Replaces PROJECT_CONTEXT.md app flow section entirely.
## Read alongside CALENDAR_ACTIVITIES_CONTEXT_V2.md, auth.js, logs.js, SUPABASE_CONTEXT.md

---

## What Changed

The previous design was: Home → Category picker → Activity picker → Form.

The new design is: **A weekly timeline**. When you open the app, you see this
week's activities laid out in day order (Mon → Sun). Each activity is a row.
You tap it, complete it (form or quick tap depending on activity), and it gets
checked off. The following week shows the next week's activities.

Think of it like a to-do list for the week, but each item has a form behind it.
Simple enough for a non-tech-savvy leader to use without any explanation.

---

## Core Dependency — The Fixed Calendar

Some activities (the once-per-cycle ones) will eventually be assigned specific
dates by bishops/overseers via an approved calendar. That calendar is NOT yet
available.

**Build strategy:**
- Phase 1 (now): Build the full timeline UI using only recurring weekly activities.
  These never change week to week, so no calendar dependency.
- Phase 2 (when calendar arrives): Plug in the one-off/cycle activities as dated
  entries on top of the recurring ones. The UI is already built — just add data.

The data layer must be designed to accept both:
  - `recurring` entries (generated from rules, same every week)
  - `scheduled` entries (specific date + activity from the approved calendar)

---

## Church Hierarchy (4 levels)

```
Bishop
  └── Overseer / Council
        └── Governorship
              └── Bacenta
```

Level strings: `'bacenta'` | `'governorship'` | `'overseer'` | `'bishop'`
Most Bishops are also Overseers — they carry both roles.

---

## App Flow (new)

```
[Login Screen]
      │
      ▼
[Timeline Screen]  ← MAIN SCREEN, replaces old Home
  ┌──────────────────────────────────────────┐
  │  David Dag · God Chasers · Haatso Mabey  │
  │  Week of 11–17 May 2026                  │
  │                                          │
  │  MON 11 May ──────────────────           │
  │  (no activities)                         │
  │                                          │
  │  TUE 12 May ──────────────────           │
  │  ○ Telepastoring                         │
  │                                          │
  │  WED 13 May ──────────────────           │
  │  ✓ Gov Prayer Meeting    [done]          │
  │                                          │
  │  THU 14 May ──────────────────           │
  │  ○ Bacenta Morning Prayer                │
  │                                          │
  │  FRI 15 May ──────────────────           │
  │  (no activities)                         │
  │                                          │
  │  SAT 16 May ──────────────────           │
  │  ○ [Calendar slot — TBC]                 │
  │                                          │
  │  SUN 17 May ──────────────────           │
  │  ○ Post-Church Counseling                │
  │                                          │
  │  ── NEXT WEEK ─────────────────          │
  │  TUE 19 May                              │
  │  ○ Telepastoring                         │
  │  ...                                     │
  └──────────────────────────────────────────┘
```

The screen is an **infinite scroll** — current week at the top, future weeks
below. Past weeks scroll up (accessible but visually de-emphasised).

---

## Screens

```
LoginScreen       — email + password, demo buttons for dev
TimelineScreen    — the main infinite scroll timeline (replaces HomeScreen)
ActivityFormScreen — shown when leader taps an activity that needs a form
```

That's it. 3 screens. No category picker. No activity picker.
ActivityPickerScreen and CategoryGrid from the old design are removed.

---

## TimelineScreen — detailed behaviour

### Week grouping
- Activities grouped by ISO week (Mon–Sun)
- Current week shown first, pinned near top
- Days with no activities show a faint day header but no activity rows
- Past activities (before today) shown with muted styling + lock icon if not logged

### Activity row states
| State | Visual |
|---|---|
| Upcoming (future) | Empty circle ○, normal text |
| Today | Empty circle ○, slightly highlighted row |
| Done | Filled circle ✓, muted text, green tick |
| Missed (past, not done) | Empty circle ○, red tint, "not logged" label |
| Calendar slot TBC | Dashed border row, grey text "Scheduled activity — date TBC" |

### Tapping an activity row
- **Quick-tap activities** (see list below): tap the row → immediate confirmation
  toast → row flips to ✓ Done. No form shown.
- **Form activities**: tap the row → ActivityFormScreen slides up as a bottom
  sheet or full screen. On submit → back to timeline, row flips to ✓ Done.

### Quick-tap vs form (by activity)
| Activity | Type |
|---|---|
| Telepastoring | Form (count + note) |
| Bacenta Morning Prayer | Form (attendance + photo) |
| Governorship Prayer Meeting | Form (attendance + note) |
| Post-Church Counseling | Form (count — flagged if below minimum) |
| Sunday Morning Prayer Lead | Form (attendance + note) |
| Gov Prayer Mtg at the Centre | Form (attendance + note) |
| Bacenta Half-Night Prayer | Form (attendance + photo) |
| Oversight Prayer Meeting | Form (attendance + note) |
| Retreat in Mampong | Form (duration + attendance + note + photo) |
| Bacenta Leaders' Visitation Sat | Form (count + names + concerns) |
| Governors' Visitation Sat | Form (count + names + concerns) |
| Overseers Visitation | Form (names + counts + concerns) |
| Mid-Week Check-In | Form (count + note) |
| Extended Counseling Sessions | Form (count + issue type + note) |
| Oversight SATs | Form (attendance + note + photo) |
| Inter-Bacenta Service | Form (attendance + bacentas joined + photo) |
| Gov Joint Service | Form (attendance + photo) |
| Council Joint Service | Form (attendance + photo) |
| Inter-Overseer Service | Form (attendance + photo) |
| Bacenta Level Outreach | Form (outreach type + attendance + salvations + photo) |
| Governorship Level Outreach | Form (outreach type + attendance + salvations + photo) |
| Oversight Level Outreach | Form (outreach type + attendance + salvations + photo) |

### Infinite scroll implementation
- Generate activity items for 12 weeks ahead on load
- Add more weeks as user scrolls toward the bottom (virtual list)
- On app open, auto-scroll to current week (today's date)

---

## Recurring Activities Per Level (Phase 1 — no calendar needed)

These are generated programmatically from rules. They repeat every week.

### BACENTA
| Day | Activity | Interaction |
|---|---|---|
| Tue | Telepastoring | Form |
| Thu | Bacenta Morning Prayer | Form |

### GOVERNORSHIP
| Day | Activity | Interaction |
|---|---|---|
| Tue | Telepastoring | Form |
| Wed | Governorship Prayer Meeting | Form |
| Sun | Post-Church Counseling (≥3) | Form |

### OVERSEER
| Day | Activity | Interaction |
|---|---|---|
| Tue | Telepastoring | Form |
| Sun | Sunday Morning Prayer Lead | Form |
| Sun | Post-Church Counseling (≥3) | Form |

### BISHOP
| Day | Activity | Interaction |
|---|---|---|
| Tue | Telepastoring | Form |
| Sun | Post-Church Counseling (≥5) | Form |

---

## Calendar Slot Placeholders (Phase 2 — when approved calendar arrives)

These activities have no fixed recurrence rule. They get specific dates
assigned by the bishop/overseer via the approved calendar.

When the calendar arrives, each of these becomes a `scheduled` entry in the
database with a specific date. Until then, show placeholder rows in the
timeline so the UI is ready.

### Bacenta placeholders
- Bacenta Half-Night Prayer (Cycle Wk 1 Fri)
- Bacenta Leaders' Visitation Saturday (Cycle Wk 2 Sat)
- Inter-Bacenta Service (Cycle Wk 5 Thu)
- Bacenta Level Outreach — choose type (Cycle Wk 6 Sat)

### Governorship placeholders
- Gov Prayer Mtg at the Centre (Cycle Wk 1 Wed — replaces standard)
- Governors' Visitation Saturday (Cycle Wk 3 Sat)
- Mid-Week Check-In (Cycle Wk 4 Wed)
- Extended Counseling Sessions (Cycle Wk 4 Sat)
- Governorship Joint Service (Cycle Wk 5 Sat)
- Governorship Level Outreach — choose type (Cycle Wk 6 Sat)

### Overseer placeholders
- Oversight Prayer Meeting (Cycle Wk 1 Thu)
- Retreat in Mampong (Cycle Wk 1 Fri)
- Overseers Visitation Week 2 (Cycle Wk 2 Sat)
- Overseers Visitation Week 3 (Cycle Wk 3 Sat)
- Mid-Week Check-In (Cycle Wk 4 Wed)
- Extended Counseling Sessions (Cycle Wk 4 Sat)
- Oversight SATs (Cycle Wk 5 Tue — as scheduled)
- Council Joint Service with Overseer (Cycle Wk 5 Sat)
- Inter-Overseer Service (Cycle Wk 5 Sun)
- Oversight Level Outreach — choose type (Cycle Wk 6 Sat)

---

## Data Model — Timeline Entries

Two types of entries feed the timeline:

### 1. Recurring (generated client-side from rules)
```js
// Generated in src/utils/timeline.js
// No database call needed — computed from user's level + current date
{
  id: `recurring_${activityId}_${isoDate}`,  // e.g. 'recurring_b-rec2_2026-05-14'
  type: 'recurring',
  activityId: 'b-rec2',
  activityName: 'Bacenta Morning Prayer',
  category: 'prayer',
  level: 'bacenta',
  date: '2026-05-14',          // ISO date string
  day: 'Thu',
  isoWeek: '2026-W20',
  interaction: 'form',         // 'form' | 'quick'
  fields: [...],               // from ACTIVITIES in activities.js
  logId: null,                 // filled in if already logged
}
```

### 2. Scheduled (from Supabase — added when calendar arrives)
```js
// Fetched from scheduled_activities table in Supabase
{
  id: 'uuid',
  type: 'scheduled',
  activityId: 'g-cy7',
  activityName: 'Governorship Joint Service',
  category: 'teaching',
  level: 'governorship',
  date: '2026-06-13',          // specific date assigned by overseer
  day: 'Sat',
  isoWeek: '2026-W24',
  assignedTo: {
    unitId: 'a9eda2d9',
    unitName: 'Haatso Mabey',
  },
  interaction: 'form',
  fields: [...],
  logId: null,
}
```

### Merging for display
```js
// src/utils/timeline.js
export function buildTimeline(user, scheduledEntries, loggedIds, weeksAhead = 12) {
  const recurring  = generateRecurring(user, weeksAhead)
  const scheduled  = scheduledEntries.filter(e => e.level === user.level)
  const all        = [...recurring, ...scheduled]
  all.sort((a, b) => a.date.localeCompare(b.date))
  // Mark logged items
  return all.map(e => ({ ...e, done: loggedIds.includes(e.id) }))
}
```

---

## Supabase — New Table: scheduled_activities

Add this table for Phase 2 calendar entries:

```sql
create table public.scheduled_activities (
  id            uuid primary key default gen_random_uuid(),
  activity_id   text not null,
  activity_name text not null,
  category      text not null,
  level         text not null,
  date          date not null,
  assigned_to_unit_id   text,
  assigned_to_unit_name text,
  council_name  text,
  stream_name   text,
  interaction   text not null default 'form',
  fields        jsonb not null default '[]',
  created_by    uuid references public.profiles(id),
  created_at    timestamptz default now()
);

-- Index for fast timeline queries
create index sched_act_level_date_idx
  on public.scheduled_activities (level, date);

create index sched_act_unit_idx
  on public.scheduled_activities (assigned_to_unit_id, date);
```

---

## File Structure (updated)

```
src/
  data/
    activities.js       # Activity definitions + field schemas (unchanged)
    leaders.js          # Church structure (unchanged)
  utils/
    auth.js             # JWT decode, role→level (unchanged)
    logs.js             # CRUD for log entries (unchanged)
    timeline.js         # NEW — builds the merged timeline for display
  screens/
    LoginScreen.jsx     # Unchanged
    TimelineScreen.jsx  # NEW — replaces HomeScreen, ActivityPickerScreen
    ActivityFormScreen.jsx  # Replaces LogFormScreen — now a bottom sheet
  components/
    TopBar.jsx
    WeekHeader.jsx      # NEW — week label + progress indicator
    DaySection.jsx      # NEW — day header + list of activity rows
    ActivityRow.jsx     # NEW — single activity row (state-aware)
    ActivityForm.jsx    # Renamed from LogFormScreen, now a sheet
    fields/             # Unchanged — AttendanceField, NamesField, etc.
  App.jsx
  main.jsx
```

Deleted from old structure:
- `HomeScreen.jsx` → replaced by `TimelineScreen.jsx`
- `ActivityPickerScreen.jsx` → removed entirely
- `CategoryGrid.jsx` → removed entirely
- `RecentFeed.jsx` → removed (feed is now the timeline itself)

---

## ActivityRow component spec

```jsx
// Props:
// entry    — timeline entry object (see data model above)
// onTap    — called when row is tapped
// user     — current user

// Visual states:
// done     — green circle ✓, muted text
// today    — subtle highlight on the row
// missed   — red left border, "not logged" chip
// upcoming — normal
// tbc      — dashed border, grey text, no tap action yet

<ActivityRow
  entry={entry}
  onTap={() => entry.interaction === 'form'
    ? navigate(`/log/${entry.activityId}?date=${entry.date}`)
    : handleQuickLog(entry)
  }
/>
```

---

## Backdating (edge case — unchanged from previous context)

Date field on the form defaults to the activity's scheduled date.
Leader can change it to any date up to 4 weeks in the past.
Store both `activityDate` (what they pick) and `submittedAt` (submit timestamp).

---

## Weekly Summary Prompt (unchanged)

Trigger on Monday if previous week has unlogged recurring activities.
Show count of done vs missed. Free-text "how did your week go?".
Stored as `type: 'weekly_summary'` log entry.

---

## Copilot — Build Order

1. `src/utils/timeline.js` — the core logic. Build and test this first.
   - `generateRecurring(user, weeksAhead)` — returns recurring entries
   - `buildTimeline(user, scheduledEntries, loggedIds, weeksAhead)` — merged + sorted
   - `groupByWeekAndDay(entries)` — groups for rendering

2. `ActivityRow.jsx` — single row component with all visual states.

3. `TimelineScreen.jsx` — infinite scroll, renders WeekHeader + DaySection + ActivityRow.
   Start with just recurring entries (empty scheduledEntries array).

4. `ActivityFormScreen.jsx` — bottom sheet with dynamic fields from activity definition.

5. Wire login → timeline navigation.

6. Wire form submission → log saved → row flips to done.

7. Phase 2 (later): fetch `scheduled_activities` from Supabase and pass into
   `buildTimeline`. The UI needs zero changes — just data flowing in.

---

## Design — what stays the same

- Dark theme, same colour tokens
- Syne headings, Instrument Sans body, DM Mono labels
- Mobile-first
- Accent #4F7FFF, level badge colours unchanged
- Form fields (AttendanceField, NamesField etc.) unchanged
