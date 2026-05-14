# PVCIO Monitor — Official Calendar Context
## Source: Cal_BacentaLeader_Edited.pdf, Cal_GovLeader_Edited.pdf, Cal_OverLeader_Edited.pdf
## Organisation: First Love Church
## Period: May 12 – June 22, 2026 (6-week cycle)
## Replaces: CALENDAR_ACTIVITIES_CONTEXT_V2.md

---

## Organisation Name

**First Love Church** — use this name in the UI, not "Colossians Stream".

---

## Streams (Councils)

The church has multiple streams/councils. Stream membership comes from the
user's login profile/JWT — add a `stream` field to the user profile.

Known stream names from the calendars:
- Ephesians
- Philippians
- Anagkazo
- Galatians
- Colossians

Stream-specific activities must be filtered: a Colossians leader must NOT
see activities assigned to Ephesians/Philippians/Anagkazo, and vice versa.

---

## The "Join / Lead / Ensure" Pattern

This is the core visibility rule for activities that span levels.

| Activity | Bacenta Leader sees | Governor sees | Overseer sees |
|---|---|---|---|
| Wednesday prayer meeting | "Join Governor Morning Prayer Meeting" | "Morning Prayer Meeting with Leaders" (leads) | "Coordinate Governorship Prayer Meetings" (ensures) |
| Sunday prayer meeting | "Join Overseer Prayer Meeting" | "Join Overseer Prayer Meeting with Leaders" | "Overseer Prayer Meeting with Leaders" (leads) |
| Bacenta Morning Prayer | "Bacenta Morning Prayers" (leads) | "Bacenta Morning Prayers" (attends/monitors) | "Bacenta Morning Prayers" (monitors) |
| SAT | "Join SAT" | "SAT with Leaders" (leads) | "SAT with Leaders" (oversees) |

### Rules
- **Bacenta leaders** see activities they personally do OR activities of
  a higher level they are expected to JOIN. Label: "Join [activity name]"
- **Governors** see activities they LEAD at their level, plus higher-level
  activities they join. Label: plain activity name or "Join [name]"
- **Overseers** see activities they lead, plus lower-level activities they
  COORDINATE or ENSURE happen. Label: "Coordinate [activity name]" or
  "Ensure [activity name]"

---

## 6-Week Calendar — Activity Definitions

### Week numbering (this cycle)
| Week | Dates | Theme |
|---|---|---|
| Week 1 | May 12–18 | Prayer / Outreach setup |
| Week 2 | May 19–25 | Ps Benny Weekend (special) |
| Week 3 | May 26–Jun 1 | All Night / Retreat (Galatians + Colossians) |
| Week 4 | Jun 2–8 | Counseling / Interaction |
| Week 5 | Jun 9–15 | Teaching / Visitation |
| Week 6 | Jun 16–22 | Outreaches + Council Joint Service |

---

## BACENTA LEADER — Full Activity List

### TUESDAY (every week)
```js
{ day: 'Tue', freq: 'weekly', name: 'Telepastoring', desc: 'Call 5 members',
  interaction: 'form',
  fields: [{ id:'count', type:'attendance', label:'How many members called?', flagBelow:5 },
           { id:'note', type:'note', label:'Notes (optional)' }] }

{ day: 'Tue', freq: 'weekly', name: 'Join SAT',
  desc: 'Servants Armed & Trained — teaching session led by Governor',
  interaction: 'quick',   // just mark as attended
  visibility: 'join' }    // shown as "join" — Governor leads this
```

### WEDNESDAY (every week)
```js
{ day: 'Wed', freq: 'weekly', name: 'Join Governor Morning Prayer Meeting',
  desc: 'Attend the Governorship morning prayer meeting',
  interaction: 'quick',
  visibility: 'join' }
```

