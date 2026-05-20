import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  getActivitiesByCategoryAndLevel,
  getCategoryById,
  groupByFreq,
} from '../data/activities'
import { getCurrentUser } from '../utils/auth'
import { addLog } from '../utils/logs'

const GROUP_LABELS = {
  weekly: 'Weekly Recurring',
  cycle: 'Once This 6-Week Cycle',
}

const FREQ_ORDER = ['weekly', 'cycle']

export default function ActivityPickerScreen() {
  const navigate = useNavigate()
  const { cat } = useParams()
  const user =
    JSON.parse(sessionStorage.getItem('currentUser') || 'null') ||
    getCurrentUser()

  const [quickToast, setQuickToast] = useState(null)

  async function handleQuickLog(activity) {
    try {
      await addLog(
        user,
        {
          activityId: activity.id,
          activityName: activity.name,
          category: activity.category,
          level: user.level,
          freq: activity.freq,
          fields: {},
        },
        null,
      )
      setQuickToast(`${activity.name} — marked as done!`)
      setTimeout(() => {
        setQuickToast(null)
        navigate('/home')
      }, 1200)
    } catch (err) {
      console.error('Quick log failed:', err)
      setQuickToast('Something went wrong — try again')
      setTimeout(() => setQuickToast(null), 2500)
    }
  }

  const category = getCategoryById(cat)
  const grouped = useMemo(() => {
    const activities = getActivitiesByCategoryAndLevel(cat, user.level)
    return groupByFreq(activities)
  }, [cat, user.level])

  const hasAny = FREQ_ORDER.some((f) => grouped[f]?.length)

  if (!category) {
    return (
      <div
        className='min-h-dvh flex items-center justify-center'
        style={{ background: 'var(--bg)', color: 'var(--muted)' }}
      >
        Category not found.
      </div>
    )
  }

  return (
    <div
      className='min-h-dvh'
      style={{
        background:
          'radial-gradient(120% 80% at 50% -10%, #1A2450 0%, #101528 45%, #0C0F1A 100%)',
        color: 'var(--text)',
      }}
    >
      {/* Sticky header */}
      <header
        className='sticky top-0 z-10 flex items-center justify-between px-4 pt-10 pb-4'
        style={{
          background: 'rgba(12,15,26,0.92)',
          backdropFilter: 'blur(12px)',
        }}
      >
        {/* Back + title */}
        <div className='flex items-center gap-3'>
          <button
            type='button'
            onClick={() => navigate('/home')}
            aria-label='Back'
            className='flex h-9 w-9 shrink-0 items-center justify-center rounded-full cursor-pointer transition-opacity active:opacity-60'
            style={{ background: '#1a2450', border: '1px solid #2d3c74' }}
          >
            <svg
              width='16'
              height='16'
              viewBox='0 0 24 24'
              fill='none'
              stroke='currentColor'
              strokeWidth='2.5'
              strokeLinecap='round'
              strokeLinejoin='round'
            >
              <path d='M19 12H5M12 5l-7 7 7 7' />
            </svg>
          </button>
          <div>
            <h1 className='m-0 text-xl font-bold leading-tight'>
              {category.label}
            </h1>
            <p className='m-0 text-xs' style={{ color: 'var(--muted)' }}>
              Select activity
            </p>
          </div>
        </div>

        {/* Category badge — uses the category's own colour */}
        <span
          className='rounded-full px-3 py-1.5 text-xs font-semibold flex items-center gap-1 shrink-0'
          style={{
            color: category.color,
            background: category.bg,
            border: `1px solid ${category.color}40`,
          }}
        >
          {category.icon} {category.label}
        </span>
      </header>

      {/* Activity list */}
      <main className='px-4 pb-10'>
        {!hasAny && (
          <p className='mt-20 text-center' style={{ color: 'var(--muted)' }}>
            No activities available at your level.
          </p>
        )}

        {FREQ_ORDER.map((freq) => {
          const items = grouped[freq] || []
          if (!items.length) return null

          return (
            <section key={freq} className='mb-6'>
              <p
                className='mb-2 mt-0 text-[10px] font-bold uppercase tracking-[0.18em]'
                style={{ color: 'var(--muted)' }}
              >
                {GROUP_LABELS[freq]}
              </p>

              <div className='flex flex-col gap-2'>
                {items.map((activity) => (
                  <button
                    type='button'
                    key={activity.id}
                    onClick={() =>
                      activity.interaction === 'quick'
                        ? handleQuickLog(activity)
                        : navigate(`/log/${activity.id}`)
                    }
                    className='w-full rounded-2xl px-4 py-4 text-left cursor-pointer transition-all active:scale-[0.98] active:opacity-80'
                    style={{
                      background: 'var(--card)',
                      border: '1px solid var(--border)',
                    }}
                  >
                    <div className='flex items-center justify-between gap-3'>
                      <div className='min-w-0'>
                        <p
                          className='m-0 truncate font-semibold'
                          style={{ color: 'var(--text)' }}
                        >
                          {activity.name}
                        </p>
                        <p
                          className='m-0 mt-0.5 text-sm'
                          style={{ color: 'var(--muted)' }}
                        >
                          {activity.desc}
                        </p>
                      </div>
                      <svg
                        className='shrink-0'
                        width='16'
                        height='16'
                        viewBox='0 0 24 24'
                        fill='none'
                        stroke='currentColor'
                        strokeWidth='2.5'
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        style={{ color: 'var(--muted)' }}
                      >
                        <path d='M9 18l6-6-6-6' />
                      </svg>
                    </div>
                  </button>
                ))}
              </div>
            </section>
          )
        })}
      </main>

      {/* Quick-tap toast */}
      {quickToast && (
        <div
          className='fixed bottom-8 left-1/2 -translate-x-1/2 rounded-2xl px-6 py-3 text-sm font-semibold shadow-xl'
          style={{ background: 'var(--green)', color: '#0C0F1A', zIndex: 50 }}
        >
          {quickToast}
        </div>
      )}
    </div>
  )
}
