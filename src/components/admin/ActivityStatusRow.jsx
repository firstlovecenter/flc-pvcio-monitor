// src/components/admin/ActivityStatusRow.jsx
// ✓ / ✗ / — row for the LeaderDetailScreen activity breakdown.

/**
 * @param {'filed'|'missing'|'not-expected'} status
 * @param {object} activity
 * @param {object|null} log   — the actual log row if filed
 */
export default function ActivityStatusRow({ status, activity, log }) {
  const icons = {
    filed: '✓',
    missing: '✗',
    'not-expected': '—',
  }
  const colors = {
    filed: '#34D399',
    missing: '#F87060',
    'not-expected': 'var(--muted)',
  }
  const textColor = {
    filed: 'var(--text)',
    missing: 'var(--text)',
    'not-expected': 'var(--muted)',
  }

  const icon = icons[status]
  const color = colors[status]

  function formatTime(iso) {
    if (!iso) return ''
    const d = new Date(iso)
    return d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' }) +
      ' · ' +
      d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div
      className='flex items-start gap-3 px-4 py-3'
      style={{ borderBottom: '1px solid var(--border)' }}
    >
      {/* Icon */}
      <span
        className='text-sm font-bold mt-0.5 shrink-0 w-4 text-center'
        style={{ color }}
      >
        {icon}
      </span>

      {/* Content */}
      <div className='flex-1 min-w-0'>
        <p className='text-sm font-medium' style={{ color: textColor[status] }}>
          {activity.name}
        </p>
        <p className='text-xs mt-0.5' style={{ color: 'var(--muted)' }}>
          {status === 'filed' && log?.submitted_at
            ? `Logged ${formatTime(log.submitted_at)}`
            : status === 'missing'
            ? `Expected ${activity.day ?? ''} · Not filed`
            : 'Not expected this cycle week'}
        </p>
      </div>
    </div>
  )
}