### THURSDAY (every week)
```js
{ day: 'Thu', freq: 'weekly', name: 'Bacenta Morning Prayers',
  desc: 'All members — lead this',
  interaction: 'form',
  fields: [{ id:'attendance', type:'attendance', label:'How many attended?', required:true },
           { id:'photo', type:'photo', label:'Photo (optional)' },
           { id:'note', type:'note', label:'Notes (optional)' }] }

{ day: 'Thu', freq: 'weekly', name: 'Bacenta Service',
  desc: 'Regular bacenta service',
  interaction: 'form',
  fields: [{ id:'attendance', type:'attendance', label:'How many attended?', required:true },
           { id:'photo', type:'photo', label:'Photo (optional)' },
           { id:'note', type:'note', label:'Notes (optional)' }],
  // Week 3 override: becomes Inter-Bacenta Service
  weekOverrides: {
    3: { name:'Bacenta Service (Inter-Bacenta)', desc:'Inter-bacenta format this week' },
    6: { name:'Attend Council Joint Service', desc:'Attend — do not lead', interaction:'quick', visibility:'join' }
  } }
```

### FRIDAY (once per cycle — stream-specific)
```js
// Week 1 — all streams
{ day: 'Fri', week: 1, freq: 'cycle', name: 'Governor-Led All Night',
  desc: 'All night prayer — led by Governor',
  interaction: 'quick',
  visibility: 'join' }

// Week 2 — streams: Ephesians, Philippians, Anagkazo only
{ day: 'Fri', week: 2, freq: 'cycle', name: 'Council All Night',
  desc: 'Ephesians + Philippians + Anagkazo',
  streamFilter: ['Ephesians', 'Philippians', 'Anagkazo'],
  interaction: 'form',
  fields: [{ id:'attendance', type:'attendance', label:'How many attended?' },
           { id:'photo', type:'photo', label:'Photo (optional)' },
           { id:'note', type:'note', label:'Notes (optional)' }] }

// Week 3 — streams: Galatians, Colossians only
{ day: 'Fri', week: 3, freq: 'cycle', name: 'Council All Night',
  desc: 'Galatians + Colossians',
  streamFilter: ['Galatians', 'Colossians'],
  interaction: 'form',
  fields: [{ id:'attendance', type:'attendance', label:'How many attended?' },
           { id:'photo', type:'photo', label:'Photo (optional)' },
           { id:'note', type:'note', label:'Notes (optional)' }] }

// Week 4 — streams: Ephesians, Philippians, Anagkazo only
{ day: 'Fri', week: 4, freq: 'cycle', name: 'Council Retreat',
  desc: 'Ephesians + Philippians + Anagkazo',
  streamFilter: ['Ephesians', 'Philippians', 'Anagkazo'],
  interaction: 'form',
  fields: [{ id:'attendance', type:'attendance', label:'How many attended?' },
           { id:'duration', type:'attendance', label:'How many hours?', flagBelow:7 },
           { id:'note', type:'note', label:'Notes / summary' },
           { id:'photo', type:'photo', label:'Photo (optional)' }] }

// Week 5 — streams: Galatians, Colossians only
{ day: 'Fri', week: 5, freq: 'cycle', name: 'Council Retreat',
  desc: 'Galatians + Colossians',
  streamFilter: ['Galatians', 'Colossians'],
  interaction: 'form',
  fields: [{ id:'attendance', type:'attendance', label:'How many attended?' },
           { id:'duration', type:'attendance', label:'How many hours?', flagBelow:7 },
           { id:'note', type:'note', label:'Notes / summary' },
           { id:'photo', type:'photo', label:'Photo (optional)' }] }

// Week 6
{ day: 'Fri', week: 6, freq: 'cycle', name: 'Bacenta 3-Hour Prayer Meeting',
  desc: 'Evening — lead this',
  interaction: 'form',
  fields: [{ id:'attendance', type:'attendance', label:'How many attended?' },
           { id:'duration', type:'attendance', label:'How many hours?', flagBelow:3 },
           { id:'photo', type:'photo', label:'Photo (optional)' },
           { id:'note', type:'note', label:'Notes (optional)' }] }
```

