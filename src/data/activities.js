// src/data/activities.js
// All PVCIO activity definitions — 6-week calendar model.
//
// Each activity has:
//   id, category, name, desc, freq, appliesTo[], fields[]
//   Optional: cycleWeek (for freq:'cycle'), day, minimumByLevel
//
// Field types:
//   attendance  — number input (how many attended). flagBelow highlights red if under threshold.
//   names       — multi-line textarea, one name per line
//   select      — large tap-target button group (not a dropdown)
//   bacentas    — checklist of bacentas under this governor (populated from leaders.js)
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

export const CATEGORIES = [
  { id: 'prayer',     label: 'Prayer',      icon: '🙏', color: '#2DD4BF', bg: 'rgba(45,212,191,.1)'  },
  { id: 'visitation', label: 'Visitation',  icon: '🏠', color: '#34D399', bg: 'rgba(52,211,153,.1)'  },
  { id: 'counseling', label: 'Counseling',  icon: '💬', color: '#A78BFA', bg: 'rgba(167,139,250,.1)' },
  { id: 'teaching',   label: 'Teaching',    icon: '📖', color: '#E8A830', bg: 'rgba(232,168,48,.1)'  },
  { id: 'outreaches', label: 'Outreaches',  icon: '🌍', color: '#F87060', bg: 'rgba(248,112,96,.1)'  },
];

