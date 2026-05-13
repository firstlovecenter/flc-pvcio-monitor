// src/data/activities.js
// All PVCIO activity definitions — 6-week calendar model.
// SOURCE OF TRUTH: CALENDAR_ACTIVITIES_CONTEXT_V2.md
//
// Each activity has:
//   id, category, name, desc, freq, appliesTo[], fields[]
//   Optional: cycleWeek (for freq:'cycle'), day, monitorOnly
//
// monitorOnly: true — shown as a greyed-out reminder card (not tappable to log).
//   Only the owning level logs it; the supervisory level sees it as a reference.
//
// Field types:
//   attendance  — large +/− buttons, min 0. flagBelow highlights warning if value < threshold.
//   names       — multi-line textarea, one name per line
//   select      — large tap-target buttons (NOT a dropdown)
//   issueType   — two large toggle buttons: "General" / "Critical"
//   note        — free text, always optional
//   photo       — camera capture + gallery upload. Base64 for now — TODO: swap to Supabase Storage
//
// Levels (use these exact strings everywhere):
//   'bacenta' | 'governorship' | 'overseer' | 'bishop'
//
// freq:
//   'weekly'  — every week
//   'cycle'   — once per 6-week cycle (cycleWeek indicates which week of the cycle)
//
// Backdating: log forms store two timestamps:
//   activityDate — date the activity happened (user-selected, up to 4 weeks back)
//   submittedAt  — moment the form was submitted (auto)

