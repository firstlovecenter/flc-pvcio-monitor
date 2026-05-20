import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { format } from 'date-fns'
import { getActivityById, getCategoryById } from '../data/activities'
import { getCurrentUser } from '../utils/auth'
import { addLog } from '../utils/logs'
import AttendanceField from '../components/fields/AttendanceField'
import NoteField from '../components/fields/NoteField'
import PhotoField from '../components/fields/PhotoField'
import NamesField from '../components/fields/NamesField'
import IssueTypeField from '../components/fields/IssueTypeField'
import SelectField from '../components/fields/SelectField'

const FREQ_LABELS = {
  weekly: 'Weekly',
  cycle: 'This 6-week cycle',
}

function FieldRenderer({ field, value, onChange, error, activity, userLevel }) {
  // Resolve 'minimumByLevel' flagBelow to the actual threshold for the user's level
  const resolvedField =
    field.flagBelow === 'minimumByLevel' && activity?.minimumByLevel
      ? { ...field, flagBelow: activity.minimumByLevel[userLevel] ?? 0 }
      : field

  switch (resolvedField.type) {
    case 'attendance':
      return (
        <AttendanceField
          field={resolvedField}
          value={value}
          onChange={onChange}
          error={error}
        />
      )
    case 'note':
      return (
        <NoteField field={resolvedField} value={value} onChange={onChange} />
      )
    case 'photo':
      return (
        <PhotoField field={resolvedField} value={value} onChange={onChange} />
      )
    case 'names':
      return (
        <NamesField
          field={resolvedField}
          value={value}
          onChange={onChange}
          error={error}
        />
      )
    case 'issueType':
      return (
        <IssueTypeField
          field={resolvedField}
          value={value}
          onChange={onChange}
          error={error}
        />
      )
    case 'select':
      return (
        <SelectField
          field={resolvedField}
          value={value}
          onChange={onChange}
          error={error}
        />
      )
    default:
      return null
  }
}

export default function LogFormScreen() {
  const navigate = useNavigate()
  const { actId } = useParams()

  const activity = getActivityById(actId)
  const category = activity ? getCategoryById(activity.category) : null
  const user = getCurrentUser()

  const [values, setValues] = useState({})
  const [errors, setErrors] = useState({})
  const [toast, setToast] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  if (!activity) {
    return (
      <div
        className='min-h-dvh flex items-center justify-center'
        style={{ background: 'var(--bg)', color: 'var(--muted)' }}
      >
        Activity not found.
      </div>
    )
  }

  function handleChange(fieldId, val) {
    setValues((prev) => ({ ...prev, [fieldId]: val }))
    if (errors[fieldId]) setErrors((prev) => ({ ...prev, [fieldId]: null }))
  }

  function validate() {
    const next = {}
    for (const f of (activity.fields || [])) {
      if (!f.required) continue
      const val = values[f.id]
      if (
        f.type === 'attendance' &&
        (val === undefined || val === null || val === 0)
      ) {
        next[f.id] = 'Required — enter a number greater than 0'
      } else if (
        (f.type === 'names' || f.type === 'issueType' || f.type === 'select') &&
        !val
      ) {
        next[f.id] = 'This field is required'
      }
    }
    return next
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) {
      setErrors(errs)
      return
    }

    setSubmitting(true)
    try {
      // Pull the photo file out of fields — addLog takes it as a separate arg
      const { photo: photoValue, ...fieldValues } = values
      const photoFile = photoValue?.file || null

      await addLog(
        user,
        {
          activityId: activity.id,
          activityName: activity.name,
          category: activity.category,
          level: user.level,
          freq: activity.freq,
          fields: fieldValues,
        },
        photoFile,
      )

      setToast('Logged!')
      setTimeout(() => navigate('/home'), 900)
    } catch (err) {
      console.error('addLog failed:', err)
      setToast('Something went wrong — try again')
      setSubmitting(false)
    }
  }

  const unitName = user?.unitName || user?.bacenta?.name || ''
  const governorshipName =
    user?.governorship?.name || user?.activeChurch?.name || ''

  return (
    <div
      className='min-h-dvh'
      style={{
        background:
          'radial-gradient(130% 90% at 50% -10%, #1A2450 0%, #101528 50%, #0C0F1A 100%)',
        color: 'var(--text)',
      }}
    >
      {/* Sticky header */}
      <header
        className='sticky top-0 z-10 flex items-center gap-3 px-4 pt-10 pb-4'
        style={{
          background: 'rgba(12,15,26,0.92)',
          backdropFilter: 'blur(12px)',
        }}
      >
        <button
          type='button'
          onClick={() => navigate(-1)}
          className='flex items-center justify-center rounded-xl cursor-pointer flex-shrink-0'
          style={{
            width: 36,
            height: 36,
            background: 'var(--card)',
            border: '1px solid var(--border)',
            color: 'var(--text)',
          }}
        >
          ←
        </button>
        <div>
          <p className='m-0 text-base font-semibold'>Log activity</p>
          <p className='m-0 text-xs' style={{ color: 'var(--muted)' }}>
            {category?.label} · {format(new Date(), 'EEE d MMM yyyy')}
          </p>
        </div>
      </header>

      <div className='px-4 pb-10'>
        <div className='mx-auto w-full max-w-md flex flex-col gap-5'>
          {/* Activity info card */}
          <div
            className='rounded-3xl p-5'
            style={{
              background: 'var(--card)',
              border: '1px solid var(--border)',
            }}
          >
            <h1 className='m-0 text-xl font-semibold leading-snug'>
              {activity.name}
            </h1>
            {(unitName || governorshipName) && (
              <p
                className='m-0 mt-1 text-sm font-mono'
                style={{ color: 'var(--muted)' }}
              >
                {[unitName, governorshipName].filter(Boolean).join(' · ')}
              </p>
            )}
            {activity.desc && (
              <span
                className='inline-block mt-3 text-xs font-semibold rounded-full px-3 py-1'
                style={{
                  background: 'rgba(79,127,255,0.15)',
                  color: 'var(--accent)',
                }}
              >
                {FREQ_LABELS[activity.freq] || activity.freq} — {activity.desc}
              </span>
            )}
          </div>

          {/* Fields */}
          <form onSubmit={handleSubmit} className='flex flex-col gap-5'>
            {(activity.fields || []).map((field) => (
              <FieldRenderer
                key={field.id}
                field={field}
                value={values[field.id]}
                onChange={(val) => handleChange(field.id, val)}
                error={errors[field.id]}
                activity={activity}
                userLevel={user.level}
              />
            ))}

            <button
              type='submit'
              disabled={submitting}
              className='w-full rounded-2xl py-4 text-base font-semibold cursor-pointer mt-2'
              style={{
                background: submitting ? 'var(--border)' : 'var(--accent)',
                color: '#fff',
                border: 'none',
                opacity: submitting ? 0.7 : 1,
              }}
            >
              {submitting ? 'Saving…' : 'Log activity →'}
            </button>
          </form>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div
          className='fixed bottom-8 left-1/2 -translate-x-1/2 rounded-2xl px-6 py-3 text-sm font-semibold shadow-xl'
          style={{ background: 'var(--green)', color: '#0C0F1A', zIndex: 50 }}
        >
          {toast}
        </div>
      )}
    </div>
  )
}
