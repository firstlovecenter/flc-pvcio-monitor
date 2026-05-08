export default function NoteField({ field, value, onChange }) {
  return (
    <div className='flex flex-col gap-2'>
      <label className='text-xs font-semibold tracking-widest uppercase' style={{ color: 'var(--muted)' }}>
        {field.label}
      </label>
      <textarea
        rows={3}
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder='Add a note...'
        className='w-full resize-none rounded-2xl px-4 py-3 text-sm outline-none'
        style={{
          background: 'var(--card)',
          border: '1px solid var(--border)',
          color: 'var(--text)',
          caretColor: 'var(--accent)',
        }}
      />
    </div>
  )
}
