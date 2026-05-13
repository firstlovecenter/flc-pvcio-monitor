# PVCIO Monitor — Calendar Activities Context (CORRECTED)
## Replaces CALENDAR_ACTIVITIES_CONTEXT.md
## Read alongside PROJECT_CONTEXT.md and SUPABASE_CONTEXT.md

---

## Church Hierarchy (4 levels)

```
Bishop
  └── Overseer / Council  (same thing)
        └── Governorship
              └── Bacenta  (smallest unit)
```

### Role → Level mapping
| JWT Role | Level string |
|---|---|
| `leaderBacenta` | `'bacenta'` |
| `leaderGovernorship` | `'governorship'` |
| `leaderOversight` or `leaderCouncil` | `'overseer'` |
| `adminStream` or stream-level roles | `'bishop'` |

**Important:** Most Bishops are also Overseers. They carry both roles.
The app shows each level's own specific activities only — activities they are
personally responsible for logging, not activities they oversee at lower levels.

---

## Activity Visibility Rule

Each activity has an `appliesTo` array. Only show an activity to a user if
`activity.appliesTo.includes(user.level)`.

**"At bacenta level"** activities are flagged with `monitorOnly: true` for
Governors. This means:
- Governors do NOT log these themselves
- They are shown in the Governor's view as reference/reminder items
- Only the Bacenta leader logs them
- In future, Governor's dashboard can show whether their bacentas completed them

---

## The 6-Week Cycle

Weeks run Monday–Sunday (ISO week standard).
The app does NOT auto-calculate cycle week. Leaders reference the printed
calendar themselves. The app uses ISO week numbers for grouping logs.

| Cycle Week | Theme | Date range (first cycle) |
|---|---|---|
| Week 1 | Prayer | 11–17 May 2026 |
| Week 2 | Visitation | 18–24 May 2026 |
| Week 3 | Visitation | 25–31 May 2026 |
| Week 4 | Counseling/Interaction | 1–7 Jun 2026 |
| Week 5 | Teaching | 8–14 Jun 2026 |
| Week 6 | Outreaches + Review | 15–21 Jun 2026 |

---

## Activities Per Level (source of truth)

### BACENTA

| # | Freq | Day | Activity |
|---|---|---|---|
| 1 | Weekly | Tue | Telepastoring (≥5 members called) |
| 2 | Weekly | Thu | Bacenta Morning Prayer |
| 3 | Cycle Wk 1 | Fri | Bacenta Half-Night Prayer |
| 4 | Cycle Wk 2 | Sat | Bacenta Leaders' Visitation Saturday |
| 5 | Cycle Wk 5 | Thu | Inter-Bacenta Service |
| 6 | Cycle Wk 6 | Sat | Bacenta Level Outreach (choose one) |

---

### GOVERNORSHIP

| # | Freq | Day | Activity | Note |
|---|---|---|---|---|
| 1 | Weekly | Tue | Telepastoring (≥5 members called) | |
| 2 | Weekly | Wed | Governorship Prayer Meeting | |
| 3 | Weekly | Thu | Bacenta Morning Prayer | monitor only — Bacenta logs it |
| 4 | Weekly | Sun | Post-Church Counseling (≥3 members) | |
| 5 | Cycle Wk 1 | Fri | Bacenta Half-Night Prayer | monitor only — Bacenta logs it |
| 6 | Cycle Wk 1 | Wed | Governorship Prayer Meeting — At the Centre | replaces standard Wed meeting |
| 7 | Cycle Wk 3 | Sat | Governors' Visitation Saturday | |
| 8 | Cycle Wk 4 | Wed | Mid-Week Check-In | |
| 9 | Cycle Wk 4 | Sat | Extended Counseling Sessions | |
| 10 | Cycle Wk 5 | Thu | Inter-Bacenta Service | monitor only — Bacenta logs it |
| 11 | Cycle Wk 5 | Sat | Governorship Joint Service | |
| 12 | Cycle Wk 6 | Sat | Governorship Level Outreach (choose one) | |