### SATURDAY (once per cycle)
```js
// Week 1
{ day: 'Sat', week: 1, freq: 'cycle', name: 'Bacenta Outreach',
  desc: 'Door to door / bus stop / flyer sharing',
  interaction: 'form',
  fields: [{ id:'outreachType', type:'select',
             options:['Door to Door','Bus Stop','Flyer Sharing'], label:'Outreach type' },
           { id:'attendance', type:'attendance', label:'How many participated?' },
           { id:'salvations', type:'attendance', label:'Salvations / first-timers?' },
           { id:'photo', type:'photo', label:'Photo (optional)' },
           { id:'note', type:'note', label:'Notes (optional)' }] }

// Week 2 — special event (Ps Benny Weekend — one-off this cycle only)
{ day: 'Sat', week: 2, freq: 'cycle', name: 'Benny Hinn Night — Day 1',
  desc: 'Ps Benny Weekend — special event',
  specialEvent: true,
  interaction: 'quick' }

// Week 3
{ day: 'Sat', week: 3, freq: 'cycle', name: 'Governor Organised Outreach Day',
  desc: 'Breakfast Meeting / Dance Outreach / Games or Movie Night — led by Governor',
  interaction: 'form',
  visibility: 'join',
  fields: [{ id:'outreachType', type:'select',
             options:['Breakfast Meeting','Dance Outreach','Games Night','Movie Night'],
             label:'Outreach type' },
           { id:'attendance', type:'attendance', label:'How many attended?' },
           { id:'salvations', type:'attendance', label:'Salvations / first-timers?' },
           { id:'photo', type:'photo', label:'Photo (optional)' },
           { id:'note', type:'note', label:'Notes (optional)' }] }

// Week 4
{ day: 'Sat', week: 4, freq: 'cycle', name: 'Visitation',
  desc: 'Visit bacenta members',
  interaction: 'form',
  fields: [{ id:'visitedCount', type:'attendance', label:'How many members visited?' },
           { id:'visitedNames', type:'names', label:'Names visited (one per line)' },
           { id:'concerns', type:'note', label:'Concerns or follow-ups?' }] }

// Week 5
{ day: 'Sat', week: 5, freq: 'cycle', name: 'Bacenta Organised Outreach Day',
  desc: 'Breakfast Meeting / Dance Outreach / Games or Movie Night — lead this',
  interaction: 'form',
  fields: [{ id:'outreachType', type:'select',
             options:['Breakfast Meeting','Dance Outreach','Games Night','Movie Night'],
             label:'Outreach type' },
           { id:'attendance', type:'attendance', label:'How many attended?' },
           { id:'salvations', type:'attendance', label:'Salvations / first-timers?' },
           { id:'photo', type:'photo', label:'Photo (optional)' },
           { id:'note', type:'note', label:'Notes (optional)' }] }

// Week 6
{ day: 'Sat', week: 6, freq: 'cycle', name: 'Overseer Organised Outreach Day',
  desc: 'Breakfast Meeting / Dance Outreach / Games or Movie Night — led by Overseer',
  interaction: 'form',
  visibility: 'join',
  fields: [{ id:'outreachType', type:'select',
             options:['Breakfast Meeting','Dance Outreach','Games Night','Movie Night'],
             label:'Outreach type' },
           { id:'attendance', type:'attendance', label:'How many attended?' },
           { id:'salvations', type:'attendance', label:'Salvations / first-timers?' },
           { id:'photo', type:'photo', label:'Photo (optional)' },
           { id:'note', type:'note', label:'Notes (optional)' }] }
```

### SUNDAY (every week)
```js
{ day: 'Sun', freq: 'weekly', name: 'Join Overseer Prayer Meeting',
  desc: 'Attend — Overseer leads this',
  interaction: 'quick',
  visibility: 'join',
  // Week 2 override: Benny Hinn Night Day 2
  weekOverrides: {
    2: { name:'Benny Hinn Night — Day 2', desc:'Ps Benny Weekend — special event',
         specialEvent:true, interaction:'quick' }
  } }

{ day: 'Sun', freq: 'weekly', name: 'Send Members for Counselling',
  desc: 'Encourage and direct members to counselling after church',
  interaction: 'quick' }
```

