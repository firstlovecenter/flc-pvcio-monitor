const OPTIONS = [
  { value: 'General',  label: 'General',  color: 'var(--amber)' },
  { value: 'Critical', label: 'Critical', color: 'var(--coral)' },
]

export default function IssueTypeField({ field, value, onChange, error }) {
  return (
    <div className='flex flex-col gap-2'>
      <label className='flex items-center gap-1 text-xs font-semibold tracking-widest uppercase' style={{ color: 'var(--muted)' }}>
        {field.label}
        {field.required && <span style={{ color: '#f87171' }}>*</span>}
      </label>
      <div className='flex gap-3'>
        {OPTIONS.map((opt) => {
          const active = value === opt.value
          return (
            <button
              key={opt.value}
              type='button'
              onClick={() => onChange(opt.value)}
              className='flex-1 rounded-2xl py-4 text-sm font-semibold cursor-pointer transition-all'
              style={{
                background: active ? `${opt.color}22` : 'var(--card)',
                border: active ? `1.5px solid ${opt.color}` : '1.5px solid var(--border)',
                color: active ? opt.color : 'var(--muted)',
              }}
            >
              {opt.label}
            </button>
          )
        })}
      </div>
      {error && <p className='text-xs mt-0.5' style={{ color: '#f87171' }}>{error}</p>}
    </div>
  )
}
