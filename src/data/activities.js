// src/data/activities.js
// All PVCIO activity definitions.
// Each activity has: id, category, level, name, freq, desc, fields[]
//
// Field types:
//   attendance  — number input (how many people attended)
//   names       — multi-line text or tag input (list of names)
//   bacentas    — checklist of bacentas under this governor (populated from leaders.js)
//   issueType   — select: "General" | "Critical"
//   note        — free text, always optional
//   photo       — image capture/upload, always optional
//                 TODO: currently stored as base64 — swap to file upload API when backend ready

export const CATEGORIES = [
  { id: 'prayer',     label: 'Prayer',      icon: '🙏', color: '#2DD4BF', bg: 'rgba(45,212,191,.1)'  },
  { id: 'visitation', label: 'Visitation',  icon: '🏠', color: '#34D399', bg: 'rgba(52,211,153,.1)'  },
  { id: 'counseling', label: 'Counseling',  icon: '💬', color: '#A78BFA', bg: 'rgba(167,139,250,.1)' },
  { id: 'teaching',   label: 'Teaching',    icon: '📖', color: '#E8A830', bg: 'rgba(232,168,48,.1)'  },
  { id: 'outreaches', label: 'Outreaches',  icon: '🌍', color: '#F87060', bg: 'rgba(248,112,96,.1)'  },
];

// freq: 'weekly' | 'monthly' | 'flexible'
// level: 'bacenta' | 'governorship' | 'oversight'
// fields: ordered list of field definitions for the log form

