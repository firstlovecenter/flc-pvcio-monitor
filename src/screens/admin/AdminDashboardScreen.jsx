// src/screens/admin/AdminDashboardScreen.jsx
// Stream selector — entry point after admin login.
// Shows rolled-up compliance for each stream as cards.

import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AdminTopBar from '../../components/admin/AdminTopBar'
import ComplianceBar from '../../components/admin/ComplianceBar'
import WeekToggle from '../../components/admin/WeekToggle'
import {
  fetchLeadersForStream,
  computeCompliance,
  rollUp,
  fetchLogsForWeek,
  getLastWeekString,
  getCurrentWeekString,
} from '../../utils/compliance'
import { weekLabel } from '../../utils/timeline'
import { MOCK_STREAMS } from '../../data/leaders'

export default function AdminDashboardScreen() {
  const navigate = useNavigate()
  const [week, setWeek] = useState('last')
  const [streamData, setStreamData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const lastWeekStr = getLastWeekString()
  const currentWeekStr = getCurrentWeekString()
  const activeWeekStr = week === 'last' ? lastWeekStr : currentWeekStr

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      setError('')
      try {
        const results = await Promise.all(
          MOCK_STREAMS.map(async (stream) => {
            const leaders = await fetchLeadersForStream(stream.id)
            const [lastLogs, thisLogs] = await Promise.all([
              fetchLogsForWeek(lastWeekStr, stream.name),
              fetchLogsForWeek(currentWeekStr, stream.name),
            ])

            const lastRows = computeCompliance(leaders, lastWeekStr, lastLogs)
            const thisRows = computeCompliance(
              leaders,
              currentWeekStr,
              thisLogs,
            )

            return {
              stream,
              last: rollUp(lastRows),
              this: rollUp(thisRows),
            }
          }),
        )
        if (!cancelled) setStreamData(results)
      } catch (err) {
        if (!cancelled)
          setError(err.message || 'Failed to load compliance data')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div
      className='min-h-dvh'
      style={{ background: 'var(--bg)', color: 'var(--text)' }}
    >
      <AdminTopBar title='PVCIO Admin' showBack={false} />

      <div className='px-4 pt-4 pb-8'>
        {/* Subtitle */}
        <p className='text-xs mb-4' style={{ color: 'var(--muted)' }}>
          First Love Church · Select a stream to review
        </p>

        {/* Week toggle */}
        <div className='mb-5'>
          <WeekToggle value={week} onChange={setWeek} />
          <p className='text-xs mt-2' style={{ color: 'var(--muted)' }}>
            {weekLabel(activeWeekStr)}
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
        </div>

        {error && (
          <p
            className='text-xs rounded-lg px-3 py-2 mb-4'
            style={{ background: 'rgba(248,112,96,.12)', color: '#F87060' }}
          >
            {error}
          </p>
        )}

        {/* Stream grid */}
        <div className='grid grid-cols-2 gap-3'>
          {loading
            ? Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className='rounded-2xl p-4 animate-pulse'
                  style={{ background: 'var(--card)', height: 110 }}
                />
              ))
            : streamData.map(({ stream, last, this: curr }) => {
                const data = week === 'last' ? last : curr
                return (
                  <button
                    key={stream.id}
                    onClick={() => navigate(`/admin/stream/${stream.id}`)}
                    className='rounded-2xl p-4 text-left transition-colors'
                    style={{
                      background: 'var(--card)',
                      border: '1px solid var(--border)',
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.borderColor = 'var(--accent)')
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.borderColor = 'var(--border)')
                    }
                  >
                    <p
                      className='text-sm font-semibold mb-1'
                      style={{ color: 'var(--text)' }}
                    >
                      {stream.name}
                    </p>
                    <p
                      className='text-xs mb-3'
                      style={{ color: 'var(--muted)' }}
                    >
                      {data.filled}/{data.total}
                    </p>
                    <ComplianceBar pct={data.pct} showLabel={false} size='sm' />
                    <p
                      className='text-xs mt-1 font-semibold'
                      style={{ color: 'var(--muted)' }}
                    >
                      {data.pct}%
                    </p>
                  </button>
                )
              })}
        </div>
      </div>
    </div>
  )
}