---

## GOVERNOR — Full Activity List

### TUESDAY (every week)
```js
{ day: 'Tue', freq: 'weekly', name: 'Telepastoring', desc: 'Call 5 members',
  interaction: 'form',
  fields: [{ id:'count', type:'attendance', label:'How many members called?', flagBelow:5 },
           { id:'note', type:'note', label:'Notes (optional)' }] }

{ day: 'Tue', freq: 'weekly', name: 'SAT with Leaders',
  desc: 'Servants Armed & Trained — lead this teaching session with your leaders',
  interaction: 'form',
  visibility: 'lead',
  fields: [{ id:'attendance', type:'attendance', label:'How many leaders attended?' },
           { id:'note', type:'note', label:'Notes (optional)' }] }
```

### WEDNESDAY (every week)
```js
{ day: 'Wed', freq: 'weekly', name: 'Morning Prayer Meeting with Leaders',
  desc: 'Lead Governorship morning prayer meeting',
  interaction: 'form',
  visibility: 'lead',
  fields: [{ id:'attendance', type:'attendance', label:'How many attended?' },
           { id:'note', type:'note', label:'Notes (optional)' },
           { id:'photo', type:'photo', label:'Photo (optional)' }] }
```

### THURSDAY (every week)
```js
{ day: 'Thu', freq: 'weekly', name: 'Bacenta Morning Prayers',
  desc: 'Attend / monitor — Bacenta leaders lead this',
  interaction: 'form',
  visibility: 'monitor',
  fields: [{ id:'attendance', type:'attendance', label:'How many attended across bacentas?' },
           { id:'note', type:'note', label:'Notes (optional)' }] }

{ day: 'Thu', freq: 'weekly', name: 'Bacenta Service',
  desc: 'Attend bacenta service',
  interaction: 'form',
  visibility: 'monitor',
  fields: [{ id:'attendance', type:'attendance', label:'Attendance?' },
           { id:'note', type:'note', label:'Notes (optional)' }],
  weekOverrides: {
    3: { name:'Bacenta Service (Inter-Bacenta)', desc:'Inter-bacenta format this week' },
    6: { name:'Attend Council Joint Service', desc:'Attend — Overseer leads', interaction:'quick', visibility:'join' }
  } }
```

### FRIDAY (same stream-specific pattern as Bacenta — see above)
```js
// Identical stream-filtered Friday activities as Bacenta level.
// Week 1: Governor-Led All Night — Governor LEADS this one (not joins)
{ day: 'Fri', week: 1, freq: 'cycle', name: 'Governor-Led All Night',
  desc: 'Lead all night prayer across your bacentas',
  interaction: 'form',
  visibility: 'lead',
  fields: [{ id:'attendance', type:'attendance', label:'How many attended?' },
           { id:'photo', type:'photo', label:'Photo (optional)' },
           { id:'note', type:'note', label:'Notes / summary' }] }
// Weeks 2–6: same Council All Night + Council Retreat + 3-Hour Prayer as Bacenta
// (Governor attends — mark as join, Overseer organises)
```