export const ACTIVITIES = [

  // ═══════════════════════════════════════════════
  // RECURRING — every week, all applicable levels
  // ═══════════════════════════════════════════════

  {
    id: 'rec1',
    category: 'counseling',
    freq: 'weekly',
    day: 'Tuesday',
    name: 'Telepastoring',
    desc: 'Every leader calls ≥5 members',
    appliesTo: ['bacenta', 'governorship', 'overseer', 'bishop'],
    fields: [
      { id: 'count', type: 'attendance', label: 'How many members did you call?', required: true, min: 5, flagBelow: 5 },
      { id: 'note',  type: 'note',       label: 'Notes (optional)',              required: false },
    ],
  },
  {
    id: 'rec2',
    category: 'prayer',
    freq: 'weekly',
    day: 'Wednesday',
    name: 'Governorship Prayer Meeting',
    desc: 'Remind Bacenta leaders of Thursday prayer; address Sunday matters',
    appliesTo: ['governorship', 'overseer', 'bishop'],
    fields: [
      { id: 'attendance', type: 'attendance', label: 'How many attended?', required: true },
      { id: 'note',       type: 'note',       label: 'Notes (optional)',   required: false },
    ],
  },
  {
    id: 'rec3',
    category: 'prayer',
    freq: 'weekly',
    day: 'Thursday',
    name: 'Bacenta Morning Prayer',
    desc: 'All members',
    appliesTo: ['bacenta', 'governorship', 'overseer', 'bishop'],
    fields: [
      { id: 'attendance', type: 'attendance', label: 'How many attended?', required: true },
      { id: 'note',       type: 'note',       label: 'Notes (optional)',   required: false },
      { id: 'photo',      type: 'photo',      label: 'Photo (optional)',   required: false },
    ],
  },
  {
    id: 'rec4',
    category: 'prayer',
    freq: 'weekly',
    day: 'Sunday',
    name: 'Sunday Morning Prayer (Lead)',
    desc: 'Overseers lead Sunday Morning Prayer — all churches, Governors & Bacentas',
    appliesTo: ['overseer', 'bishop'],
    fields: [
      { id: 'attendance', type: 'attendance', label: 'How many attended across all churches?', required: true },
      { id: 'note',       type: 'note',       label: 'Notes (optional)',                       required: false },
    ],
  },
  {
    id: 'rec5',
    category: 'counseling',
    freq: 'weekly',
    day: 'Sunday',
    name: 'Post-Church Counseling',
    desc: 'Governors: ≥3 members · Overseers: ≥3 Governors/Bacenta leaders · Bishop: ≥5',
    appliesTo: ['governorship', 'overseer', 'bishop'],
    minimumByLevel: { governorship: 3, overseer: 3, bishop: 5 },
    fields: [
      { id: 'count', type: 'attendance', label: 'How many did you counsel?', required: true, flagBelow: 'minimumByLevel' },
      { id: 'note',  type: 'note',       label: 'Notes (optional)',          required: false },
    ],
  },

  // ═══════════════════════════════════════════════
  // ONCE-PER-CYCLE — Week 1: Prayer
  // ═══════════════════════════════════════════════

  {
    id: 'sp1',
    category: 'prayer',
    freq: 'cycle',
    cycleWeek: 1,
    day: 'Friday',
    name: 'Bacenta Half-Night Prayer',
    desc: 'In the community (once in 6 weeks)',
    appliesTo: ['bacenta', 'governorship', 'overseer', 'bishop'],
    fields: [
      { id: 'attendance', type: 'attendance', label: 'How many attended?', required: true },
      { id: 'note',       type: 'note',       label: 'Notes (optional)',   required: false },
      { id: 'photo',      type: 'photo',      label: 'Photo (optional)',   required: false },
    ],
  },
  {
    id: 'sp2',
    category: 'prayer',
    freq: 'cycle',
    cycleWeek: 1,
    day: 'Wednesday',
    name: 'Governorship Prayer Meeting — At the Centre',
    desc: 'Once in 6 weeks — replaces standard Wednesday meeting this week',
    appliesTo: ['governorship', 'overseer', 'bishop'],
    fields: [
      { id: 'attendance', type: 'attendance', label: 'How many attended?', required: true },
      { id: 'note',       type: 'note',       label: 'Notes (optional)',   required: false },
    ],
  },
  {
    id: 'sp3',
    category: 'prayer',
    freq: 'cycle',
    cycleWeek: 1,
    day: 'Thursday',
    name: 'Overseers Prayer Meeting',
    desc: 'At the centre or community (once in 6 weeks)',
    appliesTo: ['overseer', 'bishop'],
    fields: [
      { id: 'attendance', type: 'attendance', label: 'How many attended?', required: true },
      { id: 'note',       type: 'note',       label: 'Notes (optional)',   required: false },
    ],
  },
  {
    id: 'sp4',
    category: 'prayer',
    freq: 'cycle',
    cycleWeek: 1,
    day: 'Friday',
    name: 'Retreat in Mampong',
    desc: 'Minimum 7 hours (once in 6 weeks)',
    appliesTo: ['overseer', 'bishop'],
    fields: [
      { id: 'duration',   type: 'attendance', label: 'How many hours?',    required: true, min: 7, flagBelow: 7 },
      { id: 'attendance', type: 'attendance', label: 'How many attended?', required: true },
      { id: 'note',       type: 'note',       label: 'Notes / summary',    required: false },
      { id: 'photo',      type: 'photo',      label: 'Photo (optional)',   required: false },
    ],
  },

  // ═══════════════════════════════════════════════
  // ONCE-PER-CYCLE — Weeks 2 & 3: Visitation
  // ═══════════════════════════════════════════════

  {
    id: 'sv1',
    category: 'visitation',
    freq: 'cycle',
    cycleWeek: 2,
    day: 'Saturday',
    name: "Bacenta Leaders' Visitation Saturday",
    desc: 'Once in 6 weeks — Bacenta leaders visit their members',
    appliesTo: ['bacenta'],
    fields: [
      { id: 'visitedCount', type: 'attendance', label: 'How many members visited?',   required: true },
      { id: 'visitedNames', type: 'names',      label: 'Names visited (one per line)', required: false },
      { id: 'concerns',     type: 'note',       label: 'Concerns or follow-ups?',      required: false },
      { id: 'photo',        type: 'photo',      label: 'Photo (optional)',             required: false },
    ],
  },
  {
    id: 'sv2',
    category: 'visitation',
    freq: 'cycle',
    cycleWeek: 2,
    day: 'Saturday',
    name: 'Overseers Visitation',
    desc: 'Visit Governors, Bacenta leaders, married couples & members with special circumstances (Weeks 2–3)',
    appliesTo: ['overseer', 'bishop'],
    fields: [
      { id: 'governorsVisited', type: 'names',      label: 'Governors visited',                         required: false },
      { id: 'leadersVisited',   type: 'names',      label: 'Bacenta leaders visited',                   required: false },
      { id: 'couplesCount',     type: 'attendance', label: 'Married couples visited',                   required: false },
      { id: 'specialCount',     type: 'attendance', label: 'Members with special circumstances visited', required: false },
      { id: 'concerns',         type: 'note',       label: 'Concerns or follow-ups?',                   required: false },
    ],
  },
  {
    id: 'sv3',
    category: 'visitation',
    freq: 'cycle',
    cycleWeek: 3,
    day: 'Saturday',
    name: "Governors' Visitation Saturday",
    desc: 'Once in 6 weeks — Governors visit their bacenta leaders and members',
    appliesTo: ['governorship'],
    fields: [
      { id: 'visitedCount', type: 'attendance', label: 'How many visited?',            required: true },
      { id: 'visitedNames', type: 'names',      label: 'Names visited (one per line)', required: false },
      { id: 'concerns',     type: 'note',       label: 'Concerns or follow-ups?',      required: false },
    ],
  },

  // ═══════════════════════════════════════════════
  // ONCE-PER-CYCLE — Week 4: Counseling
  // ═══════════════════════════════════════════════

  {
    id: 'sc1',
    category: 'counseling',
    freq: 'cycle',
    cycleWeek: 4,
    day: 'Wednesday',
    name: 'Mid-Week Check-In',
    desc: 'Governors check in with members; Overseers with Governors/Bacenta leaders',
    appliesTo: ['governorship', 'overseer', 'bishop'],
    fields: [
      { id: 'count', type: 'attendance', label: 'How many did you check in with?', required: true },
      { id: 'note',  type: 'note',       label: 'Notes (optional)',                required: false },
    ],
  },
  {
    id: 'sc2',
    category: 'counseling',
    freq: 'cycle',
    cycleWeek: 4,
    day: 'Saturday',
    name: 'Extended Counseling Sessions',
    desc: 'Members with special circumstances, couples & follow-ups',
    appliesTo: ['governorship', 'overseer', 'bishop'],
    fields: [
      { id: 'sessionCount', type: 'attendance', label: 'How many sessions held?',                   required: true },
      { id: 'issueType',    type: 'issueType',  label: 'Issue type (general / critical)',            required: true },
      { id: 'note',         type: 'note',       label: 'Summary (keep brief, no sensitive details)', required: false },
    ],
  },

  // ═══════════════════════════════════════════════
  // ONCE-PER-CYCLE — Week 5: Teaching
  // ═══════════════════════════════════════════════

  {
    id: 'st1',
    category: 'teaching',
    freq: 'cycle',
    cycleWeek: 5,
    day: 'Tuesday',
    name: 'Oversight SATs',
    desc: 'As and when scheduled — log when it happens',
    appliesTo: ['overseer', 'bishop'],
    fields: [
      { id: 'attendance', type: 'attendance', label: 'How many attended?', required: true },
      { id: 'note',       type: 'note',       label: 'Notes / summary',   required: false },
      { id: 'photo',      type: 'photo',      label: 'Photo (optional)',   required: false },
    ],
  },
  {
    id: 'st2',
    category: 'teaching',
    freq: 'cycle',
    cycleWeek: 5,
    day: 'Thursday',
    name: 'Inter-Bacenta Service',
    desc: 'Once in 6 weeks',
    appliesTo: ['bacenta', 'governorship'],
    fields: [
      { id: 'attendance',     type: 'attendance', label: 'How many attended?',    required: true },
      { id: 'bacentasJoined', type: 'names',      label: 'Which bacentas joined?', required: false },
      { id: 'note',           type: 'note',       label: 'Notes (optional)',       required: false },
      { id: 'photo',          type: 'photo',      label: 'Photo (optional)',       required: false },
    ],
  },
  {
    id: 'st3',
    category: 'teaching',
    freq: 'cycle',
    cycleWeek: 5,
    day: 'Saturday',
    name: 'Council Joint Service with Overseer',
    desc: 'Once in 6 weeks',
    appliesTo: ['overseer', 'bishop'],
    fields: [
      { id: 'attendance', type: 'attendance', label: 'How many attended?', required: true },
      { id: 'note',       type: 'note',       label: 'Notes / summary',   required: false },
      { id: 'photo',      type: 'photo',      label: 'Photo (optional)',   required: false },
    ],
  },
  {
    id: 'st4',
    category: 'teaching',
    freq: 'cycle',
    cycleWeek: 5,
    day: 'Saturday',
    name: 'Governorship Joint Service',
    desc: 'Once in 6 weeks',
    appliesTo: ['governorship', 'overseer', 'bishop'],
    fields: [
      { id: 'attendance', type: 'attendance', label: 'How many attended?', required: true },
      { id: 'note',       type: 'note',       label: 'Notes (optional)',   required: false },
      { id: 'photo',      type: 'photo',      label: 'Photo (optional)',   required: false },
    ],
  },
  {
    id: 'st5',
    category: 'teaching',
    freq: 'cycle',
    cycleWeek: 5,
    day: 'Sunday',
    name: 'Inter-Overseer Service',
    desc: 'Once in 6 weeks',
    appliesTo: ['overseer', 'bishop'],
    fields: [
      { id: 'attendance', type: 'attendance', label: 'How many attended?', required: true },
      { id: 'note',       type: 'note',       label: 'Notes / summary',   required: false },
      { id: 'photo',      type: 'photo',      label: 'Photo (optional)',   required: false },
    ],
  },

  // ═══════════════════════════════════════════════
  // ONCE-PER-CYCLE — Week 6: Outreaches
  // ═══════════════════════════════════════════════

  {
    id: 'so1',
    category: 'outreaches',
    freq: 'cycle',
    cycleWeek: 6,
    day: 'Saturday',
    name: 'Bacenta Level Outreach',
    desc: 'Choose one: dance outreach / breakfast meeting / movie or games night',
    appliesTo: ['bacenta'],
    fields: [
      { id: 'outreachType', type: 'select',     label: 'Which outreach?',           required: true,
        options: ['Dance Outreach', 'Breakfast Meeting', 'Movie Night', 'Games Night'] },
      { id: 'attendance',   type: 'attendance', label: 'How many attended?',         required: true },
      { id: 'salvations',   type: 'attendance', label: 'Salvations / first-timers?', required: false },
      { id: 'note',         type: 'note',       label: 'Notes (optional)',           required: false },
      { id: 'photo',        type: 'photo',      label: 'Photo (optional)',           required: false },
    ],
  },
  {
    id: 'so2',
    category: 'outreaches',
    freq: 'cycle',
    cycleWeek: 6,
    day: 'Saturday',
    name: 'Governorship Level Outreach',
    desc: 'Choose one: dance outreach / breakfast meeting / movie or games night',
    appliesTo: ['governorship'],
    fields: [
      { id: 'outreachType', type: 'select',     label: 'Which outreach?',           required: true,
        options: ['Dance Outreach', 'Breakfast Meeting', 'Movie Night', 'Games Night'] },
      { id: 'attendance',   type: 'attendance', label: 'How many attended?',         required: true },
      { id: 'salvations',   type: 'attendance', label: 'Salvations / first-timers?', required: false },
      { id: 'note',         type: 'note',       label: 'Notes (optional)',           required: false },
      { id: 'photo',        type: 'photo',      label: 'Photo (optional)',           required: false },
    ],
  },
  {
    id: 'so3',
    category: 'outreaches',
    freq: 'cycle',
    cycleWeek: 6,
    day: 'Saturday',
    name: 'Oversight Level Outreach',
    desc: 'Choose one: dance outreach / breakfast meeting / movie or games night',
    appliesTo: ['overseer', 'bishop'],
    fields: [
      { id: 'outreachType', type: 'select',     label: 'Which outreach?',           required: true,
        options: ['Dance Outreach', 'Breakfast Meeting', 'Movie Night', 'Games Night'] },
      { id: 'attendance',   type: 'attendance', label: 'How many attended?',         required: true },
      { id: 'salvations',   type: 'attendance', label: 'Salvations / first-timers?', required: false },
      { id: 'note',         type: 'note',       label: 'Notes (optional)',           required: false },
      { id: 'photo',        type: 'photo',      label: 'Photo (optional)',           required: false },
    ],
  },

  // ═══════════════════════════════════════════════
  // Teaching — Governors Preach at Bacentas
  // (monthly cycle — keep from previous schema)
  // ═══════════════════════════════════════════════

  {
    id: 't1',
    category: 'teaching',
    freq: 'weekly',
    day: null,
    name: 'Governors Preached at All Bacentas',
    desc: 'No governor skips a month — log each preaching visit',
    appliesTo: ['governorship', 'overseer', 'bishop'],
    fields: [
      { id: 'bacentasPreached', type: 'bacentas', label: 'Which bacentas did you preach at?', required: true },
      { id: 'note',             type: 'note',     label: 'Notes (optional)',                   required: false },
    ],
  },

];

// ── Helpers ──────────────────────────────────────────────────────────────

/** Get all activities visible to a given level */
export function getActivitiesForLevel(level) {
  return ACTIVITIES.filter(a => a.appliesTo.includes(level));
}

/** Get activities for a specific category + level */
export function getActivitiesByCategoryAndLevel(categoryId, level) {
  return ACTIVITIES.filter(a => a.category === categoryId && a.appliesTo.includes(level));
}

/** Get a single activity by id */
export function getActivityById(id) {
  return ACTIVITIES.find(a => a.id === id);
}

/** Get category metadata by id */
export function getCategoryById(id) {
  return CATEGORIES.find(c => c.id === id);
}

/**
 * Group activities by freq for display.
 * Returns: { weekly: [...], cycle: [...] }
 */
export function groupByFreq(activities) {
  const groups = { weekly: [], cycle: [] };
  activities.forEach(a => {
    if (groups[a.freq]) groups[a.freq].push(a);
    else groups[a.freq] = [a];
  });
  return groups;
}
