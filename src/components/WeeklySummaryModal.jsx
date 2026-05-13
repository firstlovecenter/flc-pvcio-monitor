// WeeklySummaryModal
// Shown when the app is opened on Sunday or Monday if the previous ISO week
// has no weekly_summary log. Soft prompt — leader can dismiss.
//
// Props:
//   isoWeek     — the ISO week being summarised, e.g. '2026-W20'
//   weekLabel   — display label, e.g. 'Week of 11–17 May'
//   logsCount   — how many activities were logged that week
//   missedNames — string[] of activity names that were not logged
//   onSubmit(note) — called when leader presses Done
//   onDismiss() — called when leader presses Remind me later

import { useState } from 'react'

export default function WeeklySummaryModal({
  isoWeek,
  weekLabel,
  logsCount,
  missedNames,
  onSubmit,
  onDismiss,
}) {
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)

  async function handleDone() {
    setSaving(true)
    await onSubmit(note)
    setSaving(false)
  }

  return (
    <div
      className='fixed inset-0 z-50 flex items-end justify-center p-4'
      style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
    >
      <div
        className='w-full max-w-md rounded-3xl p-6 flex flex-col gap-5'
        style={{
          background: '#131929',
          border: '1px solid #252D4A',
          color: 'var(--text)',
        }}
      >
        {/* Header */}
        <div>
          <p
            className='m-0 text-xs uppercase tracking-widest'
            style={{ color: 'var(--muted)' }}
          >
            {isoWeek} · Weekly Summary
          </p>
          <h2 className='m-0 mt-1 text-xl font-semibold'>{weekLabel}</h2>
        </div>

        {/* Stats */}
        <div className='flex flex-col gap-2'>
          <div
            className='flex items-center gap-2 rounded-2xl px-4 py-3'
            style={{
              background: 'rgba(52,211,153,0.1)',
              border: '1px solid rgba(52,211,153,0.25)',
            }}
          >
            <span style={{ color: '#34D399' }}>✓</span>
            <p
              className='m-0 text-sm font-semibold'
              style={{ color: '#34D399' }}
            >
              {logsCount} {logsCount === 1 ? 'activity' : 'activities'} logged
            </p>
          </div>

          {missedNames.map((name) => (
            <div
              key={name}
              className='flex items-center gap-2 rounded-2xl px-4 py-3'
              style={{
                background: 'rgba(248,112,96,0.08)',
                border: '1px solid rgba(248,112,96,0.2)',
              }}
            >
              <span style={{ color: '#F87060' }}>✗</span>
              <p className='m-0 text-sm' style={{ color: '#F87060' }}>
                {name} — not logged
              </p>
            </div>
          ))}
        </div>

        {/* Free-text */}
        <div className='flex flex-col gap-2'>
          <label
            className='text-xs font-semibold uppercase tracking-widest'
            style={{ color: 'var(--muted)' }}
          >
            How did your week go?
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder='Optional — share anything on your heart…'
            rows={3}
            className='w-full rounded-2xl px-4 py-3 text-sm resize-none outline-none'
            style={{
              background: 'var(--card)',
              border: '1px solid var(--border)',
              color: 'var(--text)',
            }}
          />
        </div>

        {/* Buttons */}
        <div className='flex gap-3'>
          <button
            type='button'
            onClick={onDismiss}
            className='flex-1 rounded-2xl py-3 text-sm font-semibold cursor-pointer'
            style={{
              background: 'var(--card)',
              border: '1px solid var(--border)',
              color: 'var(--muted)',
            }}
          >
            Remind me later
          </button>
          <button
            type='button'
            onClick={handleDone}
            disabled={saving}
            className='flex-1 rounded-2xl py-3 text-sm font-semibold cursor-pointer'
            style={{
              background: saving ? 'var(--border)' : 'var(--accent)',
              border: 'none',
              color: '#fff',
              opacity: saving ? 0.7 : 1,
            }}
          >
            {saving ? 'Saving…' : 'Done'}
          </button>
        </div>
      </div>
    </div>
  )
}
