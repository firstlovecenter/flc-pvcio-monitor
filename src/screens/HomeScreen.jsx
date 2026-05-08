import { useEffect, useState } from 'react'
import { format, formatDistanceToNow } from 'date-fns'
import { useNavigate } from 'react-router-dom'
import { CATEGORIES, getActivitiesByCategoryAndLevel } from '../data/activities'
import { getRecentLogs } from '../utils/logs'
import {
  getCurrentUser,
  logout,
  resolveChurchContextsForUser,
  withActiveChurch,
} from '../utils/auth'

const CHURCH_STORAGE_KEY = 'activeChurchId'

function levelBadgeColor(level) {
  if (level === 'bacenta') return '#7fa8ff'
  if (level === 'governorship') return '#c4b5fd'
  return '#fcd34d'
}

export default function HomeScreen() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [loadingChurches, setLoadingChurches] = useState(true)
  const [expandedLogId, setExpandedLogId] = useState(null)
  const [recentLogs, setRecentLogs] = useState([])

  useEffect(() => {
    let mounted = true

    async function hydrateUser() {
      const stored = sessionStorage.getItem('currentUser')
      const baseUser = stored ? JSON.parse(stored) : getCurrentUser()
      if (!baseUser) return

      setLoadingChurches(true)
      const resolved = await resolveChurchContextsForUser(baseUser)
      if (!mounted) return

      const storedChurchId = sessionStorage.getItem(CHURCH_STORAGE_KEY)
      const selectedChurch =
        resolved.churchContexts.find((ctx) => ctx.id === storedChurchId) ||
        resolved.activeChurch ||
        null

      const nextUser = withActiveChurch(
        {
          ...baseUser,
          churchContexts: resolved.churchContexts,
        },
        selectedChurch,
      )

      sessionStorage.setItem('currentUser', JSON.stringify(nextUser))
      if (selectedChurch?.id) {
        sessionStorage.setItem(CHURCH_STORAGE_KEY, selectedChurch.id)
      }
      setUser(nextUser)
      setLoadingChurches(false)
    }

    hydrateUser()
    return () => {
      mounted = false
    }
  }, [])

  // Fetch recent logs whenever the user identity is ready
  useEffect(() => {
    if (!user?.userId) return
    getRecentLogs(user.userId, 20)
      .then(setRecentLogs)
      .catch((err) => console.error('[HomeScreen] getRecentLogs:', err.message))
  }, [user?.userId])

  function handleLogout() {
    logout()
    sessionStorage.removeItem('currentUser')
    sessionStorage.removeItem(CHURCH_STORAGE_KEY)
    navigate('/')
  }

  function handleChurchChange(churchId) {
    if (!user?.churchContexts?.length) return
    const selected = user.churchContexts.find((ctx) => ctx.id === churchId)
    if (!selected) return
    const nextUser = withActiveChurch(user, selected)
    setUser(nextUser)
    sessionStorage.setItem(CHURCH_STORAGE_KEY, selected.id)
    sessionStorage.setItem('currentUser', JSON.stringify(nextUser))
  }

  if (!user) {
    return (
      <div className='min-h-dvh flex items-center justify-center' style={{ background: 'var(--bg)' }}>
        <p style={{ color: 'var(--muted)' }}>Loading user...</p>
      </div>
    )
  }

  return (
    <div
      className='min-h-dvh px-4 py-6'
      style={{
        background:
          'radial-gradient(130% 90% at 50% -10%, #1A2450 0%, #101528 50%, #0C0F1A 100%)',
      }}
    >
      <div className='mx-auto w-full max-w-md'>
        <div
          className='rounded-3xl p-5'
          style={{
            background: 'rgba(3,10,38,0.92)',
            border: '1px solid #1d2a55',
            boxShadow: '0 30px 80px rgba(0,0,0,0.45)',
          }}
        >
          <div className='flex items-start justify-between gap-3'>
            <div>
              <h1 className='m-0 text-3xl font-semibold tracking-tight'>
                Hi <span style={{ color: 'var(--accent)' }}>{user.firstName}</span>
              </h1>
              <p className='m-0 mt-1 text-sm' style={{ color: 'var(--muted)' }}>
                {user.unitName} · {format(new Date(), 'EEE, MMM d')}
              </p>
            </div>
            <button
              type='button'
              onClick={handleLogout}
              className='rounded-xl px-3 py-2 text-xs font-semibold cursor-pointer'
              style={{
                color: 'var(--text)',
                background: 'rgba(248,112,96,0.1)',
                border: '1px solid rgba(248,112,96,0.35)',
              }}
            >
              Logout
            </button>
          </div>

          <div className='mt-4 flex items-center justify-between gap-3'>
            <span
              className='rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider'
              style={{
                color: '#101528',
                background: levelBadgeColor(user.level),
              }}
            >
              {user.level}
            </span>
            <span className='text-xs' style={{ color: 'var(--muted)' }}>
              {loadingChurches ? 'Syncing churches...' : 'Context ready'}
            </span>
          </div>

          <div className='mt-4'>
            <label className='mb-1 block text-xs uppercase tracking-wider' style={{ color: 'var(--muted)' }}>
              Church context
            </label>
            <select
              className='w-full rounded-xl px-3 py-3 text-sm outline-none'
              style={{
                background: '#1c2650',
                color: 'var(--text)',
                border: '1px solid #2b3970',
              }}
              value={user.activeChurch?.id || ''}
              onChange={(e) => handleChurchChange(e.target.value)}
              disabled={loadingChurches || !user.churchContexts?.length}
            >
              {(user.churchContexts || []).map((ctx) => (
                <option key={`${ctx.level}:${ctx.id}`} value={ctx.id}>
                  {ctx.name} ({ctx.level === 'oversight' ? 'Council' : ctx.level})
                </option>
              ))}
            </select>
          </div>

          <div className='mt-5 grid grid-cols-2 gap-3'>
            {CATEGORIES.map((category, index) => {
              const count = getActivitiesByCategoryAndLevel(category.id, user.level).length
              return (
                <button
                  type='button'
                  key={category.id}
                  onClick={() => navigate(`/pick/${category.id}`)}
                  className={`text-left rounded-2xl p-4 cursor-pointer transition-transform active:scale-[0.98] ${
                    index === CATEGORIES.length - 1 ? 'col-span-2' : ''
                  }`}
                  style={{
                    background: 'rgba(36,48,95,0.85)',
                    border: '1px solid #33457f',
                  }}
                >
                  <div className='text-xl'>{category.icon}</div>
                  <p className='m-0 mt-1 text-lg font-semibold'>{category.label}</p>
                  <p className='m-0 text-xs' style={{ color: 'var(--muted)' }}>
                    {count} activities
                  </p>
                </button>
              )
            })}
          </div>

          <div className='mt-6 border-t pt-4' style={{ borderColor: '#24305d' }}>
            <p className='m-0 text-xs uppercase tracking-[0.2em]' style={{ color: 'var(--muted)' }}>
              Recent Activity
            </p>

            <div className='mt-3 flex flex-col gap-2'>
              {recentLogs.length === 0 && (
                <p className='m-0 text-sm' style={{ color: 'var(--muted)' }}>
                  No activity logged yet for this account.
                </p>
              )}

              {recentLogs.map((log) => {
                const expanded = expandedLogId === log.id
                return (
                  <button
                    type='button'
                    key={log.id}
                    onClick={() => setExpandedLogId(expanded ? null : log.id)}
                    className='w-full rounded-xl p-3 text-left cursor-pointer'
                    style={{
                      background: 'rgba(18,28,62,0.72)',
                      border: '1px solid #233264',
                    }}
                  >
                    <div className='flex items-center justify-between gap-2'>
                      <div>
                        <p className='m-0 text-sm font-semibold'>{log.activity_name}</p>
                        <p className='m-0 text-xs' style={{ color: 'var(--muted)' }}>
                          {log.bacenta_name || log.governorship_name || log.council_name || user.unitName}
                        </p>
                      </div>
                      <p className='m-0 text-xs' style={{ color: 'var(--muted)' }}>
                        {log.submitted_at && !isNaN(new Date(log.submitted_at))
                          ? formatDistanceToNow(new Date(log.submitted_at), { addSuffix: true })
                          : 'just now'}
                      </p>
                    </div>

                    {expanded && (
                      <div className='mt-2 text-xs' style={{ color: '#bac8f5' }}>
                        {Object.entries(log.fields || {}).map(([field, value]) => (
                          <p className='m-0' key={`${log.id}-${field}`}>
                            {field}: {String(value)}
                          </p>
                        ))}
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