---

### OVERSEER

| # | Freq | Day | Activity |
|---|---|---|---|
| 1 | Weekly | Tue | Telepastoring (≥5 members called) |
| 2 | Weekly | Sun | Sunday Morning Prayer (lead all churches) |
| 3 | Weekly | Sun | Post-Church Counseling (≥3 Governors/Bacenta leaders) |
| 4 | Cycle Wk 1 | Thu | Oversight Prayer Meeting |
| 5 | Cycle Wk 1 | Fri | Retreat in Mampong (≥7 hrs) |
| 6 | Cycle Wk 2 | Sat | Overseers Visitation (Week 2 — starts) |
| 7 | Cycle Wk 3 | Sat | Overseers Visitation (Week 3 — continues) |
| 8 | Cycle Wk 4 | Wed | Mid-Week Check-In |
| 9 | Cycle Wk 4 | Sat | Extended Counseling Sessions |
| 10 | Cycle Wk 5 | Tue | Oversight SATs |
| 11 | Cycle Wk 5 | Sat | Council Joint Service with Overseer |
| 12 | Cycle Wk 5 | Sun | Inter-Overseer Service |
| 13 | Cycle Wk 6 | Sat | Oversight Level Outreach (choose one) |

---

### BISHOP

Bishop activities are only those unique to the Bishop role.
Bishops also carry Overseer activities via their dual role — those are logged
under their Overseer hat, not duplicated here.

| # | Freq | Day | Activity |
|---|---|---|---|
| 1 | Weekly | Tue | Telepastoring (≥5 members called) |
| 2 | Weekly | Sun | Post-Church Counseling (≥5 Governors/Bacenta leaders) |

---

## Full Activity Definitions (for activities.js)

