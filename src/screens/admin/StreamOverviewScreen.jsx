// src/screens/admin/StreamOverviewScreen.jsx
// Council drill-down for a stream.
// Route: /admin/stream/:streamId

import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import AdminTopBar from '../../components/admin/AdminTopBar'
import ComplianceBar from '../../components/admin/ComplianceBar'
import DrillDownRow from '../../components/admin/DrillDownRow'
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
import { MOCK_STREAMS, MOCK_COUNCILS } from '../../data/leaders'

export default function StreamOverviewScreen() {
  const { streamId } = useParams()
  const navigate = useNavigate()
  const [week, setWeek] = useState('last')
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const stream = MOCK_STREAMS.find((s) => s.id === streamId)
  const councils = MOCK_COUNCILS.filter((c) => c.streamId === streamId)

  const lastWeekStr = getLastWeekString()
  const currentWeekStr = getCurrentWeekString()

  useEffect(() => {
    if (!stream) return
    let cancelled = false

    async function load() {
      setLoading(true)
      setError('')
      try {
        const leaders = await fetchLeadersForStream(streamId)
        const leaderIds = leaders.map((l) => l.userId)
        const [lastLogs, thisLogs] = await Promise.all([
          fetchLogsForWeek(lastWeekStr, leaderIds),
          fetchLogsForWeek(currentWeekStr, leaderIds),
        ])

        const lastRows = computeCompliance(leaders, lastWeekStr, lastLogs)
        const thisRows = computeCompliance(leaders, currentWeekStr, thisLogs)

        // Roll up per council
        const councilStats = councils.map((council) => {
          const cLast = lastRows.filter((r) => r.councilId === council.id)
          const cThis = thisRows.filter((r) => r.councilId === council.id)
          return {
            council,
            last: rollUp(cLast),
            this: rollUp(cThis),
          }
        })

        if (!cancelled)
          setData({
            lastSummary: rollUp(lastRows),
            thisSummary: rollUp(thisRows),
            councils: councilStats,
          })
      } catch (err) {
        if (!cancelled) setError(err.message || 'Failed to load')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [streamId]) // eslint-disable-line react-hooks/exhaustive-deps

  const activeWeekStr = week === 'last' ? lastWeekStr : currentWeekStr
  const summary = data
    ? week === 'last'
      ? data.lastSummary
      : data.thisSummary
    : null

  return (
    <div
      className='min-h-dvh'
      style={{ background: 'var(--bg)', color: 'var(--text)' }}
    >
      <AdminTopBar
        title={`${stream?.name ?? 'Stream'} Stream`}
        backHref='/admin/dashboard'
      />

      <div className='px-4 pt-4 pb-8'>
        {/* Week toggle */}
        <div className='mb-4'>
          <WeekToggle value={week} onChange={setWeek} />
          <p className='text-xs mt-2' style={{ color: 'var(--muted)' }}>
            {weekLabel(activeWeekStr)}
          </p>
        </div>

        {/* Stream summary */}
        {summary && (
          <div
            className='rounded-2xl p-4 mb-5'
            style={{
              background: 'var(--card)',
              border: '1px solid var(--border)',
            }}
          >
            <p className='text-xs mb-2' style={{ color: 'var(--muted)' }}>
              {summary.filled}/{summary.total} filled across all councils
            </p>
            <ComplianceBar pct={summary.pct} size='md' />
          </div>
        )}

        {error && (
          <p
            className='text-xs rounded-lg px-3 py-2 mb-4'
            style={{ background: 'rgba(248,112,96,.12)', color: '#F87060' }}
          >
            {error}
          </p>
        )}

        <p
          className='text-xs font-semibold uppercase tracking-widest mb-2'
          style={{ color: 'var(--muted)' }}
        >
          By Council
        </p>

        <div
          className='rounded-2xl overflow-hidden'
          style={{
            background: 'var(--card)',
            border: '1px solid var(--border)',
          }}
        >
          {loading
            ? Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className='px-4 py-4 animate-pulse'
                  style={{
                    borderBottom: i < 2 ? '1px solid var(--border)' : 'none',
                  }}
                >
                  <div
                    className='h-3 rounded w-1/2 mb-2'
                    style={{ background: 'var(--border)' }}
                  />
                  <div
                    className='h-2 rounded w-3/4'
                    style={{ background: 'var(--border)' }}
                  />
                </div>
              ))
            : data?.councils.map(({ council, last, this: curr }, i) => {
                const d = week === 'last' ? last : curr
                return (
                  <div
                    key={council.id}
                    style={{
                      borderBottom:
                        i < data.councils.length - 1
                          ? '1px solid var(--border)'
                          : 'none',
                    }}
                  >
                    <DrillDownRow
                      title={council.name}
                      subtitle={council.overseerName}
                      pct={d.pct}
                      filled={d.filled}
                      total={d.total}
                      href={`/admin/council/${council.id}`}
                      inProgress={week === 'this'}
                    />
                  </div>
                )
              })}
        </div>
      </div>
    </div>
  )
}