### SATURDAY (once per cycle)
```js
// Week 1: Bacentas Outreach (monitor — Bacenta leaders run it)
{ day: 'Sat', week: 1, freq: 'cycle', name: 'Bacentas Outreach',
  desc: 'Door to door / bus stop / flyer sharing — monitor your bacentas',
  interaction: 'form', visibility: 'monitor',
  fields: [{ id:'totalAttendance', type:'attendance', label:'Total across all bacentas?' },
           { id:'note', type:'note', label:'Notes (optional)' }] }

// Week 2: Benny Hinn Night Day 1 (special event)
{ day: 'Sat', week: 2, freq: 'cycle', name: 'Benny Hinn Night — Day 1',
  specialEvent: true, interaction: 'quick' }

// Week 3: Governor Organised Outreach Day (Governor LEADS this)
{ day: 'Sat', week: 3, freq: 'cycle', name: 'Governor Organised Outreach Day',
  desc: 'Lead: Breakfast Meeting / Dance Outreach / Games or Movie Night',
  interaction: 'form', visibility: 'lead',
  fields: [{ id:'outreachType', type:'select',
             options:['Breakfast Meeting','Dance Outreach','Games Night','Movie Night'],
             label:'Outreach type' },
           { id:'attendance', type:'attendance', label:'How many attended?' },
           { id:'salvations', type:'attendance', label:'Salvations / first-timers?' },
           { id:'photo', type:'photo', label:'Photo (optional)' },
           { id:'note', type:'note', label:'Notes (optional)' }] }

// Week 4: Visitation
{ day: 'Sat', week: 4, freq: 'cycle', name: 'Visitation',
  desc: 'Visit bacenta leaders and members',
  interaction: 'form',
  fields: [{ id:'visitedNames', type:'names', label:'Who did you visit? (one per line)' },
           { id:'concerns', type:'note', label:'Concerns or follow-ups?' }] }

// Week 5: Visitation (continues)
{ day: 'Sat', week: 5, freq: 'cycle', name: 'Visitation',
  desc: 'Continue visiting bacenta leaders and members',
  interaction: 'form',
  fields: [{ id:'visitedNames', type:'names', label:'Who did you visit? (one per line)' },
           { id:'concerns', type:'note', label:'Concerns or follow-ups?' }] }

// Week 5 also: Bacentas Organised Outreach Day (monitor — Bacenta leaders run it)
{ day: 'Sat', week: 5, freq: 'cycle', name: 'Bacentas Organised Outreach Day',
  desc: 'Monitor — your bacentas lead this',
  interaction: 'form', visibility: 'monitor',
  fields: [{ id:'totalAttendance', type:'attendance', label:'Total attendance across bacentas?' },
           { id:'note', type:'note', label:'Notes (optional)' }] }

// Week 6: Overseer Organised Outreach Day (join — Overseer leads)
{ day: 'Sat', week: 6, freq: 'cycle', name: 'Overseer Organised Outreach Day',
  desc: 'Join — Overseer leads this outreach',
  interaction: 'form', visibility: 'join',
  fields: [{ id:'attendance', type:'attendance', label:'How many attended?' },
           { id:'note', type:'note', label:'Notes (optional)' }] }
```

### SUNDAY (every week)
```js
{ day: 'Sun', freq: 'weekly', name: 'Join Overseer Prayer Meeting with Leaders',
  desc: 'Attend — Overseer leads this',
  interaction: 'quick', visibility: 'join',
  weekOverrides: {
    2: { name:'Benny Hinn Night — Day 2', specialEvent:true, interaction:'quick' }
  } }

{ day: 'Sun', freq: 'weekly', name: 'Send Members for Counselling',
  desc: 'Direct members to counselling after church',
  interaction: 'quick' }
```

---

## OVERSEER — Full Activity List

### TUESDAY (every week)
```js
{ day: 'Tue', freq: 'weekly', name: 'Telepastoring', desc: 'Call 5 members',
  interaction: 'form',
  fields: [{ id:'count', type:'attendance', label:'How many members called?', flagBelow:5 },
           { id:'note', type:'note', label:'Notes (optional)' }] }

{ day: 'Tue', freq: 'weekly', name: 'SAT with Leaders',
  desc: 'Servants Armed & Trained — oversee / attend with leaders',
  interaction: 'form', visibility: 'ensure',
  fields: [{ id:'attendance', type:'attendance', label:'How many leaders attended?' },
           { id:'note', type:'note', label:'Notes (optional)' }] }
```