```js
export const ACTIVITIES = [

  // ─────────────────────────────────────────────
  // BACENTA
  // ─────────────────────────────────────────────

  {
    id: 'b-rec1',
    category: 'counseling',
    freq: 'weekly',
    day: 'Tuesday',
    name: 'Telepastoring',
    desc: 'Call ≥5 members',
    appliesTo: ['bacenta'],
    fields: [
      { id: 'count', type: 'attendance', label: 'How many members did you call?',
        required: true, flagBelow: 5 },
      { id: 'note',  type: 'note',       label: 'Notes (optional)', required: false },
    ],
  },
  {
    id: 'b-rec2',
    category: 'prayer',
    freq: 'weekly',
    day: 'Thursday',
    name: 'Bacenta Morning Prayer',
    desc: 'All members',
    appliesTo: ['bacenta'],
    fields: [
      { id: 'attendance', type: 'attendance', label: 'How many attended?', required: true },
      { id: 'note',       type: 'note',       label: 'Notes (optional)',   required: false },
      { id: 'photo',      type: 'photo',      label: 'Photo (optional)',   required: false },
    ],
  },
  {
    id: 'b-cy1',
    category: 'prayer',
    freq: 'cycle',
    cycleWeek: 1,
    day: 'Friday',
    name: 'Bacenta Half-Night Prayer',
    desc: 'In the community (once in 6 weeks)',
    appliesTo: ['bacenta'],
    fields: [
      { id: 'attendance', type: 'attendance', label: 'How many attended?', required: true },
      { id: 'note',       type: 'note',       label: 'Notes (optional)',   required: false },
      { id: 'photo',      type: 'photo',      label: 'Photo (optional)',   required: false },
    ],
  },
  {
    id: 'b-cy2',
    category: 'visitation',
    freq: 'cycle',
    cycleWeek: 2,
    day: 'Saturday',
    name: "Bacenta Leaders' Visitation Saturday",
    desc: 'Once in 6 weeks',
    appliesTo: ['bacenta'],
    fields: [
      { id: 'visitedCount', type: 'attendance', label: 'How many members visited?',      required: true },
      { id: 'visitedNames', type: 'names',      label: 'Names visited (one per line)',    required: false },
      { id: 'concerns',     type: 'note',       label: 'Concerns or follow-ups?',         required: false },
      { id: 'photo',        type: 'photo',      label: 'Photo (optional)',                required: false },
    ],
  },
  {
    id: 'b-cy3',
    category: 'teaching',
    freq: 'cycle',
    cycleWeek: 5,
    day: 'Thursday',
    name: 'Inter-Bacenta Service',
    desc: 'Once in 6 weeks',
    appliesTo: ['bacenta'],
    fields: [
      { id: 'attendance',     type: 'attendance', label: 'How many attended?',       required: true },
      { id: 'bacentasJoined', type: 'names',      label: 'Which bacentas joined?',   required: false },
      { id: 'note',           type: 'note',       label: 'Notes (optional)',          required: false },
      { id: 'photo',          type: 'photo',      label: 'Photo (optional)',          required: false },
    ],
  },
  {
    id: 'b-cy4',
    category: 'outreaches',
    freq: 'cycle',
    cycleWeek: 6,
    day: 'Saturday',
    name: 'Bacenta Level Outreach',
    desc: 'Choose one: dance outreach / breakfast meeting / movie or games night',
    appliesTo: ['bacenta'],
    fields: [
      { id: 'outreachType', type: 'select', label: 'Which outreach?',
        options: ['Dance Outreach', 'Breakfast Meeting', 'Movie Night', 'Games Night'],
        required: true },
      { id: 'attendance', type: 'attendance', label: 'How many attended?',         required: true },
      { id: 'salvations', type: 'attendance', label: 'Salvations / first-timers?', required: false },
      { id: 'note',       type: 'note',       label: 'Notes (optional)',           required: false },
      { id: 'photo',      type: 'photo',      label: 'Photo (optional)',           required: false },
    ],
  },

  // ─────────────────────────────────────────────
  // GOVERNORSHIP
  // ─────────────────────────────────────────────

  {
    id: 'g-rec1',
    category: 'counseling',
    freq: 'weekly',
    day: 'Tuesday',
    name: 'Telepastoring',
    desc: 'Call ≥5 members',
    appliesTo: ['governorship'],
    fields: [
      { id: 'count', type: 'attendance', label: 'How many members did you call?',
        required: true, flagBelow: 5 },
      { id: 'note',  type: 'note',       label: 'Notes (optional)', required: false },
    ],
  },
  {
    id: 'g-rec2',
    category: 'prayer',
    freq: 'weekly',
    day: 'Wednesday',
    name: 'Governorship Prayer Meeting',
    desc: 'Remind Bacenta leaders of Thursday prayer; address Sunday matters',
    appliesTo: ['governorship'],
    fields: [
      { id: 'attendance', type: 'attendance', label: 'How many attended?', required: true },
      { id: 'note',       type: 'note',       label: 'Notes (optional)',   required: false },
    ],
  },
  {
    id: 'g-rec3',
    category: 'prayer',
    freq: 'weekly',
    day: 'Thursday',
    name: 'Bacenta Morning Prayer',
    desc: 'At bacenta level — monitor only',
    appliesTo: ['governorship'],
    monitorOnly: true,  // shown as reminder, not logged by Governor
  },
  {
    id: 'g-rec4',
    category: 'counseling',
    freq: 'weekly',
    day: 'Sunday',
    name: 'Post-Church Counseling',
    desc: 'Counsel ≥3 members after church',
    appliesTo: ['governorship'],
    fields: [
      { id: 'count', type: 'attendance', label: 'How many did you counsel?',
        required: true, flagBelow: 3 },
      { id: 'note',  type: 'note',       label: 'Notes (optional)', required: false },
    ],
  },
  {
    id: 'g-cy1',
    category: 'prayer',
    freq: 'cycle',
    cycleWeek: 1,
    day: 'Friday',
    name: 'Bacenta Half-Night Prayer',
    desc: 'At bacenta level — monitor only',
    appliesTo: ['governorship'],
    monitorOnly: true,
  },
  {
    id: 'g-cy2',
    category: 'prayer',
    freq: 'cycle',
    cycleWeek: 1,
    day: 'Wednesday',
    name: 'Governorship Prayer Meeting — At the Centre',
    desc: 'Replaces standard Wednesday meeting this week (once in 6 weeks)',
    appliesTo: ['governorship'],
    fields: [
      { id: 'attendance', type: 'attendance', label: 'How many attended?', required: true },
      { id: 'note',       type: 'note',       label: 'Notes (optional)',   required: false },
    ],
  },
  {
    id: 'g-cy3',
    category: 'visitation',
    freq: 'cycle',
    cycleWeek: 3,
    day: 'Saturday',
    name: "Governors' Visitation Saturday",
    desc: 'Once in 6 weeks',
    appliesTo: ['governorship'],
    fields: [
      { id: 'visitedCount', type: 'attendance', label: 'How many visited?',            required: true },
      { id: 'visitedNames', type: 'names',      label: 'Names visited (one per line)',  required: false },
      { id: 'concerns',     type: 'note',       label: 'Concerns or follow-ups?',       required: false },
    ],
  },
  {
    id: 'g-cy4',
    category: 'counseling',
    freq: 'cycle',
    cycleWeek: 4,
    day: 'Wednesday',
    name: 'Mid-Week Check-In',
    desc: 'Governors check in with members',
    appliesTo: ['governorship'],
    fields: [
      { id: 'count', type: 'attendance', label: 'How many did you check in with?', required: true },
      { id: 'note',  type: 'note',       label: 'Notes (optional)',                required: false },
    ],
  },
  {
    id: 'g-cy5',
    category: 'counseling',
    freq: 'cycle',
    cycleWeek: 4,
    day: 'Saturday',
    name: 'Extended Counseling Sessions',
    desc: 'Members with special circumstances, couples & follow-ups',
    appliesTo: ['governorship'],
    fields: [
      { id: 'sessionCount', type: 'attendance', label: 'How many sessions held?',                   required: true },
      { id: 'issueType',    type: 'issueType',  label: 'Issue type',                                required: true },
      { id: 'note',         type: 'note',       label: 'Summary (keep brief, no sensitive details)', required: false },
    ],
  },
  {
    id: 'g-cy6',
    category: 'teaching',
    freq: 'cycle',
    cycleWeek: 5,
    day: 'Thursday',
    name: 'Inter-Bacenta Service',
    desc: 'At bacenta level — monitor only',
    appliesTo: ['governorship'],
    monitorOnly: true,
  },
  {
    id: 'g-cy7',
    category: 'teaching',
    freq: 'cycle',
    cycleWeek: 5,
    day: 'Saturday',
    name: 'Governorship Joint Service',
    desc: 'Once in 6 weeks',
    appliesTo: ['governorship'],
    fields: [
      { id: 'attendance', type: 'attendance', label: 'How many attended?', required: true },
      { id: 'note',       type: 'note',       label: 'Notes (optional)',   required: false },
      { id: 'photo',      type: 'photo',      label: 'Photo (optional)',   required: false },
    ],
  },
  {
    id: 'g-cy8',
    category: 'outreaches',
    freq: 'cycle',
    cycleWeek: 6,
    day: 'Saturday',
    name: 'Governorship Level Outreach',
    desc: 'Choose one: dance outreach / breakfast meeting / movie or games night',
    appliesTo: ['governorship'],
    fields: [
      { id: 'outreachType', type: 'select', label: 'Which outreach?',
        options: ['Dance Outreach', 'Breakfast Meeting', 'Movie Night', 'Games Night'],
        required: true },
      { id: 'attendance', type: 'attendance', label: 'How many attended?',         required: true },
      { id: 'salvations', type: 'attendance', label: 'Salvations / first-timers?', required: false },
      { id: 'note',       type: 'note',       label: 'Notes (optional)',           required: false },
      { id: 'photo',      type: 'photo',      label: 'Photo (optional)',           required: false },
    ],
  },

  // ─────────────────────────────────────────────
  // OVERSEER
  // ─────────────────────────────────────────────

  {
    id: 'o-rec1',
    category: 'counseling',
    freq: 'weekly',
    day: 'Tuesday',
    name: 'Telepastoring',
    desc: 'Call ≥5 members',
    appliesTo: ['overseer'],
    fields: [
      { id: 'count', type: 'attendance', label: 'How many members did you call?',
        required: true, flagBelow: 5 },
      { id: 'note',  type: 'note',       label: 'Notes (optional)', required: false },
    ],
  },
  {
    id: 'o-rec2',
    category: 'prayer',
    freq: 'weekly',
    day: 'Sunday',
    name: 'Sunday Morning Prayer (Lead)',
    desc: 'Lead all churches, Governors & Bacentas',
    appliesTo: ['overseer'],
    fields: [
      { id: 'attendance', type: 'attendance', label: 'How many attended across all churches?', required: true },
      { id: 'note',       type: 'note',       label: 'Notes (optional)',                       required: false },
    ],
  },
  {
    id: 'o-rec3',
    category: 'counseling',
    freq: 'weekly',
    day: 'Sunday',
    name: 'Post-Church Counseling',
    desc: 'Counsel ≥3 Governors/Bacenta leaders after church',
    appliesTo: ['overseer'],
    fields: [
      { id: 'count', type: 'attendance', label: 'How many did you counsel?',
        required: true, flagBelow: 3 },
      { id: 'note',  type: 'note',       label: 'Notes (optional)', required: false },
    ],
  },
  {
    id: 'o-cy1',
    category: 'prayer',
    freq: 'cycle',
    cycleWeek: 1,
    day: 'Thursday',
    name: 'Oversight Prayer Meeting',
    desc: 'At the centre or community (once in 6 weeks)',
    appliesTo: ['overseer'],
    fields: [
      { id: 'attendance', type: 'attendance', label: 'How many attended?', required: true },
      { id: 'note',       type: 'note',       label: 'Notes (optional)',   required: false },
    ],
  },
  {
    id: 'o-cy2',
    category: 'prayer',
    freq: 'cycle',
    cycleWeek: 1,
    day: 'Friday',
    name: 'Retreat in Mampong',
    desc: 'Minimum 7 hours (once in 6 weeks)',
    appliesTo: ['overseer'],
    fields: [
      { id: 'duration',   type: 'attendance', label: 'How many hours?',    required: true, flagBelow: 7 },
      { id: 'attendance', type: 'attendance', label: 'How many attended?', required: true },
      { id: 'note',       type: 'note',       label: 'Notes / summary',    required: false },
      { id: 'photo',      type: 'photo',      label: 'Photo (optional)',   required: false },
    ],
  },
  {
    id: 'o-cy3',
    category: 'visitation',
    freq: 'cycle',
    cycleWeek: 2,
    day: 'Saturday',
    name: 'Overseers Visitation (Week 2)',
    desc: 'Visit Governors, Bacenta leaders, married couples & members with special circumstances',
    appliesTo: ['overseer'],
    fields: [
      { id: 'governorsVisited', type: 'names',      label: 'Governors visited',                          required: false },
      { id: 'leadersVisited',   type: 'names',      label: 'Bacenta leaders visited',                    required: false },
      { id: 'couplesCount',     type: 'attendance', label: 'Married couples visited',                    required: false },
      { id: 'specialCount',     type: 'attendance', label: 'Members with special circumstances visited', required: false },
      { id: 'concerns',         type: 'note',       label: 'Concerns or follow-ups?',                    required: false },
    ],
  },
  {
    id: 'o-cy4',
    category: 'visitation',
    freq: 'cycle',
    cycleWeek: 3,
    day: 'Saturday',
    name: 'Overseers Visitation (Week 3)',
    desc: 'Continue visiting Governors, Bacenta leaders, married couples & members with special circumstances',
    appliesTo: ['overseer'],
    fields: [
      { id: 'governorsVisited', type: 'names',      label: 'Governors visited',                          required: false },
      { id: 'leadersVisited',   type: 'names',      label: 'Bacenta leaders visited',                    required: false },
      { id: 'couplesCount',     type: 'attendance', label: 'Married couples visited',                    required: false },
      { id: 'specialCount',     type: 'attendance', label: 'Members with special circumstances visited', required: false },
      { id: 'concerns',         type: 'note',       label: 'Concerns or follow-ups?',                    required: false },
    ],
  },
  {
    id: 'o-cy5',
    category: 'counseling',
    freq: 'cycle',
    cycleWeek: 4,
    day: 'Wednesday',
    name: 'Mid-Week Check-In',
    desc: 'Overseers check in with Governors/Bacenta leaders',
    appliesTo: ['overseer'],
    fields: [
      { id: 'count', type: 'attendance', label: 'How many did you check in with?', required: true },
      { id: 'note',  type: 'note',       label: 'Notes (optional)',                required: false },
    ],
  },
  {
    id: 'o-cy6',
    category: 'counseling',
    freq: 'cycle',
    cycleWeek: 4,
    day: 'Saturday',
    name: 'Extended Counseling Sessions',
    desc: 'Members with special circumstances, couples & follow-ups',
    appliesTo: ['overseer'],
    fields: [
      { id: 'sessionCount', type: 'attendance', label: 'How many sessions held?',                    required: true },
      { id: 'issueType',    type: 'issueType',  label: 'Issue type',                                 required: true },
      { id: 'note',         type: 'note',       label: 'Summary (keep brief, no sensitive details)', required: false },
    ],
  },
  {
    id: 'o-cy7',
    category: 'teaching',
    freq: 'cycle',
    cycleWeek: 5,
    day: 'Tuesday',
    name: 'Oversight SATs',
    desc: 'As and when scheduled',
    appliesTo: ['overseer'],
    fields: [
      { id: 'attendance', type: 'attendance', label: 'How many attended?', required: true },
      { id: 'note',       type: 'note',       label: 'Notes / summary',   required: false },
      { id: 'photo',      type: 'photo',      label: 'Photo (optional)',   required: false },
    ],
  },
  {
    id: 'o-cy8',
    category: 'teaching',
    freq: 'cycle',
    cycleWeek: 5,
    day: 'Saturday',
    name: 'Council Joint Service with Overseer',
    desc: 'Once in 6 weeks',
    appliesTo: ['overseer'],
    fields: [
      { id: 'attendance', type: 'attendance', label: 'How many attended?', required: true },
      { id: 'note',       type: 'note',       label: 'Notes / summary',   required: false },
      { id: 'photo',      type: 'photo',      label: 'Photo (optional)',   required: false },
    ],
  },
  {
    id: 'o-cy9',
    category: 'teaching',
    freq: 'cycle',
    cycleWeek: 5,
    day: 'Sunday',
    name: 'Inter-Overseer Service',
    desc: 'Once in 6 weeks',
    appliesTo: ['overseer'],
    fields: [
      { id: 'attendance', type: 'attendance', label: 'How many attended?', required: true },
      { id: 'note',       type: 'note',       label: 'Notes / summary',   required: false },
      { id: 'photo',      type: 'photo',      label: 'Photo (optional)',   required: false },
    ],
  },
  {
    id: 'o-cy10',
    category: 'outreaches',
    freq: 'cycle',
    cycleWeek: 6,
    day: 'Saturday',
    name: 'Oversight Level Outreach',
    desc: 'Choose one: dance outreach / breakfast meeting / movie or games night',
    appliesTo: ['overseer'],
    fields: [
      { id: 'outreachType', type: 'select', label: 'Which outreach?',
        options: ['Dance Outreach', 'Breakfast Meeting', 'Movie Night', 'Games Night'],
        required: true },
      { id: 'attendance', type: 'attendance', label: 'How many attended?',         required: true },
      { id: 'salvations', type: 'attendance', label: 'Salvations / first-timers?', required: false },
      { id: 'note',       type: 'note',       label: 'Notes (optional)',           required: false },
      { id: 'photo',      type: 'photo',      label: 'Photo (optional)',           required: false },
    ],
  },

  // ─────────────────────────────────────────────
  // BISHOP
  // Bishop-specific activities only.
  // Bishops also carry Overseer activities via their dual role.
  // Do not duplicate Overseer activities here.
  // ─────────────────────────────────────────────

  {
    id: 'bp-rec1',
    category: 'counseling',
    freq: 'weekly',
    day: 'Tuesday',
    name: 'Telepastoring',
    desc: 'Call ≥5 members',
    appliesTo: ['bishop'],
    fields: [
      { id: 'count', type: 'attendance', label: 'How many members did you call?',
        required: true, flagBelow: 5 },
      { id: 'note',  type: 'note',       label: 'Notes (optional)', required: false },
    ],
  },
  {
    id: 'bp-rec2',
    category: 'counseling',
    freq: 'weekly',
    day: 'Sunday',
    name: 'Post-Church Counseling',
    desc: 'Counsel ≥5 Governors/Bacenta leaders after church',
    appliesTo: ['bishop'],
    fields: [
      { id: 'count', type: 'attendance', label: 'How many did you counsel?',
        required: true, flagBelow: 5 },
      { id: 'note',  type: 'note',       label: 'Notes (optional)', required: false },
    ],
  },
];
```

