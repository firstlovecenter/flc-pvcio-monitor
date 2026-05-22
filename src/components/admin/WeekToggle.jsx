// src/components/admin/WeekToggle.jsx
// Switch between last week (completed) and this week (in progress).

/**
 * @param {'last'|'this'} value
 * @param {(v: 'last'|'this') => void} onChange
 */
export default function WeekToggle({ value, onChange }) {
  const tabs = [
    { key: 'last', label: 'Last week' },
    { key: 'this', label: 'This week' },
  ]

  return (
    <div
      className='flex rounded-xl p-1 gap-1'
      style={{ background: 'var(--bg2)', border: '1px solid var(--border)' }}
    >
      {tabs.map(({ key, label }) => {
        const active = value === key
        return (
          <button
            key={key}
            onClick={() => onChange(key)}
            className='flex-1 rounded-lg py-1.5 text-xs font-semibold transition-colors'
            style={{
              background: active ? 'var(--accent)' : 'transparent',
              color: active ? '#fff' : 'var(--muted)',
            }}
          >
            {label}
            {key === 'this' && (
              <span className='ml-1 text-xs opacity-70'>·</span>
            )}
            {key === 'this' && (
              <span className='text-xs' style={{ color: active ? 'rgba(255,255,255,0.7)' : 'var(--muted)' }}>
                {' '}live
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
