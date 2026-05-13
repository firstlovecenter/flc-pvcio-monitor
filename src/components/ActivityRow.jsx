// src/components/ActivityRow.jsx
// Single activity row in the timeline.
//
// Visual states: done | today | missed | upcoming | tbc
//
// Props:
//   entry   — timeline entry object
//   onTap   — called when row is tapped (omitted for tbc entries)
//   today   — today's ISO date string (yyyy-MM-dd)

import { formatDistanceToNow, parseISO } from 'date-fns'

function statusOf(entry, today) {
  if (entry.type === 'tbc') return 'tbc'
  if (entry.done) return 'done'
  if (entry.date === today) return 'today'
  if (entry.date < today) return 'missed'
  return 'upcoming'
}

export default function ActivityRow({ entry, onTap, today }) {
  const status = statusOf(entry, today)
  const tappable = status !== 'tbc' && onTap

  // ── Row wrapper styles ────────────────────────────────────────────
  const rowBase = {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    margin: '1px 10px',
    borderRadius: 10,
    padding: '10px 12px',
    cursor: tappable ? 'pointer' : 'default',
    transition: 'background 0.15s',
  }

  const rowStyles = {
    done: {
      ...rowBase,
      background: 'rgba(52,211,153,.05)',
      border: '0.5px solid rgba(52,211,153,.15)',
    },
    missed: {
      ...rowBase,
      background: 'rgba(248,112,96,.04)',
      border: '0.5px solid rgba(248,112,96,.18)',
    },
    today: {
      ...rowBase,
      background: 'rgba(79,127,255,.06)',
      border: '0.5px solid rgba(79,127,255,.28)',
    },
    upcoming: {
      ...rowBase,
      background: '#111825',
      border: '0.5px solid rgba(255,255,255,.06)',
    },
    tbc: {
      ...rowBase,
      background: 'transparent',
      border: '0.5px dashed #1E2540',
    },
  }

  // ── Circle ────────────────────────────────────────────────────────
  const circleBase = {
    width: 20,
    height: 20,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    fontSize: 11,
  }

  const circleStyles = {
    done: { ...circleBase, background: '#34D399', border: '1.5px solid #34D399', color: '#fff' },
    missed: { ...circleBase, border: '1.5px solid #F87060', background: 'transparent', color: '#F87060' },
    today: { ...circleBase, border: '1.5px solid #4F7FFF', background: 'transparent' },
    upcoming: { ...circleBase, border: '1.5px solid #2E3860', background: 'transparent' },
    tbc: { ...circleBase, border: '1.5px solid #1E2540', background: 'transparent', color: '#2E3860' },
  }

  const circleContent = {
    done: '✓',
    missed: '○',
    today: '',
    upcoming: '',
    tbc: '?',
  }

  // ── Name text ────────────────────────────────────────────────────
  const nameStyles = {
    done: { fontSize: 12, fontWeight: 500, color: '#4B6060', textDecoration: 'line-through', textDecorationColor: '#2D4D4D' },
    missed: { fontSize: 12, fontWeight: 500, color: 'var(--coral)' },
    today: { fontSize: 12, fontWeight: 500, color: 'var(--text)' },
    upcoming: { fontSize: 12, fontWeight: 500, color: 'var(--text)' },
    tbc: { fontSize: 12, fontWeight: 500, color: '#3A4060' },
  }

  // ── Right chip ───────────────────────────────────────────────────
  function RightChip() {
    const chipBase = {
      fontSize: 9,
      padding: '2px 7px',
      borderRadius: 10,
      fontFamily: 'var(--mono)',
      whiteSpace: 'nowrap',
    }
    if (status === 'done') {
      return (
        <span style={{ ...chipBase, background: 'rgba(52,211,153,.1)', color: '#34D399' }}>
          done
        </span>
      )
    }
    if (status === 'missed') {
      return (
        <span style={{ ...chipBase, background: 'rgba(248,112,96,.1)', color: '#F87060' }}>
          not logged
        </span>
      )
    }
    if (status === 'tbc') {
      return (
        <span style={{ ...chipBase, background: 'rgba(255,255,255,.03)', color: '#3A4060', border: '0.5px dashed #2E3860' }}>
          tbc
        </span>
      )
    }
    // upcoming or today — show "form" chip
    return (
      <span style={{ ...chipBase, background: 'rgba(79,127,255,.1)', color: '#7FA8FF', border: '0.5px solid rgba(79,127,255,.2)' }}>
        form
      </span>
    )
  }

  // ── Meta line ────────────────────────────────────────────────────
  function metaText() {
    if (status === 'tbc') return 'Scheduled activity — date TBC'
    if (status === 'done') {
      try {
        return `logged ${formatDistanceToNow(parseISO(entry.date), { addSuffix: true })}`
      } catch {
        return entry.activityName
      }
    }
    return entry.desc || ''
  }

  return (
    <div
      style={rowStyles[status]}
      onClick={tappable ? onTap : undefined}
      role={tappable ? 'button' : undefined}
      tabIndex={tappable ? 0 : undefined}
      onKeyDown={tappable ? (e) => e.key === 'Enter' && onTap() : undefined}
    >
      {/* Circle */}
      <div style={circleStyles[status]}>{circleContent[status]}</div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={nameStyles[status]}>
          {status === 'tbc' ? 'Calendar slot — TBC' : entry.activityName}
        </div>
        <div style={{ fontSize: 10, color: '#4B5680', marginTop: 2, fontFamily: 'var(--mono)' }}>
          {metaText()}
        </div>
      </div>

      {/* Right chip */}
      <div style={{ flexShrink: 0 }}>
        <RightChip />
      </div>
    </div>
  )
}
