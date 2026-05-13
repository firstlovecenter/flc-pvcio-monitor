// src/components/DaySection.jsx
// Day header + list of activity rows (or "no activities" message).
//
// Props:
//   date     — ISO date string for this day (yyyy-MM-dd)
//   entries  — array of timeline entries for this day (can be empty)
//   today    — today's ISO date string
//   onTap    — (entry) => void — called when an activity row is tapped

import { format, parseISO } from 'date-fns'
import ActivityRow from './ActivityRow'

export default function DaySection({ date, entries, today, onTap }) {
  const isToday = date === today
  const isPast = date < today

  const dateObj = parseISO(date)
  const dayLabel = format(dateObj, 'EEE d MMM') // 'Mon 11 May'

  return (
    <div style={{ marginBottom: 2 }}>
      {/* Day header */}
      <div
        style={{
          padding: '8px 16px 5px',
          fontSize: 9,
          fontWeight: 500,
          color: isToday ? 'var(--accent)' : isPast ? '#292E4A' : '#3A4060',
          fontFamily: 'var(--mono)',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}
      >
        {/* Dot */}
        <span
          style={{
            width: 5,
            height: 5,
            borderRadius: '50%',
            background: isToday ? 'var(--accent)' : isPast ? '#292E4A' : '#3A4060',
            flexShrink: 0,
            display: 'inline-block',
          }}
        />
        {dayLabel}
        {isToday && (
          <span style={{ color: 'var(--accent)', marginLeft: 2 }}>· today</span>
        )}
      </div>

      {/* Activities or empty state */}
      {entries.length === 0 ? (
        <div
          style={{
            padding: '3px 16px 6px',
            fontSize: 11,
            color: isPast ? '#1E2540' : '#2A3050',
            fontStyle: 'italic',
          }}
        >
          No activities
        </div>
      ) : (
        entries.map((entry) => (
          <ActivityRow
            key={entry.id}
            entry={entry}
            today={today}
            onTap={entry.type !== 'tbc' ? () => onTap(entry) : undefined}
          />
        ))
      )}
    </div>
  )
}
