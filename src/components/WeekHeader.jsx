// src/components/WeekHeader.jsx
// Week label + activity progress bar shown at the top of each week section.
//
// Props:
//   isoWeek   — ISO week string, e.g. '2026-W20'
//   label     — human-readable label, e.g. 'Week of 11–17 May 2026'
//   total     — total activity count in the week
//   done      — number of done activities in the week

export default function WeekHeader({ label, total, done }) {
  const pct = total > 0 ? (done / total) * 100 : 0

  return (
    <div>
      {/* Week label row */}
      <div
        style={{
          padding: '10px 16px 8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <span
          style={{
            fontSize: 11,
            fontWeight: 500,
            color: 'var(--text)',
            fontFamily: 'var(--mono)',
          }}
        >
          {label}
        </span>
        <span
          style={{
            fontSize: 10,
            color: 'var(--muted)',
            fontFamily: 'var(--mono)',
          }}
        >
          {done} / {total} done
        </span>
      </div>

      {/* Progress track */}
      <div
        style={{
          height: 3,
          background: '#1E2540',
          borderRadius: 2,
          margin: '0 16px 2px',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${pct}%`,
            background: 'var(--accent)',
            borderRadius: 2,
            transition: 'width 0.4s ease',
          }}
        />
      </div>
    </div>
  )
}
