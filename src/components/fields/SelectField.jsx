// SelectField — large tap-target button group (not a native dropdown)
// field.options: string[]

export default function SelectField({ field, value, onChange, error }) {
  return (
    <div className='flex flex-col gap-2'>
      <label
        className='flex items-center gap-1 text-xs font-semibold tracking-widest uppercase'
        style={{ color: 'var(--muted)' }}
      >
        {field.label}
        {field.required && <span style={{ color: '#f87171' }}>*</span>}
      </label>

      <div className='flex flex-col gap-2'>
        {(field.options || []).map((opt) => {
          const selected = value === opt
          return (
            <button
              key={opt}
              type='button'
              onClick={() => onChange(opt)}
              className='w-full rounded-2xl py-4 px-5 text-left text-base font-semibold cursor-pointer transition-all'
              style={{
                background: selected ? 'rgba(79,127,255,0.2)' : 'var(--card)',
                border: selected
                  ? '1.5px solid var(--accent)'
                  : '1px solid var(--border)',
                color: selected ? 'var(--accent)' : 'var(--text)',
              }}
            >
              {selected && <span className='mr-2'>✓</span>}
              {opt}
            </button>
          )
        })}
      </div>

      {error && (
        <p className='text-xs mt-0.5' style={{ color: '#f87171' }}>
          {error}
        </p>
      )}
    </div>
  )
}
