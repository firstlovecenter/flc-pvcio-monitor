// src/screens/admin/CouncilScreen.jsx
// Governorship drill-down for a council.
// Route: /admin/council/:councilId

import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import AdminTopBar from '../../components/admin/AdminTopBar'
import ComplianceBar from '../../components/admin/ComplianceBar'
import DrillDownRow from '../../components/admin/DrillDownRow'
import WeekToggle from '../../components/admin/WeekToggle'
import {
  fetchLeadersForCouncil,
  computeCompliance,
  rollUp,
  fetchLogsForWeek,
  getLastWeekString,
  getCurrentWeekString,
} from '../../utils/compliance'
import { weekLabel } from '../../utils/timeline'
import { MOCK_COUNCILS, MOCK_STREAMS, MOCK_GOVERNORSHIPS } from '../../data/leaders'

export default function CouncilScreen() {
  const { councilId } = useParams()
  const [week, setWeek] = useState('last')
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const council  = MOCK_COUNCILS.find((c) => c.id === councilId)
  const stream   = council ? MOCK_STREAMS.find((s) => s.id === council.streamId) : null
  const govs     = MOCK_GOVERNORSHIPS.filter((g) => g.councilId === councilId)

  const lastWeekStr    = getLastWeekString()
  const currentWeekStr = getCurrentWeekString()

  useEffect(() => {
    if (!council || !stream) return
    let cancelled = false

    async function load() {
      setLoading(true)
      setError('')
      try {
        const leaders = await fetchLeadersForCouncil(councilId)
        const [lastLogs, thisLogs] = await Promise.all([
          fetchLogsForWeek(lastWeekStr, stream.name),
          fetchLogsForWeek(currentWeekStr, stream.name),
        ])

        const lastRows = computeCompliance(leaders, lastWeekStr, lastLogs)
        const thisRows = computeCompliance(leaders, currentWeekStr, thisLogs)

        const govStats = govs.map((gov) => {
          const gLast = lastRows.filter((r) => r.governorshipId === gov.id || r.userId === gov.governorUserId)
          const gThis = thisRows.filter((r) => r.governorshipId === gov.id || r.userId === gov.governorUserId)
          return {
            gov,
            last: rollUp(gLast),
            this: rollUp(gThis),
          }
        })

        if (!cancelled) setData({
          lastSummary: rollUp(lastRows),
          thisSummary: rollUp(thisRows),
          govs: govStats,
        })
      } catch (err) {
        if (!cancelled) setError(err.message || 'Failed to load')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => { cancelled = true }
  }, [councilId]) // eslint-disable-line react-hooks/exhaustive-deps

  const activeWeekStr = week === 'last' ? lastWeekStr : currentWeekStr
  const summary = data ? (week === 'last' ? data.lastSummary : data.thisSummary) : null

  return (
    <div className='min-h-dvh' style={{ background: 'var(--bg)', color: 'var(--text)' }}>
      <AdminTopBar
        title={council?.name ?? 'Council'}
        backHref={stream ? `/admin/stream/${stream.id}` : '/admin/dashboard'}
      />

      <div className='px-4 pt-4 pb-8'>
        <div className='mb-4'>
          <WeekToggle value={week} onChange={setWeek} />
          <p className='text-xs mt-2' style={{ color: 'var(--muted)' }}>
            {weekLabel(activeWeekStr)}
          </p>
        </div>

        {summary && (
          <div className='rounded-2xl p-4 mb-5'
            style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
            <p className='text-xs mb-2' style={{ color: 'var(--muted)' }}>
              {summary.filled}/{summary.total} filled across all governorships
            </p>
            <ComplianceBar pct={summary.pct} size='md' />
          </div>
        )}

        {error && (
          <p className='text-xs rounded-lg px-3 py-2 mb-4'
            style={{ background: 'rgba(248,112,96,.12)', color: '#F87060' }}>
            {error}
          </p>
        )}

        <p className='text-xs font-semibold uppercase tracking-widest mb-2'
          style={{ color: 'var(--muted)' }}>
          By Governorship
        </p>

        <div className='rounded-2xl overflow-hidden'
          style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
          {loading
            ? Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className='px-4 py-4 animate-pulse'
                  style={{ borderBottom: i < 2 ? '1px solid var(--border)' : 'none' }}>
                  <div className='h-3 rounded w-1/2 mb-2' style={{ background: 'var(--border)' }} />
                  <div className='h-2 rounded w-3/4' style={{ background: 'var(--border)' }} />
                </div>
              ))
            : data?.govs.map(({ gov, last, this: curr }, i) => {
                const d = week === 'last' ? last : curr
                return (
                  <div key={gov.id}
                    style={{ borderBottom: i < data.govs.length - 1 ? '1px solid var(--border)' : 'none' }}>
                    <DrillDownRow
                      title={gov.name}
                      subtitle={gov.governorName}
                      pct={d.pct}
                      filled={d.filled}
                      total={d.total}
                      href={`/admin/gov/${gov.id}`}
                      inProgress={week === 'this'}
                    />
                  </div>
                )
              })
          }
        </div>
      </div>
    </div>
  )
}