export const CATEGORIES = [
  {
    id: 'prayer',
    label: 'Prayer',
    icon: '🙏',
    color: '#2DD4BF',
    bg: 'rgba(45,212,191,.1)',
  },
  {
    id: 'visitation',
    label: 'Visitation',
    icon: '🏠',
    color: '#34D399',
    bg: 'rgba(52,211,153,.1)',
  },
  {
    id: 'counseling',
    label: 'Counseling',
    icon: '💬',
    color: '#A78BFA',
    bg: 'rgba(167,139,250,.1)',
  },
  {
    id: 'teaching',
    label: 'Teaching',
    icon: '📖',
    color: '#E8A830',
    bg: 'rgba(232,168,48,.1)',
  },
  {
    id: 'outreaches',
    label: 'Outreaches',
    icon: '🌍',
    color: '#F87060',
    bg: 'rgba(248,112,96,.1)',
  },
]

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
      {
        id: 'count',
        type: 'attendance',
        label: 'How many members did you call?',
        required: true,
        flagBelow: 5,
      },
      { id: 'note', type: 'note', label: 'Notes (optional)', required: false },
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
      {
        id: 'attendance',
        type: 'attendance',
        label: 'How many attended?',
        required: true,
      },
      { id: 'note', type: 'note', label: 'Notes (optional)', required: false },
      {
        id: 'photo',
        type: 'photo',
        label: 'Photo (optional)',
        required: false,
      },
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
      {
        id: 'attendance',
        type: 'attendance',
        label: 'How many attended?',
        required: true,
      },
      { id: 'note', type: 'note', label: 'Notes (optional)', required: false },
      {
        id: 'photo',
        type: 'photo',
        label: 'Photo (optional)',
        required: false,
      },
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
      {
        id: 'visitedCount',
        type: 'attendance',
        label: 'How many members visited?',
        required: true,
      },
      {
        id: 'visitedNames',
        type: 'names',
        label: 'Names visited (one per line)',
        required: false,
      },
      {
        id: 'concerns',
        type: 'note',
        label: 'Concerns or follow-ups?',
        required: false,
      },
      {
        id: 'photo',
        type: 'photo',
        label: 'Photo (optional)',
        required: false,
      },
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
      {
        id: 'attendance',
        type: 'attendance',
        label: 'How many attended?',
        required: true,
      },
      {
        id: 'bacentasJoined',
        type: 'names',
        label: 'Which bacentas joined?',
        required: false,
      },
      { id: 'note', type: 'note', label: 'Notes (optional)', required: false },
      {
        id: 'photo',
        type: 'photo',
        label: 'Photo (optional)',
        required: false,
      },
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
      {
        id: 'outreachType',
        type: 'select',
        label: 'Which outreach?',
        options: [
          'Dance Outreach',
          'Breakfast Meeting',
          'Movie Night',
          'Games Night',
        ],
        required: true,
      },
      {
        id: 'attendance',
        type: 'attendance',
        label: 'How many attended?',
        required: true,
      },
      {
        id: 'salvations',
        type: 'attendance',
        label: 'Salvations / first-timers?',
        required: false,
      },
      { id: 'note', type: 'note', label: 'Notes (optional)', required: false },
      {
        id: 'photo',
        type: 'photo',
        label: 'Photo (optional)',
        required: false,
      },
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
      {
        id: 'count',
        type: 'attendance',
        label: 'How many members did you call?',
        required: true,
        flagBelow: 5,
      },
      { id: 'note', type: 'note', label: 'Notes (optional)', required: false },
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
      {
        id: 'attendance',
        type: 'attendance',
        label: 'How many attended?',
        required: true,
      },
      { id: 'note', type: 'note', label: 'Notes (optional)', required: false },
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
    monitorOnly: true,
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
      {
        id: 'count',
        type: 'attendance',
        label: 'How many did you counsel?',
        required: true,
        flagBelow: 3,
      },
      { id: 'note', type: 'note', label: 'Notes (optional)', required: false },
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
      {
        id: 'attendance',
        type: 'attendance',
        label: 'How many attended?',
        required: true,
      },
      { id: 'note', type: 'note', label: 'Notes (optional)', required: false },
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
      {
        id: 'visitedCount',
        type: 'attendance',
        label: 'How many visited?',
        required: true,
      },
      {
        id: 'visitedNames',
        type: 'names',
        label: 'Names visited (one per line)',
        required: false,
      },
      {
        id: 'concerns',
        type: 'note',
        label: 'Concerns or follow-ups?',
        required: false,
      },
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
      {
        id: 'count',
        type: 'attendance',
        label: 'How many did you check in with?',
        required: true,
      },
      { id: 'note', type: 'note', label: 'Notes (optional)', required: false },
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
      {
        id: 'sessionCount',
        type: 'attendance',
        label: 'How many sessions held?',
        required: true,
      },
      {
        id: 'issueType',
        type: 'issueType',
        label: 'Issue type',
        required: true,
      },
      {
        id: 'note',
        type: 'note',
        label: 'Summary (keep brief, no sensitive details)',
        required: false,
      },
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
      {
        id: 'attendance',
        type: 'attendance',
        label: 'How many attended?',
        required: true,
      },
      { id: 'note', type: 'note', label: 'Notes (optional)', required: false },
      {
        id: 'photo',
        type: 'photo',
        label: 'Photo (optional)',
        required: false,
      },
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
      {
        id: 'outreachType',
        type: 'select',
        label: 'Which outreach?',
        options: [
          'Dance Outreach',
          'Breakfast Meeting',
          'Movie Night',
          'Games Night',
        ],
        required: true,
      },
      {
        id: 'attendance',
        type: 'attendance',
        label: 'How many attended?',
        required: true,
      },
      {
        id: 'salvations',
        type: 'attendance',
        label: 'Salvations / first-timers?',
        required: false,
      },
      { id: 'note', type: 'note', label: 'Notes (optional)', required: false },
      {
        id: 'photo',
        type: 'photo',
        label: 'Photo (optional)',
        required: false,
      },
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
      {
        id: 'count',
        type: 'attendance',
        label: 'How many members did you call?',
        required: true,
        flagBelow: 5,
      },
      { id: 'note', type: 'note', label: 'Notes (optional)', required: false },
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
      {
        id: 'attendance',
        type: 'attendance',
        label: 'How many attended across all churches?',
        required: true,
      },
      { id: 'note', type: 'note', label: 'Notes (optional)', required: false },
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
      {
        id: 'count',
        type: 'attendance',
        label: 'How many did you counsel?',
        required: true,
        flagBelow: 3,
      },
      { id: 'note', type: 'note', label: 'Notes (optional)', required: false },
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
      {
        id: 'attendance',
        type: 'attendance',
        label: 'How many attended?',
        required: true,
      },
      { id: 'note', type: 'note', label: 'Notes (optional)', required: false },
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
      {
        id: 'duration',
        type: 'attendance',
        label: 'How many hours?',
        required: true,
        flagBelow: 7,
      },
      {
        id: 'attendance',
        type: 'attendance',
        label: 'How many attended?',
        required: true,
      },
      { id: 'note', type: 'note', label: 'Notes / summary', required: false },
      {
        id: 'photo',
        type: 'photo',
        label: 'Photo (optional)',
        required: false,
      },
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
      {
        id: 'governorsVisited',
        type: 'names',
        label: 'Governors visited',
        required: false,
      },
      {
        id: 'leadersVisited',
        type: 'names',
        label: 'Bacenta leaders visited',
        required: false,
      },
      {
        id: 'couplesCount',
        type: 'attendance',
        label: 'Married couples visited',
        required: false,
      },
      {
        id: 'specialCount',
        type: 'attendance',
        label: 'Members with special circumstances visited',
        required: false,
      },
      {
        id: 'concerns',
        type: 'note',
        label: 'Concerns or follow-ups?',
        required: false,
      },
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
      {
        id: 'governorsVisited',
        type: 'names',
        label: 'Governors visited',
        required: false,
      },
      {
        id: 'leadersVisited',
        type: 'names',
        label: 'Bacenta leaders visited',
        required: false,
      },
      {
        id: 'couplesCount',
        type: 'attendance',
        label: 'Married couples visited',
        required: false,
      },
      {
        id: 'specialCount',
        type: 'attendance',
        label: 'Members with special circumstances visited',
        required: false,
      },
      {
        id: 'concerns',
        type: 'note',
        label: 'Concerns or follow-ups?',
        required: false,
      },
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
      {
        id: 'count',
        type: 'attendance',
        label: 'How many did you check in with?',
        required: true,
      },
      { id: 'note', type: 'note', label: 'Notes (optional)', required: false },
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
      {
        id: 'sessionCount',
        type: 'attendance',
        label: 'How many sessions held?',
        required: true,
      },
      {
        id: 'issueType',
        type: 'issueType',
        label: 'Issue type',
        required: true,
      },
      {
        id: 'note',
        type: 'note',
        label: 'Summary (keep brief, no sensitive details)',
        required: false,
      },
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
      {
        id: 'attendance',
        type: 'attendance',
        label: 'How many attended?',
        required: true,
      },
      { id: 'note', type: 'note', label: 'Notes / summary', required: false },
      {
        id: 'photo',
        type: 'photo',
        label: 'Photo (optional)',
        required: false,
      },
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
      {
        id: 'attendance',
        type: 'attendance',
        label: 'How many attended?',
        required: true,
      },
      { id: 'note', type: 'note', label: 'Notes / summary', required: false },
      {
        id: 'photo',
        type: 'photo',
        label: 'Photo (optional)',
        required: false,
      },
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
      {
        id: 'attendance',
        type: 'attendance',
        label: 'How many attended?',
        required: true,
      },
      { id: 'note', type: 'note', label: 'Notes / summary', required: false },
      {
        id: 'photo',
        type: 'photo',
        label: 'Photo (optional)',
        required: false,
      },
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
      {
        id: 'outreachType',
        type: 'select',
        label: 'Which outreach?',
        options: [
          'Dance Outreach',
          'Breakfast Meeting',
          'Movie Night',
          'Games Night',
        ],
        required: true,
      },
      {
        id: 'attendance',
        type: 'attendance',
        label: 'How many attended?',
        required: true,
      },
      {
        id: 'salvations',
        type: 'attendance',
        label: 'Salvations / first-timers?',
        required: false,
      },
      { id: 'note', type: 'note', label: 'Notes (optional)', required: false },
      {
        id: 'photo',
        type: 'photo',
        label: 'Photo (optional)',
        required: false,
      },
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
      {
        id: 'count',
        type: 'attendance',
        label: 'How many members did you call?',
        required: true,
        flagBelow: 5,
      },
      { id: 'note', type: 'note', label: 'Notes (optional)', required: false },
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
      {
        id: 'count',
        type: 'attendance',
        label: 'How many did you counsel?',
        required: true,
        flagBelow: 5,
      },
      { id: 'note', type: 'note', label: 'Notes (optional)', required: false },
    ],
  },
]

// ── Helpers ──────────────────────────────────────────────────────────────

/** Get all activities visible to a given level */
export function getActivitiesForLevel(level) {
  return ACTIVITIES.filter((a) => a.appliesTo.includes(level))
}

/** Get activities for a specific category + level */
export function getActivitiesByCategoryAndLevel(categoryId, level) {
  return ACTIVITIES.filter(
    (a) => a.category === categoryId && a.appliesTo.includes(level),
  )
}

/** Get a single activity by id */
export function getActivityById(id) {
  return ACTIVITIES.find((a) => a.id === id)
}

/** Get category metadata by id */
export function getCategoryById(id) {
  return CATEGORIES.find((c) => c.id === id)
}

/**
 * Group activities by freq for display.
 * Returns: { weekly: [...], cycle: [...] }
 */
export function groupByFreq(activities) {
  const groups = { weekly: [], cycle: [] }
  activities.forEach((a) => {
    if (groups[a.freq]) groups[a.freq].push(a)
    else groups[a.freq] = [a]
  })
  return groups
}