export const ACTIVITIES = [

  // ─────────────────────────────────────────────
  // PRAYER
  // ─────────────────────────────────────────────
  {
    id: 'p1',
    category: 'prayer',
    level: 'bacenta',
    freq: 'weekly',
    name: 'Bacenta Prayer Meeting',
    desc: 'Thursday mornings',
    fields: [
      { id: 'attendance', type: 'attendance', label: 'How many attended?', required: true },
      { id: 'note',       type: 'note',       label: 'Notes (optional)',   required: false },
      { id: 'photo',      type: 'photo',      label: 'Photo (optional)',   required: false },
    ],
  },
  {
    id: 'p2',
    category: 'prayer',
    level: 'governorship',
    freq: 'weekly',
    name: 'Governorship Prayer Meeting',
    desc: 'Wednesday mornings',
    fields: [
      { id: 'attendance', type: 'attendance', label: 'How many attended?', required: true },
      { id: 'note',       type: 'note',       label: 'Notes (optional)',   required: false },
      { id: 'photo',      type: 'photo',      label: 'Photo (optional)',   required: false },
    ],
  },
  {
    id: 'p3',
    category: 'prayer',
    level: 'governorship',
    freq: 'weekly',
    name: 'Governor + Bacenta Leaders Prayer',
    desc: 'Sundays',
    fields: [
      { id: 'attendance', type: 'attendance', label: 'How many leaders attended?', required: true },
      { id: 'note',       type: 'note',       label: 'Notes (optional)',           required: false },
    ],
  },
  {
    id: 'p4',
    category: 'prayer',
    level: 'bacenta',
    freq: 'monthly',
    name: 'Bacenta All Night Prayer Meeting',
    desc: 'Once per month',
    fields: [
      { id: 'attendance', type: 'attendance', label: 'How many attended?', required: true },
      { id: 'note',       type: 'note',       label: 'Notes (optional)',   required: false },
      { id: 'photo',      type: 'photo',      label: 'Photo (optional)',   required: false },
    ],
  },
  {
    id: 'p5',
    category: 'prayer',
    level: 'governorship',
    freq: 'monthly',
    name: 'Governorship All Night Prayer Meeting',
    desc: 'Once per month',
    fields: [
      { id: 'attendance', type: 'attendance', label: 'How many attended?', required: true },
      { id: 'note',       type: 'note',       label: 'Notes (optional)',   required: false },
      { id: 'photo',      type: 'photo',      label: 'Photo (optional)',   required: false },
    ],
  },
  {
    id: 'p6',
    category: 'prayer',
    level: 'oversight',
    freq: 'monthly',
    name: 'Oversight All Night Prayer Meeting',
    desc: 'Once per month',
    fields: [
      { id: 'attendance', type: 'attendance', label: 'How many attended?', required: true },
      { id: 'note',       type: 'note',       label: 'Notes (optional)',   required: false },
      { id: 'photo',      type: 'photo',      label: 'Photo (optional)',   required: false },
    ],
  },
  {
    id: 'p7',
    category: 'prayer',
    level: 'oversight',
    freq: 'flexible',
    name: 'Oversight Retreat',
    desc: 'One-off — log when it happens',
    fields: [
      { id: 'attendance', type: 'attendance', label: 'How many attended?', required: true },
      { id: 'note',       type: 'note',       label: 'Notes / summary',    required: false },
      { id: 'photo',      type: 'photo',      label: 'Photo (optional)',   required: false },
    ],
  },

  // ─────────────────────────────────────────────
  // VISITATION
  // ─────────────────────────────────────────────
  {
    id: 'v1',
    category: 'visitation',
    level: 'bacenta',
    freq: 'monthly',
    name: 'Bacenta Members Visited',
    desc: 'Log each visitation round',
    fields: [
      { id: 'visitedCount', type: 'attendance', label: 'How many members visited?',    required: true },
      { id: 'visitedNames', type: 'names',      label: 'Names visited (one per line)', required: false },
      { id: 'concerns',     type: 'note',       label: 'Any concerns or follow-ups?',  required: false },
    ],
  },
  {
    id: 'v2',
    category: 'visitation',
    level: 'governorship',
    freq: 'monthly',
    name: 'Governorship Members Visited',
    desc: 'Log each visitation round',
    fields: [
      { id: 'visitedCount', type: 'attendance', label: 'How many members visited?',    required: true },
      { id: 'visitedNames', type: 'names',      label: 'Names visited (one per line)', required: false },
      { id: 'concerns',     type: 'note',       label: 'Any concerns or follow-ups?',  required: false },
    ],
  },
  {
    id: 'v3',
    category: 'visitation',
    level: 'governorship',
    freq: 'monthly',
    name: 'Bacenta Leaders Visited',
    desc: 'Governor visits bacenta leaders',
    fields: [
      { id: 'visitedNames', type: 'names', label: 'Which bacenta leaders were visited? (one per line)', required: true },
      { id: 'concerns',     type: 'note',  label: 'Any concerns or follow-ups?',                       required: false },
    ],
  },
  {
    id: 'v4',
    category: 'visitation',
    level: 'oversight',
    freq: 'monthly',
    name: 'Governors Visited',
    desc: 'Overseer visits governors',
    fields: [
      { id: 'visitedNames', type: 'names', label: 'Which governors were visited? (one per line)', required: true },
      { id: 'concerns',     type: 'note',  label: 'Any concerns or follow-ups?',                 required: false },
    ],
  },
  {
    id: 'v5',
    category: 'visitation',
    level: 'oversight',
    freq: 'monthly',
    name: 'Married Couples Visited',
    desc: 'Stream leader check',
    fields: [
      { id: 'visitedCount', type: 'attendance', label: 'How many couples visited?',              required: true },
      { id: 'visitedNames', type: 'names',      label: 'Couple names (one per line, optional)',  required: false },
      { id: 'concerns',     type: 'note',       label: 'Any concerns or follow-ups?',            required: false },
    ],
  },

  // ─────────────────────────────────────────────
  // COUNSELING & INTERACTION
  // ─────────────────────────────────────────────
  {
    id: 'c1',
    category: 'counseling',
    level: 'bacenta',
    freq: 'monthly',
    name: 'Counseling with Intimate Counselors',
    desc: 'Scheduled counseling sessions',
    fields: [
      { id: 'sessionCount', type: 'attendance', label: 'How many sessions held?',              required: true },
      { id: 'note',         type: 'note',       label: 'Notes (keep confidential details off record)', required: false },
    ],
  },
  {
    id: 'c2',
    category: 'counseling',
    level: 'governorship',
    freq: 'weekly',
    name: 'Governors Counseling Bacenta Members',
    desc: 'Sundays after church',
    fields: [
      { id: 'counseledCount', type: 'attendance', label: 'How many people counseled?', required: true },
      { id: 'note',           type: 'note',       label: 'General notes (optional)',   required: false },
    ],
  },
  {
    id: 'c3',
    category: 'counseling',
    level: 'governorship',
    freq: 'flexible',
    name: 'Gov/Leaders Counseling with BGee',
    desc: 'Critical member issues',
    fields: [
      { id: 'issueType',      type: 'issueType',  label: 'Issue type',                required: true },
      { id: 'counseledCount', type: 'attendance', label: 'How many people involved?', required: true },
      { id: 'note',           type: 'note',       label: 'Summary (keep brief)',       required: false },
    ],
  },
  {
    id: 'c4',
    category: 'counseling',
    level: 'governorship',
    freq: 'weekly',
    name: 'Telepastoring',
    desc: 'Tuesdays',
    fields: [
      { id: 'contactCount', type: 'attendance', label: 'How many members contacted?', required: true },
      { id: 'note',         type: 'note',       label: 'Notes (optional)',            required: false },
    ],
  },

  // ─────────────────────────────────────────────
  // TEACHING
  // ─────────────────────────────────────────────
  {
    id: 't1',
    category: 'teaching',
    level: 'governorship',
    freq: 'monthly',
    name: 'Governors Preached at All Bacentas',
    desc: 'No governor skips a month',
    fields: [
      // BacentaChecklistField is populated from leaders.js using the user's governorship id
      { id: 'bacentasPreached', type: 'bacentas', label: 'Which bacentas did you preach at this month?', required: true },
      { id: 'note',             type: 'note',     label: 'Notes (optional)',                             required: false },
    ],
  },
  {
    id: 't2',
    category: 'teaching',
    level: 'oversight',
    freq: 'flexible',
    name: 'Oversight SATs',
    desc: 'Log when it happens',
    fields: [
      { id: 'attendance', type: 'attendance', label: 'How many attended?', required: true },
      { id: 'note',       type: 'note',       label: 'Summary / notes',   required: false },
      { id: 'photo',      type: 'photo',      label: 'Photo (optional)',   required: false },
    ],
  },

  // ─────────────────────────────────────────────
  // OUTREACHES — BACENTA LEVEL
  // ─────────────────────────────────────────────
  {
    id: 'o1',
    category: 'outreaches',
    level: 'bacenta',
    freq: 'monthly',
    name: 'Breakfast Meeting',
    desc: 'Bacenta level',
    fields: [
      { id: 'attendance', type: 'attendance', label: 'How many attended?',         required: true },
      { id: 'salvations', type: 'attendance', label: 'Salvations / first-timers?', required: false },
      { id: 'note',       type: 'note',       label: 'Notes (optional)',           required: false },
      { id: 'photo',      type: 'photo',      label: 'Photo (optional)',           required: false },
    ],
  },
  {
    id: 'o2',
    category: 'outreaches',
    level: 'bacenta',
    freq: 'monthly',
    name: 'Dance Outreach',
    desc: 'Bacenta level',
    fields: [
      { id: 'attendance', type: 'attendance', label: 'How many attended?',         required: true },
      { id: 'salvations', type: 'attendance', label: 'Salvations / first-timers?', required: false },
      { id: 'note',       type: 'note',       label: 'Notes (optional)',           required: false },
      { id: 'photo',      type: 'photo',      label: 'Photo (optional)',           required: false },
    ],
  },
  {
    id: 'o3',
    category: 'outreaches',
    level: 'bacenta',
    freq: 'monthly',
    name: 'Indoor Meeting',
    desc: 'Bacenta level',
    fields: [
      { id: 'attendance', type: 'attendance', label: 'How many attended?', required: true },
      { id: 'note',       type: 'note',       label: 'Notes (optional)',   required: false },
      { id: 'photo',      type: 'photo',      label: 'Photo (optional)',   required: false },
    ],
  },
  {
    id: 'o4',
    category: 'outreaches',
    level: 'bacenta',
    freq: 'monthly',
    name: 'Door-to-Door Outreach',
    desc: 'Bacenta level',
    fields: [
      { id: 'housesVisited', type: 'attendance', label: 'How many houses visited?',    required: true },
      { id: 'salvations',    type: 'attendance', label: 'Salvations / acceptances?',   required: false },
      { id: 'note',          type: 'note',       label: 'Notes (optional)',            required: false },
    ],
  },
  {
    id: 'o5',
    category: 'outreaches',
    level: 'bacenta',
    freq: 'monthly',
    name: 'Inter-Bacenta Service',
    desc: 'Bacenta level',
    fields: [
      { id: 'attendance', type: 'attendance', label: 'How many attended?',        required: true },
      { id: 'note',       type: 'note',       label: 'Which bacentas joined?',    required: false },
      { id: 'photo',      type: 'photo',      label: 'Photo (optional)',          required: false },
    ],
  },
  {
    id: 'o6',
    category: 'outreaches',
    level: 'bacenta',
    freq: 'monthly',
    name: 'Movie & Games Night',
    desc: 'Bacenta level',
    fields: [
      { id: 'attendance', type: 'attendance', label: 'How many attended?',         required: true },
      { id: 'salvations', type: 'attendance', label: 'Salvations / first-timers?', required: false },
      { id: 'note',       type: 'note',       label: 'Notes (optional)',           required: false },
      { id: 'photo',      type: 'photo',      label: 'Photo (optional)',           required: false },
    ],
  },

  // ─────────────────────────────────────────────
  // OUTREACHES — GOVERNORSHIP LEVEL
  // ─────────────────────────────────────────────
  {
    id: 'o7',
    category: 'outreaches',
    level: 'governorship',
    freq: 'monthly',
    name: 'Breakfast Meeting',
    desc: 'Governorship level',
    fields: [
      { id: 'attendance', type: 'attendance', label: 'How many attended?',         required: true },
      { id: 'salvations', type: 'attendance', label: 'Salvations / first-timers?', required: false },
      { id: 'note',       type: 'note',       label: 'Notes (optional)',           required: false },
      { id: 'photo',      type: 'photo',      label: 'Photo (optional)',           required: false },
    ],
  },
  {
    id: 'o8',
    category: 'outreaches',
    level: 'governorship',
    freq: 'monthly',
    name: 'Dance Outreach',
    desc: 'Governorship level',
    fields: [
      { id: 'attendance', type: 'attendance', label: 'How many attended?',         required: true },
      { id: 'salvations', type: 'attendance', label: 'Salvations / first-timers?', required: false },
      { id: 'note',       type: 'note',       label: 'Notes (optional)',           required: false },
      { id: 'photo',      type: 'photo',      label: 'Photo (optional)',           required: false },
    ],
  },
  {
    id: 'o9',
    category: 'outreaches',
    level: 'governorship',
    freq: 'monthly',
    name: 'Indoor Meeting',
    desc: 'Governorship level',
    fields: [
      { id: 'attendance', type: 'attendance', label: 'How many attended?', required: true },
      { id: 'note',       type: 'note',       label: 'Notes (optional)',   required: false },
      { id: 'photo',      type: 'photo',      label: 'Photo (optional)',   required: false },
    ],
  },
  {
    id: 'o10',
    category: 'outreaches',
    level: 'governorship',
    freq: 'monthly',
    name: 'Movie Night',
    desc: 'Governorship level',
    fields: [
      { id: 'attendance', type: 'attendance', label: 'How many attended?',         required: true },
      { id: 'salvations', type: 'attendance', label: 'Salvations / first-timers?', required: false },
      { id: 'note',       type: 'note',       label: 'Notes (optional)',           required: false },
      { id: 'photo',      type: 'photo',      label: 'Photo (optional)',           required: false },
    ],
  },
  {
    id: 'o11',
    category: 'outreaches',
    level: 'governorship',
    freq: 'monthly',
    name: 'Inter-Governorship Service',
    desc: 'Governorship level',
    fields: [
      { id: 'attendance', type: 'attendance', label: 'How many attended?',           required: true },
      { id: 'note',       type: 'note',       label: 'Which governorships joined?',  required: false },
      { id: 'photo',      type: 'photo',      label: 'Photo (optional)',             required: false },
    ],
  },

  // ─────────────────────────────────────────────
  // OUTREACHES — OVERSIGHT LEVEL
  // ─────────────────────────────────────────────
  {
    id: 'o12',
    category: 'outreaches',
    level: 'oversight',
    freq: 'monthly',
    name: 'Breakfast Meeting',
    desc: 'Oversight level',
    fields: [
      { id: 'attendance', type: 'attendance', label: 'How many attended?',         required: true },
      { id: 'salvations', type: 'attendance', label: 'Salvations / first-timers?', required: false },
      { id: 'note',       type: 'note',       label: 'Notes (optional)',           required: false },
      { id: 'photo',      type: 'photo',      label: 'Photo (optional)',           required: false },
    ],
  },
  {
    id: 'o13',
    category: 'outreaches',
    level: 'oversight',
    freq: 'monthly',
    name: 'Dance Outreach',
    desc: 'Oversight level',
    fields: [
      { id: 'attendance', type: 'attendance', label: 'How many attended?',         required: true },
      { id: 'salvations', type: 'attendance', label: 'Salvations / first-timers?', required: false },
      { id: 'note',       type: 'note',       label: 'Notes (optional)',           required: false },
      { id: 'photo',      type: 'photo',      label: 'Photo (optional)',           required: false },
    ],
  },
  {
    id: 'o14',
    category: 'outreaches',
    level: 'oversight',
    freq: 'monthly',
    name: 'Indoor Meeting',
    desc: 'Oversight level',
    fields: [
      { id: 'attendance', type: 'attendance', label: 'How many attended?', required: true },
      { id: 'note',       type: 'note',       label: 'Notes (optional)',   required: false },
      { id: 'photo',      type: 'photo',      label: 'Photo (optional)',   required: false },
    ],
  },
  {
    id: 'o15',
    category: 'outreaches',
    level: 'oversight',
    freq: 'monthly',
    name: 'Door-to-Door Outreach',
    desc: 'Oversight level',
    fields: [
      { id: 'housesVisited', type: 'attendance', label: 'How many houses visited?',  required: true },
      { id: 'salvations',    type: 'attendance', label: 'Salvations / acceptances?', required: false },
      { id: 'note',          type: 'note',       label: 'Notes (optional)',          required: false },
    ],
  },
  {
    id: 'o16',
    category: 'outreaches',
    level: 'oversight',
    freq: 'monthly',
    name: 'Movie & Games Night',
    desc: 'Oversight level',
    fields: [
      { id: 'attendance', type: 'attendance', label: 'How many attended?',         required: true },
      { id: 'salvations', type: 'attendance', label: 'Salvations / first-timers?', required: false },
      { id: 'note',       type: 'note',       label: 'Notes (optional)',           required: false },
      { id: 'photo',      type: 'photo',      label: 'Photo (optional)',           required: false },
    ],
  },
];

// ── Helpers ──────────────────────────────────────────────────────────────

/** Get all activities visible to a given level */
export function getActivitiesForLevel(level) {
  return ACTIVITIES.filter(a => a.level === level);
}

/** Get activities for a specific category + level */
export function getActivitiesByCategoryAndLevel(categoryId, level) {
  return ACTIVITIES.filter(a => a.category === categoryId && a.level === level);
}

/** Get a single activity by id */
export function getActivityById(id) {
  return ACTIVITIES.find(a => a.id === id);
}

/** Get category metadata by id */
export function getCategoryById(id) {
  return CATEGORIES.find(c => c.id === id);
}

/** Group activities by freq for display */
export function groupByFreq(activities) {
  const groups = { weekly: [], monthly: [], flexible: [] };
  activities.forEach(a => { if (groups[a.freq]) groups[a.freq].push(a); });
  return groups;
}
