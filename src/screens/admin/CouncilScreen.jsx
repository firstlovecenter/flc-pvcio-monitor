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
  rollUpLeaders,
  adminFetchLogsForWeek,
  getLastWeekString,
  getCurrentWeekString,
} from '../../utils/compliance'
import { weekLabel } from '../../utils/timeline'

export default function CouncilScreen() {
  const { councilId } = useParams()
  const [week, setWeek] = useState('last')
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [meta, setMeta] = useState(null) // { councilName, streamId, streamName }

  const lastWeekStr = getLastWeekString()
  const currentWeekStr = getCurrentWeekString()

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      setError('')
      try {
        const leaders = await fetchLeadersForCouncil(councilId)
        if (!cancelled && leaders.length) {
          setMeta({
            councilName: leaders[0].councilName,
            streamId: leaders[0].streamId,
            streamName: leaders[0].streamName,
          })
        }
        const leaderIds = leaders.map((l) => l.userId)
        const [lastLogs, thisLogs] = await Promise.all([
          adminFetchLogsForWeek(lastWeekStr, leaderIds),
          adminFetchLogsForWeek(currentWeekStr, leaderIds),
        ])

        const lastRows = computeCompliance(leaders, lastWeekStr, lastLogs)
        const thisRows = computeCompliance(leaders, currentWeekStr, thisLogs)

        // Derive unique governorships from Neo4j data
        const govMap = new Map()
        leaders.forEach((l) => {
          if (l.governorshipId && !govMap.has(l.governorshipId)) {
            const governor = leaders.find(
              (x) =>
                x.level === 'governorship' &&
                x.governorshipId === l.governorshipId,
            )
            govMap.set(l.governorshipId, {
              id: l.governorshipId,
              name: l.governorshipName,
              governorName: governor?.fullName ?? '',
            })
          }
        })
        const derivedGovs = Array.from(govMap.values())

        const govStats = derivedGovs.map((gov) => {
          const gLast = lastRows.filter((r) => r.governorshipId === gov.id)
          const gThis = thisRows.filter((r) => r.governorshipId === gov.id)
          return {
            gov,
            last: rollUpLeaders(gLast),
            this: rollUpLeaders(gThis),
          }
        })

        if (!cancelled)
          setData({
            lastSummary: rollUpLeaders(lastRows),
            thisSummary: rollUpLeaders(thisRows),
            govs: govStats,
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
  }, [councilId]) // eslint-disable-line react-hooks/exhaustive-deps

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
        title={meta?.councilName ?? 'Council'}
        backHref={
          meta?.streamId ? `/admin/stream/${meta.streamId}` : '/admin/dashboard'
        }
      />

      <div className='px-4 pt-4 pb-8'>
        <div className='mb-4'>
          <WeekToggle value={week} onChange={setWeek} />
          <p className='text-xs mt-2' style={{ color: 'var(--muted)' }}>
            {weekLabel(activeWeekStr)}
          </p>
        </div>

        {summary && (
          <div
            className='rounded-2xl p-4 mb-5'
            style={{
              background: 'var(--card)',
              border: '1px solid var(--border)',
            }}
          >
            <p className='text-xs mb-2' style={{ color: 'var(--muted)' }}>
              {summary.compliant}/{summary.total} leaders up to date across all
              governorships
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
          By Governorship
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
            : data?.govs.map(({ gov, last, this: curr }, i) => {
                const d = week === 'last' ? last : curr
                return (
                  <div
                    key={gov.id}
                    style={{
                      borderBottom:
                        i < data.govs.length - 1
                          ? '1px solid var(--border)'
                          : 'none',
                    }}
                  >
                    <DrillDownRow
                      title={gov.name}
                      subtitle={gov.governorName}
                      pct={d.pct}
                      filled={d.compliant}
                      total={d.total}
                      href={`/admin/gov/${gov.id}`}
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