### WEDNESDAY (every week)
```js
{ day: 'Wed', freq: 'weekly', name: 'Coordinate Governorship Prayer Meetings',
  desc: 'Ensure all Governorship prayer meetings are happening',
  interaction: 'form', visibility: 'ensure',
  fields: [{ id:'meetingsHeld', type:'attendance', label:'How many governorship prayer meetings confirmed?' },
           { id:'note', type:'note', label:'Any not held? Notes (optional)' }] }
```

### THURSDAY (every week)
```js
{ day: 'Thu', freq: 'weekly', name: 'Bacenta Morning Prayers',
  desc: 'Monitor — Bacenta leaders lead this across all bacentas',
  interaction: 'form', visibility: 'monitor',
  fields: [{ id:'note', type:'note', label:'Any issues reported? Notes (optional)' }] }

{ day: 'Thu', freq: 'weekly', name: 'Bacenta Service',
  desc: 'Monitor bacenta services',
  interaction: 'quick', visibility: 'monitor',
  weekOverrides: {
    3: { name:'Bacenta Service (Inter-Bacenta)', desc:'Inter-bacenta format this week' },
    6: { name:'Council Joint Service', desc:'Attend / lead Council Joint Service',
         interaction:'form', visibility:'lead',
         fields:[{ id:'attendance', type:'attendance', label:'How many attended?' },
                 { id:'photo', type:'photo', label:'Photo (optional)' },
                 { id:'note', type:'note', label:'Notes / summary' }] }
  } }
```

### FRIDAY (stream-specific — same pattern, Overseer organises)
```js
// Week 1: Governor-Led All Night — Overseer monitors/supports
{ day: 'Fri', week: 1, freq: 'cycle', name: 'Governor-Led All Night',
  desc: 'Governors lead — ensure it happens across all governorships',
  interaction: 'form', visibility: 'ensure',
  fields: [{ id:'note', type:'note', label:'Notes / any issues?' }] }

// Weeks 2 & 3: Council All Night — Overseer leads/organises
// Weeks 4 & 5: Council Retreat — Overseer organises
// Week 6: Bacentas 3-Hour Prayer Meeting — Overseer ensures it happens
// (same stream filters apply — see Bacenta section above)
```

### SATURDAY (once per cycle)
```js
// Week 1: Bacentas Outreach (Overseer monitors)
{ day: 'Sat', week: 1, freq: 'cycle', name: 'Bacentas Outreach',
  desc: 'Monitor — Bacentas running door to door / bus stop / flyer sharing',
  interaction: 'quick', visibility: 'monitor' }

// Week 2: Benny Hinn Night Day 1
{ day: 'Sat', week: 2, freq: 'cycle', name: 'Benny Hinn Night — Day 1',
  specialEvent: true, interaction: 'quick' }

// Week 3: Governor Organised Outreach Day (Overseer monitors)
{ day: 'Sat', week: 3, freq: 'cycle', name: 'Governor Organised Outreach Day',
  desc: 'Governors lead — monitor across governorships',
  interaction: 'form', visibility: 'monitor',
  fields: [{ id:'note', type:'note', label:'Notes / observations (optional)' }] }

// Week 4: Leaders & Married Couples Visitation (Overseer leads)
{ day: 'Sat', week: 4, freq: 'cycle', name: 'Leaders & Married Couples Visitation',
  desc: 'Visit leaders and married couples',
  interaction: 'form', visibility: 'lead',
  fields: [{ id:'leadersVisited', type:'names', label:'Leaders visited (one per line)' },
           { id:'couplesCount', type:'attendance', label:'Married couples visited' },
           { id:'concerns', type:'note', label:'Concerns or follow-ups?' }] }

// Week 5: Leaders & Married Couples Visitation (continues)
{ day: 'Sat', week: 5, freq: 'cycle', name: 'Leaders & Married Couples Visitation',
  desc: 'Continue visiting leaders and married couples',
  interaction: 'form', visibility: 'lead',
  fields: [{ id:'leadersVisited', type:'names', label:'Leaders visited (one per line)' },
           { id:'couplesCount', type:'attendance', label:'Married couples visited' },
           { id:'concerns', type:'note', label:'Concerns or follow-ups?' }] }

// Week 5 also: Bacentas Organised Outreach Day (Overseer monitors)
{ day: 'Sat', week: 5, freq: 'cycle', name: 'Bacentas Organised Outreach Day',
  desc: 'Bacentas lead — monitor across governorships',
  interaction: 'form', visibility: 'monitor',
  fields: [{ id:'note', type:'note', label:'Notes / observations (optional)' }] }

// Week 6: Overseer Organised Outreach Day (Overseer LEADS)
{ day: 'Sat', week: 6, freq: 'cycle', name: 'Overseer Organised Outreach Day',
  desc: 'Lead: Breakfast Meeting / Dance Outreach / Games or Movie Night',
  interaction: 'form', visibility: 'lead',
  fields: [{ id:'outreachType', type:'select',
             options:['Breakfast Meeting','Dance Outreach','Games Night','Movie Night'],
             label:'Outreach type' },
           { id:'attendance', type:'attendance', label:'How many attended?' },
           { id:'salvations', type:'attendance', label:'Salvations / first-timers?' },
           { id:'photo', type:'photo', label:'Photo (optional)' },
           { id:'note', type:'note', label:'Notes (optional)' }] }
```