---

## Field Types Reference

| type | Component | Notes |
|---|---|---|
| `attendance` | AttendanceField | Large +/− buttons, min 0. Show warning if value < `flagBelow` |
| `names` | NamesField | Textarea, one name per line |
| `select` | SelectField | Render as large tap-target buttons, NOT a dropdown |
| `issueType` | IssueTypeField | Two large toggle buttons: "General" / "Critical" |
| `note` | NoteField | Textarea, always optional |
| `photo` | PhotoField | Camera + gallery. Base64 now. TODO: swap to Supabase Storage |

---

## monitorOnly Activities

Activities flagged `monitorOnly: true` appear in the Governor's view as
greyed-out reminder cards — not tappable to log. Label them clearly:
*"Logged by Bacenta leaders"*. In a future phase, these cards can show
whether the Governor's bacentas have completed them.

---

## Backdating (edge case)

The log form date field defaults to today but allows the leader to pick
any date up to 4 weeks in the past. Store two timestamps:

- `activityDate` — the date the activity actually happened (user-selected)
- `submittedAt` — the exact moment they tapped submit (auto)

The weekly summary uses `activityDate` (not `submittedAt`) to determine
whether a recurring activity was completed in a given week.

---

## Weekly Summary Prompt

Trigger when the app is opened on a Monday and the previous ISO week
has no `weekly_summary` log entry for that user.

Show:
- Count of activities logged last week
- List of recurring activities (freq: weekly) with zero logs that week
- Free-text "How did your week go?"
- Dismissible

Store as a log entry with `type: 'weekly_summary'` and `isoWeek: '2026-W20'`.

---

## Supabase Schema Additions

Add these columns to `activity_logs`:

```sql
alter table public.activity_logs
  add column type        text not null default 'activity'
             check (type in ('activity', 'weekly_summary')),
  add column iso_week    text,          -- e.g. '2026-W20'
  add column activity_date date,        -- date the activity happened (user-selected)
  add column monitor_only boolean default false;

-- Index for weekly summary lookups
create index activity_logs_week_idx
  on public.activity_logs (submitted_by_id, iso_week);
```
