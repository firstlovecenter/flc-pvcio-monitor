// src/data/activities.js
// All PVCIO activity definitions — 6-week calendar model.
// SOURCE OF TRUTH: OFFICIAL_CALENDAR_CONTEXT.md
// Organisation: First Love Church
// Cycle: May 12 – June 22, 2026
//
// Each activity has:
//   id, category, name, desc, freq, appliesTo[], fields[]
//   Optional: cycleWeek (for freq:'cycle'), day
//
// New properties from OFFICIAL_CALENDAR_CONTEXT.md:
//   interaction  — 'form' (default) | 'quick' (just a tap to mark as done)
//   visibility   — 'lead' (default) | 'join' | 'monitor' | 'ensure'
//                  'lead'    → leader owns this activity (normal row)
//                  'join'    → attending a higher-level activity ("Join" chip)
//                  'monitor' → watching/verifying a lower-level activity ("Monitor" chip)
//                  'ensure'  → confirming lower-level activities happened ("Ensure" chip)
//   streamFilter — string[] — if set, only visible to users whose stream is in this list
//   weekOverrides — { [cycleWeek]: partialActivity } — overrides applied per cycle week
//   streamRotation — { [cycleWeek]: string[] } — for freq:'weekly' activities that only
//                    apply to certain streams on certain weeks (e.g. Intimate Counselling)
//   specialEvent — boolean — Benny Hinn Night etc.; shown with amber accent, quick-tap only
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
//   Bishop shares all Overseer activities — normalised in getActivitiesForLevel().
//
// freq:
//   'weekly'  — every week (stream/weekOverride filters may still limit visibility)
//   'cycle'   — once per 6-week cycle (cycleWeek indicates which week 1–6)
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
  // ─────────────────────────────────────────────────────────────────────────────
  // BACENTA LEADER — all four levels use the same base structure.
  // Bishop is normalised to overseer in helpers — do not add bishop here.
  // ─────────────────────────────────────────────────────────────────────────────

  // ── BACENTA · Weekly ─────────────────────────────────────────────────────────

  {
    id: 'b-tue-telepastoring',
    category: 'counseling',
    freq: 'weekly',
    day: 'Tuesday',
    name: 'Telepastoring',
    desc: 'Call 5 members',
    appliesTo: ['bacenta'],
    interaction: 'form',
    fields: [
      { id: 'count', type: 'attendance', label: 'How many members called?', required: true, flagBelow: 5 },
      { id: 'note', type: 'note', label: 'Notes (optional)', required: false },
    ],
  },
  {
    id: 'b-tue-sat',
    category: 'teaching',
    freq: 'weekly',
    day: 'Tuesday',
    name: 'Join SAT',
    desc: 'Servants Armed & Trained — teaching session led by Governor',
    appliesTo: ['bacenta'],
    interaction: 'quick',
    visibility: 'join',
  },
  {
    id: 'b-wed-prayer',
    category: 'prayer',
    freq: 'weekly',
    day: 'Wednesday',
    name: 'Join Governor Morning Prayer Meeting',
    desc: 'Attend the Governorship morning prayer meeting',
    appliesTo: ['bacenta'],
    interaction: 'quick',
    visibility: 'join',
  },
  {
    id: 'b-thu-morningprayer',
    category: 'prayer',
    freq: 'weekly',
    day: 'Thursday',
    name: 'Bacenta Morning Prayers',
    desc: 'All members — lead this',
    appliesTo: ['bacenta'],
    interaction: 'form',
    fields: [
      { id: 'attendance', type: 'attendance', label: 'How many attended?', required: true },
      { id: 'photo', type: 'photo', label: 'Photo (optional)', required: false },
      { id: 'note', type: 'note', label: 'Notes (optional)', required: false },
    ],
  },
  {
    id: 'b-thu-service',
    category: 'teaching',
    freq: 'weekly',
    day: 'Thursday',
    name: 'Bacenta Service',
    desc: 'Regular bacenta service',
    appliesTo: ['bacenta'],
    interaction: 'form',
    fields: [
      { id: 'attendance', type: 'attendance', label: 'How many attended?', required: true },
      { id: 'photo', type: 'photo', label: 'Photo (optional)', required: false },
      { id: 'note', type: 'note', label: 'Notes (optional)', required: false },
    ],
    weekOverrides: {
      3: { name: 'Bacenta Service (Inter-Bacenta)', desc: 'Inter-bacenta format this week' },
      6: { name: 'Attend Council Joint Service', desc: 'Attend — do not lead', interaction: 'quick', visibility: 'join', fields: [] },
    },
  },
  {
    id: 'b-sun-prayer',
    category: 'prayer',
    freq: 'weekly',
    day: 'Sunday',
    name: 'Join Overseer Prayer Meeting',
    desc: 'Attend — Overseer leads this',
    appliesTo: ['bacenta'],
    interaction: 'quick',
    visibility: 'join',
    weekOverrides: {
      2: { name: 'Benny Hinn Night — Day 2', desc: 'Ps Benny Weekend — special event', specialEvent: true, interaction: 'quick', fields: [] },
    },
  },
  {
    id: 'b-sun-counselling',
    category: 'counseling',
    freq: 'weekly',
    day: 'Sunday',
    name: 'Send Members for Counselling',
    desc: 'Encourage and direct members to counselling after church',
    appliesTo: ['bacenta'],
    interaction: 'quick',
  },

  // ── BACENTA · Cycle — Friday ──────────────────────────────────────────────

  {
    id: 'b-fri-w1',
    category: 'prayer',
    freq: 'cycle',
    cycleWeek: 1,
    day: 'Friday',
    name: 'Governor-Led All Night',
    desc: 'All night prayer — led by Governor',
    appliesTo: ['bacenta'],
    interaction: 'quick',
    visibility: 'join',
  },
  {
    id: 'b-fri-w2',
    category: 'prayer',
    freq: 'cycle',
    cycleWeek: 2,
    day: 'Friday',
    name: 'Council All Night',
    desc: 'Ephesians + Philippians + Anagkazo',
    appliesTo: ['bacenta'],
    streamFilter: ['Ephesians', 'Philippians', 'Anagkazo'],
    interaction: 'form',
    fields: [
      { id: 'attendance', type: 'attendance', label: 'How many attended?', required: false },
      { id: 'photo', type: 'photo', label: 'Photo (optional)', required: false },
      { id: 'note', type: 'note', label: 'Notes (optional)', required: false },
    ],
  },
  {
    id: 'b-fri-w3',
    category: 'prayer',
    freq: 'cycle',
    cycleWeek: 3,
    day: 'Friday',
    name: 'Council All Night',
    desc: 'Galatians + Colossians',
    appliesTo: ['bacenta'],
    streamFilter: ['Galatians', 'Colossians'],
    interaction: 'form',
    fields: [
      { id: 'attendance', type: 'attendance', label: 'How many attended?', required: false },
      { id: 'photo', type: 'photo', label: 'Photo (optional)', required: false },
      { id: 'note', type: 'note', label: 'Notes (optional)', required: false },
    ],
  },
  {
    id: 'b-fri-w4',
    category: 'prayer',
    freq: 'cycle',
    cycleWeek: 4,
    day: 'Friday',
    name: 'Council Retreat',
    desc: 'Ephesians + Philippians + Anagkazo',
    appliesTo: ['bacenta'],
    streamFilter: ['Ephesians', 'Philippians', 'Anagkazo'],
    interaction: 'form',
    fields: [
      { id: 'attendance', type: 'attendance', label: 'How many attended?', required: false },
      { id: 'duration', type: 'attendance', label: 'How many hours?', required: false, flagBelow: 7 },
      { id: 'note', type: 'note', label: 'Notes / summary', required: false },
      { id: 'photo', type: 'photo', label: 'Photo (optional)', required: false },
    ],
  },
  {
    id: 'b-fri-w5',
    category: 'prayer',
    freq: 'cycle',
    cycleWeek: 5,
    day: 'Friday',
    name: 'Council Retreat',
    desc: 'Galatians + Colossians',
    appliesTo: ['bacenta'],
    streamFilter: ['Galatians', 'Colossians'],
    interaction: 'form',
    fields: [
      { id: 'attendance', type: 'attendance', label: 'How many attended?', required: false },
      { id: 'duration', type: 'attendance', label: 'How many hours?', required: false, flagBelow: 7 },
      { id: 'note', type: 'note', label: 'Notes / summary', required: false },
      { id: 'photo', type: 'photo', label: 'Photo (optional)', required: false },
    ],
  },
  {
    id: 'b-fri-w6',
    category: 'prayer',
    freq: 'cycle',
    cycleWeek: 6,
    day: 'Friday',
    name: 'Bacenta 3-Hour Prayer Meeting',
    desc: 'Evening — lead this',
    appliesTo: ['bacenta'],
    interaction: 'form',
    fields: [
      { id: 'attendance', type: 'attendance', label: 'How many attended?', required: false },
      { id: 'duration', type: 'attendance', label: 'How many hours?', required: false, flagBelow: 3 },
      { id: 'photo', type: 'photo', label: 'Photo (optional)', required: false },
      { id: 'note', type: 'note', label: 'Notes (optional)', required: false },
    ],
  },

  // ── BACENTA · Cycle — Saturday ────────────────────────────────────────────

  {
    id: 'b-sat-w1',
    category: 'outreaches',
    freq: 'cycle',
    cycleWeek: 1,
    day: 'Saturday',
    name: 'Bacenta Outreach',
    desc: 'Door to door / bus stop / flyer sharing',
    appliesTo: ['bacenta'],
    interaction: 'form',
    fields: [
      { id: 'outreachType', type: 'select', label: 'Outreach type', options: ['Door to Door', 'Bus Stop', 'Flyer Sharing'], required: false },
      { id: 'attendance', type: 'attendance', label: 'How many participated?', required: false },
      { id: 'salvations', type: 'attendance', label: 'Salvations / first-timers?', required: false },
      { id: 'photo', type: 'photo', label: 'Photo (optional)', required: false },
      { id: 'note', type: 'note', label: 'Notes (optional)', required: false },
    ],
  },
  {
    id: 'b-sat-w2',
    category: 'prayer',
    freq: 'cycle',
    cycleWeek: 2,
    day: 'Saturday',
    name: 'Benny Hinn Night — Day 1',
    desc: 'Ps Benny Weekend — special event',
    appliesTo: ['bacenta'],
    specialEvent: true,
    interaction: 'quick',
  },
  {
    id: 'b-sat-w3',
    category: 'outreaches',
    freq: 'cycle',
    cycleWeek: 3,
    day: 'Saturday',
    name: 'Governor Organised Outreach Day',
    desc: 'Breakfast Meeting / Dance Outreach / Games or Movie Night — led by Governor',
    appliesTo: ['bacenta'],
    interaction: 'form',
    visibility: 'join',
    fields: [
      { id: 'outreachType', type: 'select', label: 'Outreach type', options: ['Breakfast Meeting', 'Dance Outreach', 'Games Night', 'Movie Night'], required: false },
      { id: 'attendance', type: 'attendance', label: 'How many attended?', required: false },
      { id: 'salvations', type: 'attendance', label: 'Salvations / first-timers?', required: false },
      { id: 'photo', type: 'photo', label: 'Photo (optional)', required: false },
      { id: 'note', type: 'note', label: 'Notes (optional)', required: false },
    ],
  },
  {
    id: 'b-sat-w4',
    category: 'visitation',
    freq: 'cycle',
    cycleWeek: 4,
    day: 'Saturday',
    name: 'Visitation',
    desc: 'Visit bacenta members',
    appliesTo: ['bacenta'],
    interaction: 'form',
    fields: [
      { id: 'visitedCount', type: 'attendance', label: 'How many members visited?', required: false },
      { id: 'visitedNames', type: 'names', label: 'Names visited (one per line)', required: false },
      { id: 'concerns', type: 'note', label: 'Concerns or follow-ups?', required: false },
    ],
  },
  {
    id: 'b-sat-w5',
    category: 'outreaches',
    freq: 'cycle',
    cycleWeek: 5,
    day: 'Saturday',
    name: 'Bacenta Organised Outreach Day',
    desc: 'Breakfast Meeting / Dance Outreach / Games or Movie Night — lead this',
    appliesTo: ['bacenta'],
    interaction: 'form',
    fields: [
      { id: 'outreachType', type: 'select', label: 'Outreach type', options: ['Breakfast Meeting', 'Dance Outreach', 'Games Night', 'Movie Night'], required: false },
      { id: 'attendance', type: 'attendance', label: 'How many attended?', required: false },
      { id: 'salvations', type: 'attendance', label: 'Salvations / first-timers?', required: false },
      { id: 'photo', type: 'photo', label: 'Photo (optional)', required: false },
      { id: 'note', type: 'note', label: 'Notes (optional)', required: false },
    ],
  },
  {
    id: 'b-sat-w6',
    category: 'outreaches',
    freq: 'cycle',
    cycleWeek: 6,
    day: 'Saturday',
    name: 'Overseer Organised Outreach Day',
    desc: 'Breakfast Meeting / Dance Outreach / Games or Movie Night — led by Overseer',
    appliesTo: ['bacenta'],
    interaction: 'form',
    visibility: 'join',
    fields: [
      { id: 'outreachType', type: 'select', label: 'Outreach type', options: ['Breakfast Meeting', 'Dance Outreach', 'Games Night', 'Movie Night'], required: false },
      { id: 'attendance', type: 'attendance', label: 'How many attended?', required: false },
      { id: 'salvations', type: 'attendance', label: 'Salvations / first-timers?', required: false },
      { id: 'photo', type: 'photo', label: 'Photo (optional)', required: false },
      { id: 'note', type: 'note', label: 'Notes (optional)', required: false },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // GOVERNOR
  // ─────────────────────────────────────────────────────────────────────────────

  // ── GOVERNOR · Weekly ─────────────────────────────────────────────────────

  {
    id: 'g-tue-telepastoring',
    category: 'counseling',
    freq: 'weekly',
    day: 'Tuesday',
    name: 'Telepastoring',
    desc: 'Call 5 members',
    appliesTo: ['governorship'],
    interaction: 'form',
    fields: [
      { id: 'count', type: 'attendance', label: 'How many members called?', required: true, flagBelow: 5 },
      { id: 'note', type: 'note', label: 'Notes (optional)', required: false },
    ],
  },
  {
    id: 'g-tue-sat',
    category: 'teaching',
    freq: 'weekly',
    day: 'Tuesday',
    name: 'SAT with Leaders',
    desc: 'Servants Armed & Trained — lead this teaching session with your leaders',
    appliesTo: ['governorship'],
    interaction: 'form',
    visibility: 'lead',
    fields: [
      { id: 'attendance', type: 'attendance', label: 'How many leaders attended?', required: false },
      { id: 'note', type: 'note', label: 'Notes (optional)', required: false },
    ],
  },
  {
    id: 'g-wed-prayer',
    category: 'prayer',
    freq: 'weekly',
    day: 'Wednesday',
    name: 'Morning Prayer Meeting with Leaders',
    desc: 'Lead Governorship morning prayer meeting',
    appliesTo: ['governorship'],
    interaction: 'form',
    visibility: 'lead',
    fields: [
      { id: 'attendance', type: 'attendance', label: 'How many attended?', required: false },
      { id: 'note', type: 'note', label: 'Notes (optional)', required: false },
      { id: 'photo', type: 'photo', label: 'Photo (optional)', required: false },
    ],
  },
  {
    id: 'g-thu-morningprayer',
    category: 'prayer',
    freq: 'weekly',
    day: 'Thursday',
    name: 'Bacenta Morning Prayers',
    desc: 'Attend / monitor — Bacenta leaders lead this',
    appliesTo: ['governorship'],
    interaction: 'form',
    visibility: 'monitor',
    fields: [
      { id: 'attendance', type: 'attendance', label: 'How many attended across bacentas?', required: false },
      { id: 'note', type: 'note', label: 'Notes (optional)', required: false },
    ],
  },
  {
    id: 'g-thu-service',
    category: 'teaching',
    freq: 'weekly',
    day: 'Thursday',
    name: 'Bacenta Service',
    desc: 'Attend bacenta service',
    appliesTo: ['governorship'],
    interaction: 'form',
    visibility: 'monitor',
    fields: [
      { id: 'attendance', type: 'attendance', label: 'Attendance?', required: false },
      { id: 'note', type: 'note', label: 'Notes (optional)', required: false },
    ],
    weekOverrides: {
      3: { name: 'Bacenta Service (Inter-Bacenta)', desc: 'Inter-bacenta format this week' },
      6: { name: 'Attend Council Joint Service', desc: 'Attend — Overseer leads', interaction: 'quick', visibility: 'join' },
    },
  },
  {
    id: 'g-sun-prayer',
    category: 'prayer',
    freq: 'weekly',
    day: 'Sunday',
    name: 'Join Overseer Prayer Meeting with Leaders',
    desc: 'Attend — Overseer leads this',
    appliesTo: ['governorship'],
    interaction: 'quick',
    visibility: 'join',
    weekOverrides: {
      2: { name: 'Benny Hinn Night — Day 2', desc: 'Ps Benny Weekend — special event', specialEvent: true, interaction: 'quick' },
    },
  },
  {
    id: 'g-sun-counselling',
    category: 'counseling',
    freq: 'weekly',
    day: 'Sunday',
    name: 'Send Members for Counselling',
    desc: 'Direct members to counselling after church',
    appliesTo: ['governorship'],
    interaction: 'quick',
  },

  // ── GOVERNOR · Cycle — Friday ──────────────────────────────────────────────

  {
    id: 'g-fri-w1',
    category: 'prayer',
    freq: 'cycle',
    cycleWeek: 1,
    day: 'Friday',
    name: 'Governor-Led All Night',
    desc: 'Lead all night prayer across your bacentas',
    appliesTo: ['governorship'],
    interaction: 'form',
    visibility: 'lead',
    fields: [
      { id: 'attendance', type: 'attendance', label: 'How many attended?', required: false },
      { id: 'photo', type: 'photo', label: 'Photo (optional)', required: false },
      { id: 'note', type: 'note', label: 'Notes / summary', required: false },
    ],
  },
  {
    id: 'g-fri-w2',
    category: 'prayer',
    freq: 'cycle',
    cycleWeek: 2,
    day: 'Friday',
    name: 'Council All Night',
    desc: 'Ephesians + Philippians + Anagkazo',
    appliesTo: ['governorship'],
    streamFilter: ['Ephesians', 'Philippians', 'Anagkazo'],
    interaction: 'form',
    visibility: 'join',
    fields: [
      { id: 'attendance', type: 'attendance', label: 'How many attended?', required: false },
      { id: 'photo', type: 'photo', label: 'Photo (optional)', required: false },
      { id: 'note', type: 'note', label: 'Notes (optional)', required: false },
    ],
  },
  {
    id: 'g-fri-w3',
    category: 'prayer',
    freq: 'cycle',
    cycleWeek: 3,
    day: 'Friday',
    name: 'Council All Night',
    desc: 'Galatians + Colossians',
    appliesTo: ['governorship'],
    streamFilter: ['Galatians', 'Colossians'],
    interaction: 'form',
    visibility: 'join',
    fields: [
      { id: 'attendance', type: 'attendance', label: 'How many attended?', required: false },
      { id: 'photo', type: 'photo', label: 'Photo (optional)', required: false },
      { id: 'note', type: 'note', label: 'Notes (optional)', required: false },
    ],
  },
  {
    id: 'g-fri-w4',
    category: 'prayer',
    freq: 'cycle',
    cycleWeek: 4,
    day: 'Friday',
    name: 'Council Retreat',
    desc: 'Ephesians + Philippians + Anagkazo',
    appliesTo: ['governorship'],
    streamFilter: ['Ephesians', 'Philippians', 'Anagkazo'],
    interaction: 'form',
    visibility: 'join',
    fields: [
      { id: 'attendance', type: 'attendance', label: 'How many attended?', required: false },
      { id: 'duration', type: 'attendance', label: 'How many hours?', required: false, flagBelow: 7 },
      { id: 'note', type: 'note', label: 'Notes / summary', required: false },
      { id: 'photo', type: 'photo', label: 'Photo (optional)', required: false },
    ],
  },
  {
    id: 'g-fri-w5',
    category: 'prayer',
    freq: 'cycle',
    cycleWeek: 5,
    day: 'Friday',
    name: 'Council Retreat',
    desc: 'Galatians + Colossians',
    appliesTo: ['governorship'],
    streamFilter: ['Galatians', 'Colossians'],
    interaction: 'form',
    visibility: 'join',
    fields: [
      { id: 'attendance', type: 'attendance', label: 'How many attended?', required: false },
      { id: 'duration', type: 'attendance', label: 'How many hours?', required: false, flagBelow: 7 },
      { id: 'note', type: 'note', label: 'Notes / summary', required: false },
      { id: 'photo', type: 'photo', label: 'Photo (optional)', required: false },
    ],
  },
  {
    id: 'g-fri-w6',
    category: 'prayer',
    freq: 'cycle',
    cycleWeek: 6,
    day: 'Friday',
    name: 'Bacenta 3-Hour Prayer Meeting',
    desc: 'Attend — Bacenta leaders lead this',
    appliesTo: ['governorship'],
    interaction: 'form',
    visibility: 'join',
    fields: [
      { id: 'attendance', type: 'attendance', label: 'How many attended?', required: false },
      { id: 'note', type: 'note', label: 'Notes (optional)', required: false },
    ],
  },

  // ── GOVERNOR · Cycle — Saturday ───────────────────────────────────────────

  {
    id: 'g-sat-w1',
    category: 'outreaches',
    freq: 'cycle',
    cycleWeek: 1,
    day: 'Saturday',
    name: 'Bacentas Outreach',
    desc: 'Door to door / bus stop / flyer sharing — monitor your bacentas',
    appliesTo: ['governorship'],
    interaction: 'form',
    visibility: 'monitor',
    fields: [
      { id: 'totalAttendance', type: 'attendance', label: 'Total across all bacentas?', required: false },
      { id: 'note', type: 'note', label: 'Notes (optional)', required: false },
    ],
  },
  {
    id: 'g-sat-w2',
    category: 'prayer',
    freq: 'cycle',
    cycleWeek: 2,
    day: 'Saturday',
    name: 'Benny Hinn Night — Day 1',
    desc: 'Ps Benny Weekend — special event',
    appliesTo: ['governorship'],
    specialEvent: true,
    interaction: 'quick',
  },
  {
    id: 'g-sat-w3',
    category: 'outreaches',
    freq: 'cycle',
    cycleWeek: 3,
    day: 'Saturday',
    name: 'Governor Organised Outreach Day',
    desc: 'Lead: Breakfast Meeting / Dance Outreach / Games or Movie Night',
    appliesTo: ['governorship'],
    interaction: 'form',
    visibility: 'lead',
    fields: [
      { id: 'outreachType', type: 'select', label: 'Outreach type', options: ['Breakfast Meeting', 'Dance Outreach', 'Games Night', 'Movie Night'], required: false },
      { id: 'attendance', type: 'attendance', label: 'How many attended?', required: false },
      { id: 'salvations', type: 'attendance', label: 'Salvations / first-timers?', required: false },
      { id: 'photo', type: 'photo', label: 'Photo (optional)', required: false },
      { id: 'note', type: 'note', label: 'Notes (optional)', required: false },
    ],
  },
  {
    id: 'g-sat-w4',
    category: 'visitation',
    freq: 'cycle',
    cycleWeek: 4,
    day: 'Saturday',
    name: 'Visitation',
    desc: 'Visit bacenta leaders and members',
    appliesTo: ['governorship'],
    interaction: 'form',
    fields: [
      { id: 'visitedNames', type: 'names', label: 'Who did you visit? (one per line)', required: false },
      { id: 'concerns', type: 'note', label: 'Concerns or follow-ups?', required: false },
    ],
  },
  {
    id: 'g-sat-w5-vis',
    category: 'visitation',
    freq: 'cycle',
    cycleWeek: 5,
    day: 'Saturday',
    name: 'Visitation',
    desc: 'Continue visiting bacenta leaders and members',
    appliesTo: ['governorship'],
    interaction: 'form',
    fields: [
      { id: 'visitedNames', type: 'names', label: 'Who did you visit? (one per line)', required: false },
      { id: 'concerns', type: 'note', label: 'Concerns or follow-ups?', required: false },
    ],
  },
  {
    id: 'g-sat-w5-out',
    category: 'outreaches',
    freq: 'cycle',
    cycleWeek: 5,
    day: 'Saturday',
    name: 'Bacentas Organised Outreach Day',
    desc: 'Monitor — your bacentas lead this',
    appliesTo: ['governorship'],
    interaction: 'form',
    visibility: 'monitor',
    fields: [
      { id: 'totalAttendance', type: 'attendance', label: 'Total attendance across bacentas?', required: false },
      { id: 'note', type: 'note', label: 'Notes (optional)', required: false },
    ],
  },
  {
    id: 'g-sat-w6',
    category: 'outreaches',
    freq: 'cycle',
    cycleWeek: 6,
    day: 'Saturday',
    name: 'Overseer Organised Outreach Day',
    desc: 'Join — Overseer leads this outreach',
    appliesTo: ['governorship'],
    interaction: 'form',
    visibility: 'join',
    fields: [
      { id: 'attendance', type: 'attendance', label: 'How many attended?', required: false },
      { id: 'note', type: 'note', label: 'Notes (optional)', required: false },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // OVERSEER / BISHOP — Bishop shares all Overseer activities.
  // normalised via getActivitiesForLevel(): 'bishop' → 'overseer'
  // ─────────────────────────────────────────────────────────────────────────────

  // ── OVERSEER · Weekly ─────────────────────────────────────────────────────

  {
    id: 'o-tue-telepastoring',
    category: 'counseling',
    freq: 'weekly',
    day: 'Tuesday',
    name: 'Telepastoring',
    desc: 'Call 5 members',
    appliesTo: ['overseer'],
    interaction: 'form',
    fields: [
      { id: 'count', type: 'attendance', label: 'How many members called?', required: true, flagBelow: 5 },
      { id: 'note', type: 'note', label: 'Notes (optional)', required: false },
    ],
  },
  {
    id: 'o-tue-sat',
    category: 'teaching',
    freq: 'weekly',
    day: 'Tuesday',
    name: 'SAT with Leaders',
    desc: 'Servants Armed & Trained — oversee / attend with leaders',
    appliesTo: ['overseer'],
    interaction: 'form',
    visibility: 'ensure',
    fields: [
      { id: 'attendance', type: 'attendance', label: 'How many leaders attended?', required: false },
      { id: 'note', type: 'note', label: 'Notes (optional)', required: false },
    ],
  },
  {
    id: 'o-wed-coordinate',
    category: 'prayer',
    freq: 'weekly',
    day: 'Wednesday',
    name: 'Coordinate Governorship Prayer Meetings',
    desc: 'Ensure all Governorship prayer meetings are happening',
    appliesTo: ['overseer'],
    interaction: 'form',
    visibility: 'ensure',
    fields: [
      { id: 'meetingsHeld', type: 'attendance', label: 'How many governorship prayer meetings confirmed?', required: false },
      { id: 'note', type: 'note', label: 'Any not held? Notes (optional)', required: false },
    ],
  },
  {
    id: 'o-thu-morningprayer',
    category: 'prayer',
    freq: 'weekly',
    day: 'Thursday',
    name: 'Bacenta Morning Prayers',
    desc: 'Monitor — Bacenta leaders lead this across all bacentas',
    appliesTo: ['overseer'],
    interaction: 'form',
    visibility: 'monitor',
    fields: [
      { id: 'note', type: 'note', label: 'Any issues reported? Notes (optional)', required: false },
    ],
  },
  {
    id: 'o-thu-service',
    category: 'teaching',
    freq: 'weekly',
    day: 'Thursday',
    name: 'Bacenta Service',
    desc: 'Monitor bacenta services',
    appliesTo: ['overseer'],
    interaction: 'quick',
    visibility: 'monitor',
    weekOverrides: {
      3: { name: 'Bacenta Service (Inter-Bacenta)', desc: 'Inter-bacenta format this week' },
      6: {
        name: 'Council Joint Service',
        desc: 'Attend / lead Council Joint Service',
        interaction: 'form',
        visibility: 'lead',
        fields: [
          { id: 'attendance', type: 'attendance', label: 'How many attended?', required: false },
          { id: 'photo', type: 'photo', label: 'Photo (optional)', required: false },
          { id: 'note', type: 'note', label: 'Notes / summary', required: false },
        ],
      },
    },
  },
  {
    id: 'o-sun-prayer',
    category: 'prayer',
    freq: 'weekly',
    day: 'Sunday',
    name: 'Overseer Prayer Meeting with Leaders',
    desc: 'Lead Sunday morning prayer meeting',
    appliesTo: ['overseer'],
    interaction: 'form',
    visibility: 'lead',
    fields: [
      { id: 'attendance', type: 'attendance', label: 'How many attended?', required: false },
      { id: 'note', type: 'note', label: 'Notes (optional)', required: false },
    ],
    weekOverrides: {
      2: { name: 'Benny Hinn Night — Day 2', desc: 'Ps Benny Weekend — special event', specialEvent: true, interaction: 'quick', fields: [] },
    },
  },
  {
    id: 'o-sun-counselling',
    category: 'counseling',
    freq: 'weekly',
    day: 'Sunday',
    name: 'Counselling',
    desc: 'Counsel members after church',
    appliesTo: ['overseer'],
    interaction: 'form',
    fields: [
      { id: 'count', type: 'attendance', label: 'How many counselled?', required: false },
      { id: 'note', type: 'note', label: 'Notes (optional)', required: false },
    ],
  },
  {
    // Intimate Counselling — shown every Sunday but filtered by streamRotation per cycle week.
    // streamRotation[week] = [] means no streams see it that week (skip).
    id: 'o-sun-intimate',
    category: 'counseling',
    freq: 'weekly',
    day: 'Sunday',
    name: 'Intimate Counselling',
    desc: 'Scheduled intimate counselling session — stream rotates by week',
    appliesTo: ['overseer'],
    interaction: 'form',
    streamRotation: {
      1: ['Ephesians'],
      2: [],
      3: ['Ephesians'],
      4: ['Anagkazo'],
      5: ['Anagkazo'],
      6: ['Philippians'],
    },
    fields: [
      { id: 'count', type: 'attendance', label: 'How many in the session?', required: false },
      { id: 'note', type: 'note', label: 'Notes (confidential — keep brief)', required: false },
    ],
  },

  // ── OVERSEER · Cycle — Friday ─────────────────────────────────────────────

  {
    id: 'o-fri-w1',
    category: 'prayer',
    freq: 'cycle',
    cycleWeek: 1,
    day: 'Friday',
    name: 'Governor-Led All Night',
    desc: 'Governors lead — ensure it happens across all governorships',
    appliesTo: ['overseer'],
    interaction: 'form',
    visibility: 'ensure',
    fields: [
      { id: 'note', type: 'note', label: 'Notes / any issues?', required: false },
    ],
  },
  {
    id: 'o-fri-w2',
    category: 'prayer',
    freq: 'cycle',
    cycleWeek: 2,
    day: 'Friday',
    name: 'Council All Night',
    desc: 'Ephesians + Philippians + Anagkazo — organise',
    appliesTo: ['overseer'],
    streamFilter: ['Ephesians', 'Philippians', 'Anagkazo'],
    interaction: 'form',
    visibility: 'lead',
    fields: [
      { id: 'attendance', type: 'attendance', label: 'How many attended?', required: false },
      { id: 'photo', type: 'photo', label: 'Photo (optional)', required: false },
      { id: 'note', type: 'note', label: 'Notes / summary', required: false },
    ],
  },
  {
    id: 'o-fri-w3',
    category: 'prayer',
    freq: 'cycle',
    cycleWeek: 3,
    day: 'Friday',
    name: 'Council All Night',
    desc: 'Galatians + Colossians — organise',
    appliesTo: ['overseer'],
    streamFilter: ['Galatians', 'Colossians'],
    interaction: 'form',
    visibility: 'lead',
    fields: [
      { id: 'attendance', type: 'attendance', label: 'How many attended?', required: false },
      { id: 'photo', type: 'photo', label: 'Photo (optional)', required: false },
      { id: 'note', type: 'note', label: 'Notes / summary', required: false },
    ],
  },
  {
    id: 'o-fri-w4',
    category: 'prayer',
    freq: 'cycle',
    cycleWeek: 4,
    day: 'Friday',
    name: 'Council Retreat',
    desc: 'Ephesians + Philippians + Anagkazo — organise',
    appliesTo: ['overseer'],
    streamFilter: ['Ephesians', 'Philippians', 'Anagkazo'],
    interaction: 'form',
    visibility: 'lead',
    fields: [
      { id: 'attendance', type: 'attendance', label: 'How many attended?', required: false },
      { id: 'duration', type: 'attendance', label: 'How many hours?', required: false, flagBelow: 7 },
      { id: 'note', type: 'note', label: 'Notes / summary', required: false },
      { id: 'photo', type: 'photo', label: 'Photo (optional)', required: false },
    ],
  },
  {
    id: 'o-fri-w5',
    category: 'prayer',
    freq: 'cycle',
    cycleWeek: 5,
    day: 'Friday',
    name: 'Council Retreat',
    desc: 'Galatians + Colossians — organise',
    appliesTo: ['overseer'],
    streamFilter: ['Galatians', 'Colossians'],
    interaction: 'form',
    visibility: 'lead',
    fields: [
      { id: 'attendance', type: 'attendance', label: 'How many attended?', required: false },
      { id: 'duration', type: 'attendance', label: 'How many hours?', required: false, flagBelow: 7 },
      { id: 'note', type: 'note', label: 'Notes / summary', required: false },
      { id: 'photo', type: 'photo', label: 'Photo (optional)', required: false },
    ],
  },
  {
    id: 'o-fri-w6',
    category: 'prayer',
    freq: 'cycle',
    cycleWeek: 6,
    day: 'Friday',
    name: 'Bacenta 3-Hour Prayer Meeting',
    desc: 'Bacenta leaders lead — ensure it happens across all bacentas',
    appliesTo: ['overseer'],
    interaction: 'form',
    visibility: 'ensure',
    fields: [
      { id: 'note', type: 'note', label: 'Notes / any issues?', required: false },
    ],
  },

  // ── OVERSEER · Cycle — Saturday ───────────────────────────────────────────

  {
    id: 'o-sat-w1',
    category: 'outreaches',
    freq: 'cycle',
    cycleWeek: 1,
    day: 'Saturday',
    name: 'Bacentas Outreach',
    desc: 'Monitor — Bacentas running door to door / bus stop / flyer sharing',
    appliesTo: ['overseer'],
    interaction: 'quick',
    visibility: 'monitor',
  },
  {
    id: 'o-sat-w2',
    category: 'prayer',
    freq: 'cycle',
    cycleWeek: 2,
    day: 'Saturday',
    name: 'Benny Hinn Night — Day 1',
    desc: 'Ps Benny Weekend — special event',
    appliesTo: ['overseer'],
    specialEvent: true,
    interaction: 'quick',
  },
  {
    id: 'o-sat-w3',
    category: 'outreaches',
    freq: 'cycle',
    cycleWeek: 3,
    day: 'Saturday',
    name: 'Governor Organised Outreach Day',
    desc: 'Governors lead — monitor across governorships',
    appliesTo: ['overseer'],
    interaction: 'form',
    visibility: 'monitor',
    fields: [
      { id: 'note', type: 'note', label: 'Notes / observations (optional)', required: false },
    ],
  },
  {
    id: 'o-sat-w4',
    category: 'visitation',
    freq: 'cycle',
    cycleWeek: 4,
    day: 'Saturday',
    name: 'Leaders & Married Couples Visitation',
    desc: 'Visit leaders and married couples',
    appliesTo: ['overseer'],
    interaction: 'form',
    visibility: 'lead',
    fields: [
      { id: 'leadersVisited', type: 'names', label: 'Leaders visited (one per line)', required: false },
      { id: 'couplesCount', type: 'attendance', label: 'Married couples visited', required: false },
      { id: 'concerns', type: 'note', label: 'Concerns or follow-ups?', required: false },
    ],
  },
  {
    id: 'o-sat-w5-vis',
    category: 'visitation',
    freq: 'cycle',
    cycleWeek: 5,
    day: 'Saturday',
    name: 'Leaders & Married Couples Visitation',
    desc: 'Continue visiting leaders and married couples',
    appliesTo: ['overseer'],
    interaction: 'form',
    visibility: 'lead',
    fields: [
      { id: 'leadersVisited', type: 'names', label: 'Leaders visited (one per line)', required: false },
      { id: 'couplesCount', type: 'attendance', label: 'Married couples visited', required: false },
      { id: 'concerns', type: 'note', label: 'Concerns or follow-ups?', required: false },
    ],
  },
  {
    id: 'o-sat-w5-out',
    category: 'outreaches',
    freq: 'cycle',
    cycleWeek: 5,
    day: 'Saturday',
    name: 'Bacentas Organised Outreach Day',
    desc: 'Bacentas lead — monitor across governorships',
    appliesTo: ['overseer'],
    interaction: 'form',
    visibility: 'monitor',
    fields: [
      { id: 'note', type: 'note', label: 'Notes / observations (optional)', required: false },
    ],
  },
  {
    id: 'o-sat-w6',
    category: 'outreaches',
    freq: 'cycle',
    cycleWeek: 6,
    day: 'Saturday',
    name: 'Overseer Organised Outreach Day',
    desc: 'Lead: Breakfast Meeting / Dance Outreach / Games or Movie Night',
    appliesTo: ['overseer'],
    interaction: 'form',
    visibility: 'lead',
    fields: [
      { id: 'outreachType', type: 'select', label: 'Outreach type', options: ['Breakfast Meeting', 'Dance Outreach', 'Games Night', 'Movie Night'], required: false },
      { id: 'attendance', type: 'attendance', label: 'How many attended?', required: false },
      { id: 'salvations', type: 'attendance', label: 'Salvations / first-timers?', required: false },
      { id: 'photo', type: 'photo', label: 'Photo (optional)', required: false },
      { id: 'note', type: 'note', label: 'Notes (optional)', required: false },
    ],
  },
]


// ── Helpers ──────────────────────────────────────────────────────────────

/** Get all activities visible to a given level.
 * Bishop is normalised to overseer — they share the same activity list. */
export function getActivitiesForLevel(level) {
  const l = level === 'bishop' ? 'overseer' : level
  return ACTIVITIES.filter((a) => a.appliesTo.includes(l))
}

/** Get activities for a specific category + level */
export function getActivitiesByCategoryAndLevel(categoryId, level) {
  const l = level === 'bishop' ? 'overseer' : level
  return ACTIVITIES.filter(
    (a) => a.category === categoryId && a.appliesTo.includes(l),
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