### SUNDAY (every week)
```js
{ day: 'Sun', freq: 'weekly', name: 'Overseer Prayer Meeting with Leaders',
  desc: 'Lead Sunday morning prayer meeting',
  interaction: 'form', visibility: 'lead',
  fields: [{ id:'attendance', type:'attendance', label:'How many attended?' },
           { id:'note', type:'note', label:'Notes (optional)' }],
  weekOverrides: {
    2: { name:'Benny Hinn Night — Day 2', specialEvent:true, interaction:'quick' }
  } }

{ day: 'Sun', freq: 'weekly', name: 'Counselling',
  desc: 'Counsel members after church',
  interaction: 'form',
  fields: [{ id:'count', type:'attendance', label:'How many counselled?' },
           { id:'note', type:'note', label:'Notes (optional)' }] }

// Intimate counselling — rotates by stream group each week
// Week 1: Ephesians Intimate Counselling
// Week 2: (Benny Hinn — no intimate counselling)
// Week 3: Ephesians Intimate Counselling
// Week 4: Anagkazo Intimate Counselling
// Week 5: Anagkazo Intimate Counselling
// Week 6: Philippians Intimate Counselling
{ day: 'Sun', freq: 'cycle', name: 'Intimate Counselling',
  desc: 'Scheduled intimate counselling session — stream rotates by week',
  interaction: 'form',
  streamRotation: {
    1: ['Ephesians'],
    2: [],                        // Benny Hinn weekend — skip
    3: ['Ephesians'],
    4: ['Anagkazo'],
    5: ['Anagkazo'],
    6: ['Philippians'],
  },
  fields: [{ id:'count', type:'attendance', label:'How many in the session?' },
           { id:'note', type:'note', label:'Notes (confidential — keep brief)' }] }
```

---

## Activity Visibility Labels

Use these labels in the UI to tell the leader what role they play:

| visibility value | UI label | Row styling |
|---|---|---|
| `'lead'` | No label — normal row (they own it) | Normal |
| `'join'` | "Join" chip on row | Slightly muted border |
| `'monitor'` | "Monitor" chip on row | Muted, italic activity name |
| `'ensure'` | "Ensure" chip on row | Muted, italic activity name |

`join`, `monitor`, and `ensure` rows:
- Still appear on the timeline
- Still have a form or quick-tap to log
- The log entry records that it was a `join`/`monitor`/`ensure` action
- Shown slightly de-emphasised visually so the leader's OWN activities stand out

---

## Special Event Rows

Activities with `specialEvent: true` (Benny Hinn Night):
- Show with a distinct gold/amber accent
- Quick-tap only — no detailed form needed
- Label: "Special Event"

