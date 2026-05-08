export default function NamesField({ field, value, onChange, error }) {
  return (
    <div className='flex flex-col gap-2'>
      <label className='flex items-center gap-1 text-xs font-semibold tracking-widest uppercase' style={{ color: 'var(--muted)' }}>
        {field.label}
        {field.required && <span style={{ color: '#f87171' }}>*</span>}
      </label>
      <textarea
        rows={4}
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={'Name 1\nName 2\nName 3'}
        className='w-full resize-none rounded-2xl px-4 py-3 text-sm outline-none'
        style={{
          background: 'var(--card)',
          border: error ? '1px solid #f87171' : '1px solid var(--border)',
          color: 'var(--text)',
          caretColor: 'var(--accent)',
        }}
      />
      {error && <p className='text-xs mt-0.5' style={{ color: '#f87171' }}>{error}</p>}
    </div>
  )
}
