// src/screens/admin/GovernorshipScreen.jsx
// Bacenta / leader drill-down for a governorship.
// Route: /admin/gov/:govId

import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import AdminTopBar from '../../components/admin/AdminTopBar'
import ComplianceBar from '../../components/admin/ComplianceBar'
import DrillDownRow from '../../components/admin/DrillDownRow'
import WeekToggle from '../../components/admin/WeekToggle'
import { complianceStatus } from '../../utils/compliance'
import {
  fetchLeadersForGovernorship,
  computeCompliance,
  rollUp,
  fetchLogsForWeek,
  getLastWeekString,
  getCurrentWeekString,
} from '../../utils/compliance'
import { weekLabel } from '../../utils/timeline'
import {
  MOCK_GOVERNORSHIPS,
  MOCK_COUNCILS,
  MOCK_STREAMS,
  MOCK_BACENTAS,
} from '../../data/leaders'

export default function GovernorshipScreen() {
  const { govId } = useParams()
  const navigate  = useNavigate()
  const [week, setWeek]     = useState('last')
  const [data, setData]     = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]   = useState('')

  const gov      = MOCK_GOVERNORSHIPS.find((g) => g.id === govId)
  const council  = gov ? MOCK_COUNCILS.find((c) => c.id === gov.councilId) : null
  const stream   = council ? MOCK_STREAMS.find((s) => s.id === council.streamId) : null
  const bacentas = MOCK_BACENTAS.filter((b) => b.governorshipId === govId)

  const lastWeekStr    = getLastWeekString()
  const currentWeekStr = getCurrentWeekString()

  useEffect(() => {
    if (!gov || !stream) return
    let cancelled = false

    async function load() {
      setLoading(true)
      setError('')
      try {
        const leaders = await fetchLeadersForGovernorship(govId)
        const [lastLogs, thisLogs] = await Promise.all([
          fetchLogsForWeek(lastWeekStr, stream.name),
          fetchLogsForWeek(currentWeekStr, stream.name),
        ])

        const lastRows = computeCompliance(leaders, lastWeekStr, lastLogs)
        const thisRows = computeCompliance(leaders, currentWeekStr, thisLogs)

        // Separate governor row from bacenta rows
        const govLastRow  = lastRows.find((r) => r.userId === gov.governorUserId)
        const govThisRow  = thisRows.find((r) => r.userId === gov.governorUserId)

        const bacStats = bacentas.map((bac) => {
          const bLast = lastRows.find((r) => r.userId === bac.leaderUserId)
          const bThis = thisRows.find((r) => r.userId === bac.leaderUserId)
          return { bac, last: bLast, this: bThis }
        })

        if (!cancelled) setData({
          lastSummary: rollUp(lastRows),
          thisSummary: rollUp(thisRows),
          govRow: { last: govLastRow, this: govThisRow },
          bacentas: bacStats,
        })
      } catch (err) {
        if (!cancelled) setError(err.message || 'Failed to load')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => { cancelled = true }
  }, [govId]) // eslint-disable-line react-hooks/exhaustive-deps

  const activeWeekStr = week === 'last' ? lastWeekStr : currentWeekStr
  const summary = data ? (week === 'last' ? data.lastSummary : data.thisSummary) : null

  function LeaderCard({ row, name, href }) {
    if (!row) return null
    const { label, color } = complianceStatus(row.pct)
    return (
      <button
        onClick={() => navigate(href)}
        className='w-full text-left rounded-2xl p-4 mb-2 transition-colors'
        style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
        onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--accent)')}
        onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border)')}
      >
        <div className='flex items-center justify-between mb-2'>
          <p className='text-sm font-semibold' style={{ color: 'var(--text)' }}>{name}</p>
          <span className='text-xs font-bold' style={{ color }}>{row.pct}%</span>
        </div>
        <ComplianceBar pct={row.pct} filled={row.filled} total={row.expected} showLabel={false} size='sm' />
        <p className='text-xs mt-1' style={{ color }}>
          {week === 'this' ? 'In progress' : label}
        </p>
      </button>
    )
  }

  return (
    <div className='min-h-dvh' style={{ background: 'var(--bg)', color: 'var(--text)' }}>
      <AdminTopBar
        title={gov ? `${gov.name} Governorship` : 'Governorship'}
        backHref={council ? `/admin/council/${council.id}` : '/admin/dashboard'}
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
              {summary.filled}/{summary.total} filled across governorship
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

        {/* Governor */}
        {!loading && data?.govRow && (
          <>
            <p className='text-xs font-semibold uppercase tracking-widest mb-2'
              style={{ color: 'var(--muted)' }}>
              Governor
            </p>
            <LeaderCard
              row={week === 'last' ? data.govRow.last : data.govRow.this}
              name={gov.governorName}
              href={`/admin/leader/${gov.governorUserId}`}
            />
          </>
        )}

        {/* Bacentas */}
        <p className='text-xs font-semibold uppercase tracking-widest mt-4 mb-2'
          style={{ color: 'var(--muted)' }}>
          Bacentas
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
            : data?.bacentas.map(({ bac, last, this: curr }, i) => {
                const row = week === 'last' ? last : curr
                if (!row) return null
                return (
                  <div key={bac.id}
                    style={{ borderBottom: i < data.bacentas.length - 1 ? '1px solid var(--border)' : 'none' }}>
                    <DrillDownRow
                      title={bac.name}
                      subtitle={bac.leaderName}
                      pct={row.pct}
                      filled={row.filled}
                      total={row.expected}
                      href={`/admin/leader/${bac.leaderUserId}`}
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