---

## Stream Filter Logic

```js
// In timeline.js — when building activity list for a user:
function isVisibleToUser(activity, user) {
  // Stream filter: if activity has streamFilter, only show to matching streams
  if (activity.streamFilter && activity.streamFilter.length > 0) {
    if (!activity.streamFilter.includes(user.stream)) return false
  }
  // Stream rotation: for intimate counselling etc.
  if (activity.streamRotation) {
    const streamsThisWeek = activity.streamRotation[currentCycleWeek] || []
    if (!streamsThisWeek.includes(user.stream)) return false
  }
  return true
}
```

---

## Updated User Profile (JWT enrichment)

Add `stream` to the user object after login:

```js
// In auth.js enrichUser():
export function enrichUser(payload) {
  return {
    ...payload,
    level:    getLevelFromRoles(payload.roles || []),
    unitName: payload.bacenta?.name || payload.governorship?.name || payload.council?.name || '',
    stream:   payload.stream?.name || null,   // ADD THIS
    isAdmin:  isAdmin(payload.roles || []),
  }
}
```

---

## Cycle Week Calculation

```js
// Week 1 of this cycle starts May 12 2026 (a Tuesday — calendar uses Tue as effective start)
// Use Monday May 11 as the ISO week anchor

const CYCLE_START = new Date('2026-05-11') // Monday of Week 1

export function getCurrentCycleWeek() {
  const now = new Date()
  const msPerWeek = 7 * 24 * 60 * 60 * 1000
  const weekNum = Math.floor((now - CYCLE_START) / msPerWeek) + 1
  return Math.max(1, Math.min(6, weekNum))  // clamp to 1–6 for this cycle
}

// For infinite scroll: extend beyond 6 by cycling
export function cycleWeekForWeekNum(weekNum) {
  return ((weekNum - 1) % 6) + 1
}
```

---

## Report Deadline Reminder

From the calendars: "Submit all reports within 24 hours of each activity"

Add a subtle reminder to the form submit button:
- Button label: "Log activity"
- Sub-label under button: "Reports due within 24 hours"

For past-due items (activity date was >24 hours ago and not yet logged):
- Show a small warning chip: "Overdue"
- Still allow logging — just flag it

---

## BISHOP — Schedule Notes

The Bishop schedule (Cal_Bishop_Edited.pdf) is identical to the Overseer
schedule across all 6 weeks. Same activities, same days, same stream filters,
same intimate counselling rotation.

One minor label difference on Wednesday:
- Overseer: "Coordinate Governorship Prayer Meetings"
- Bishop: "Governorship Prayer Meetings"

Treat these as the same activity. In the UI, Bishops and Overseers share
the same timeline view and activity definitions. No separate activity list
needed for Bishop.

**Implementation note for Copilot:**
```js
// In timeline.js — Bishop uses the same activities as Overseer
function getActivitiesForLevel(user) {
  const level = user.level === 'bishop' ? 'overseer' : user.level
  return ACTIVITIES.filter(a => a.appliesTo.includes(level))
}
```

The only distinction between Bishop and Overseer in the UI is the level
badge shown in the topbar and on log entries. Functionally identical.

---

## What Changes from Previous Context Files

1. **Organisation name** → First Love Church (not Colossians Stream)
2. **Stream field** added to user profile — required for filtering
3. **`visibility` property** on activities (`join`/`lead`/`monitor`/`ensure`)
4. **`streamFilter`** property for Council All Night / Retreat activities
5. **`streamRotation`** property for Intimate Counselling (Overseer Sunday)
6. **`weekOverrides`** property for activities that change in specific weeks
7. **`specialEvent`** flag for Benny Hinn Night (Week 2)
8. **SAT** = Servants Armed & Trained (teaching session, every Tuesday)
9. **24-hour report deadline** shown on form submit
10. **`cycleWeekForWeekNum()`** helper for infinite scroll beyond week 6
