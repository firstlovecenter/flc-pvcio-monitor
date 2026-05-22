// src/screens/admin/LeaderDetailScreen.jsx
// Activity breakdown for a single leader — both weeks.
// Route: /admin/leader/:userId

import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import AdminTopBar from '../../components/admin/AdminTopBar'
import ComplianceBar from '../../components/admin/ComplianceBar'
import ActivityStatusRow from '../../components/admin/ActivityStatusRow'
import WeekToggle from '../../components/admin/WeekToggle'
import { loadLeaderCompliance } from '../../utils/compliance'
import { weekLabel } from '../../utils/timeline'

const LEVEL_LABEL = {
  bacenta: 'Bacenta Leader',
  governorship: 'Governor',
  overseer: 'Overseer',
  bishop: 'Bishop',
}

export default function LeaderDetailScreen() {
  const { userId } = useParams()
  const [week, setWeek] = useState('last')
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      setError('')
      try {
        // We need the streamName for Supabase queries — resolve it from the leader record.
        // fetchLeaderById is called inside loadLeaderCompliance.
        // Pass a placeholder stream name; the mock fetch stubs ignore it.
        // When real Neo4j is wired, streamName will come from the leader object.
        const result = await loadLeaderCompliance(userId, 'Colossians')
        if (!cancelled) setData(result)
      } catch (err) {
        if (!cancelled) setError(err.message || 'Failed to load leader data')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [userId])

  const activeData = data
    ? week === 'last'
      ? data.lastWeek
      : data.thisWeek
    : null
  const leader = data?.leader

  // Determine back href from leader's level
  function backHref() {
    if (!leader) return '/admin/dashboard'
    if (leader.level === 'bacenta' && leader.governorshipId)
      return `/admin/gov/${leader.governorshipId}`
    if (leader.level === 'governorship' && leader.councilId)
      return `/admin/council/${leader.councilId}`
    if (leader.councilId) return `/admin/council/${leader.councilId}`
    return '/admin/dashboard'
  }

  return (
    <div
      className='min-h-dvh'
      style={{ background: 'var(--bg)', color: 'var(--text)' }}
    >
      <AdminTopBar title={leader?.fullName ?? 'Leader'} backHref={backHref()} />

      <div className='px-4 pt-4 pb-8'>
        {/* Leader meta */}
        {leader && (
          <div className='mb-4'>
            <p className='text-xs' style={{ color: 'var(--muted)' }}>
              {leader.bacentaName ??
                leader.governorshipName ??
                leader.councilName}
              {' · '}
              {LEVEL_LABEL[leader.level] ?? leader.level}
            </p>
          </div>
        )}

        {/* Week toggle */}
        <div className='mb-4'>
          <WeekToggle value={week} onChange={setWeek} />
          {activeData && (
            <p className='text-xs mt-2' style={{ color: 'var(--muted)' }}>
              {weekLabel(activeData.weekStr)}
              {week === 'this' && (
                <span
                  className='ml-2 px-1.5 py-0.5 rounded text-xs'
                  style={{
                    background: 'rgba(79,127,255,.15)',
                    color: 'var(--accent)',
                  }}
                >
                  In progress
                </span>
              )}
            </p>
          )}
        </div>

        {error && (
          <p
            className='text-xs rounded-lg px-3 py-2 mb-4'
            style={{ background: 'rgba(248,112,96,.12)', color: '#F87060' }}
          >
            {error}
          </p>
        )}

        {/* Compliance summary bar */}
        {activeData && (
          <div
            className='rounded-2xl p-4 mb-5'
            style={{
              background: 'var(--card)',
              border: '1px solid var(--border)',
            }}
          >
            <ComplianceBar
              pct={activeData.summary.pct}
              filled={activeData.summary.filled}
              total={activeData.summary.expected}
              size='md'
            />
          </div>
        )}

        {/* Activity breakdown */}
        {loading && (
          <div
            className='rounded-2xl overflow-hidden animate-pulse'
            style={{
              background: 'var(--card)',
              border: '1px solid var(--border)',
            }}
          >
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className='px-4 py-4'
                style={{
                  borderBottom: i < 3 ? '1px solid var(--border)' : 'none',
                }}
              >
                <div
                  className='h-3 rounded w-3/4 mb-1'
                  style={{ background: 'var(--border)' }}
                />
                <div
                  className='h-2 rounded w-1/2'
                  style={{ background: 'var(--border)' }}
                />
              </div>
            ))}
          </div>
        )}

        {activeData &&
          !loading &&
          (() => {
            const expected = activeData.rows.filter((r) => r.isExpected)
            const notExpected = activeData.rows.filter((r) => !r.isExpected)

            return (
              <>
                {/* Expected activities */}
                {expected.length > 0 && (
                  <div
                    className='rounded-2xl overflow-hidden mb-3'
                    style={{
                      background: 'var(--card)',
                      border: '1px solid var(--border)',
                    }}
                  >
                    {expected.map(({ activity, status, log }) => (
                      <ActivityStatusRow
                        key={activity.id}
                        activity={activity}
                        status={status}
                        log={log}
                      />
                    ))}
                  </div>
                )}

                {/* Not expected this cycle week */}
                {notExpected.length > 0 && (
                  <>
                    <p
                      className='text-xs font-semibold uppercase tracking-widest mb-2 mt-4'
                      style={{ color: 'var(--muted)' }}
                    >
                      Not expected this cycle week
                    </p>
                    <div
                      className='rounded-2xl overflow-hidden'
                      style={{
                        background: 'var(--card)',
                        border: '1px solid var(--border)',
                      }}
                    >
                      {notExpected.map(({ activity, status, log }) => (
                        <ActivityStatusRow
                          key={activity.id}
                          activity={activity}
                          status='not-expected'
                          log={log}
                        />
                      ))}
                    </div>
                  </>
                )}
              </>
            )
          })()}
      </div>
    </div>
  )
}
