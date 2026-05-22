// src/screens/TimelineScreen.jsx
// Main screen — replaces HomeScreen.
// Shows this week's recurring activities in day order, with future weeks below.
// Auto-scrolls to today on mount.

import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { format, subWeeks } from 'date-fns'
import {
  getCurrentUser,
  resolveChurchContextsForUser,
  withActiveChurch,
  logout,
} from '../utils/auth'
import { getLogsForTimeline } from '../utils/logs'
import {
  buildTimeline,
  groupByWeekAndDay,
  getDaysOfISOWeek,
  weekLabel,
  weekSeparatorLabel,
  weekProgress,
  currentISOWeek,
} from '../utils/timeline'
import WeekHeader from '../components/WeekHeader'
import DaySection from '../components/DaySection'

const TODAY = format(new Date(), 'yyyy-MM-dd')
const WEEKS_AHEAD = 12
const WEEKS_BACK = 2

// ── Level badge ──────────────────────────────────────────────────────────
const LEVEL_BADGE = {
  bacenta: { label: 'Bacenta', color: '#7fa8ff' },
  governorship: { label: 'Governor', color: '#c4b5fd' },
  overseer: { label: 'Overseer', color: '#fcd34d' },
  bishop: { label: 'Bishop', color: '#fcd34d' },
}

function levelBadge(level) {
  return LEVEL_BADGE[level] || { label: level, color: 'var(--muted)' }
}

// ── Avatar ────────────────────────────────────────────────────────────────
function Avatar({ user }) {
  const initials = [user.firstName?.[0], user.lastName?.[0]]
    .filter(Boolean)
    .join('')
    .toUpperCase()
  return (
    <div
      style={{
        width: 30,
        height: 30,
        borderRadius: '50%',
        background: 'linear-gradient(135deg,#4F7FFF,#A78BFA)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 11,
        fontWeight: 600,
        color: '#fff',
        flexShrink: 0,
      }}
    >
      {initials}
    </div>
  )
}

// ── Week separator ────────────────────────────────────────────────────────
function WeekSeparator({ label }) {
  return (
    <div
      style={{
        margin: '14px 16px 8px',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
      }}
    >
      <div style={{ flex: 1, height: 0.5, background: '#1E2540' }} />
      <span
        style={{
          fontSize: 9,
          color: '#2E3860',
          fontFamily: 'var(--mono)',
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          whiteSpace: 'nowrap',
        }}
      >
        {label}
      </span>
      <div style={{ flex: 1, height: 0.5, background: '#1E2540' }} />
    </div>
  )
}

const CHURCH_KEY = 'activeChurchId'

// ── Main component ────────────────────────────────────────────────────────
export default function TimelineScreen() {
  const navigate = useNavigate()

  // user is stateful so context-switch re-renders the whole timeline
  const [user, setUser] = useState(() => getCurrentUser())
  const [loadingCtx, setLoadingCtx] = useState(true)

  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const todayRef = useRef(null)
  const hasScrolled = useRef(false)

  // ── Resolve church contexts on mount ─────────────────────────────
  useEffect(() => {
    let mounted = true
    async function resolveContexts() {
      const base = getCurrentUser()
      if (!base) return
      const resolved = await resolveChurchContextsForUser(base)
      if (!mounted) return

      const storedId = sessionStorage.getItem(CHURCH_KEY)
      const selected =
        resolved.churchContexts.find((c) => c.id === storedId) ||
        resolved.activeChurch ||
        null

      const next = withActiveChurch(
        { ...base, churchContexts: resolved.churchContexts },
        selected,
      )
      if (selected?.id) sessionStorage.setItem(CHURCH_KEY, selected.id)
      setUser(next)
      setLoadingCtx(false)
    }
    resolveContexts().catch(() => setLoadingCtx(false))
    return () => { mounted = false }
  }, [])

  // ── Context switch ────────────────────────────────────────────────
  function handleContextSwitch(churchId) {
    const selected = user.churchContexts?.find((c) => c.id === churchId)
    if (!selected) return
    const next = withActiveChurch(user, selected)
    sessionStorage.setItem(CHURCH_KEY, selected.id)
    setUser(next)
    // reset scroll so we re-scroll to today for the new context
    hasScrolled.current = false
  }

  // ── Load logged activity map ─────────────────────────────────────
  const loadTimeline = useCallback(async () => {
    setLoading(true)
    try {
      const rangeStart = format(subWeeks(new Date(), WEEKS_BACK), 'yyyy-MM-dd')
      const rangeEnd = format(
        new Date(Date.now() + WEEKS_AHEAD * 7 * 24 * 60 * 60 * 1000),
        'yyyy-MM-dd',
      )

      const loggedMap = await getLogsForTimeline(
        user.userId,
        rangeStart,
        rangeEnd,
      )
      const timeline = buildTimeline(user, [], loggedMap, WEEKS_AHEAD)
      setEntries(timeline)
    } catch (err) {
      console.error('Failed to load timeline:', err)
      const timeline = buildTimeline(user, [], new Map(), WEEKS_AHEAD)
      setEntries(timeline)
    } finally {
      setLoading(false)
    }
  }, [user.userId, user.level]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    loadTimeline()
  }, [loadTimeline])

  // Auto-scroll to today's section once entries are loaded
  useEffect(() => {
    if (!loading && todayRef.current && !hasScrolled.current) {
      hasScrolled.current = true
      setTimeout(() => {
        todayRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 100)
    }
  }, [loading])

  // ── Tap handler ──────────────────────────────────────────────────
  function handleTap(entry) {
    navigate(`/log/${entry.activityId}?date=${entry.date}`)
  }

  // ── Logout ────────────────────────────────────────────────────────
  function handleLogout() {
    logout()
    sessionStorage.removeItem(CHURCH_KEY)
    navigate('/')
  }

  // ── Derived data ─────────────────────────────────────────────────
  const grouped = groupByWeekAndDay(entries)
  const thisWeek = currentISOWeek()
  const badge = levelBadge(user.level)

  const displayName = user.firstName
    ? `${user.firstName}${user.lastName ? ' ' + user.lastName : ''}`
    : 'Leader'

  const unitParts = [
    user.bacenta?.name || (user.level === 'bacenta' ? user.unitName : null),
    user.governorship?.name ||
      (user.level === 'governorship' ? user.unitName : null),
    user.level === 'overseer' || user.level === 'bishop'
      ? user.unitName || user.council?.name
      : null,
  ].filter(Boolean)

  const unitDisplay =
    unitParts.length > 0 ? unitParts.join(' · ') : user.unitName || ''

  return (
    <div
      style={{
        minHeight: '100dvh',
        background: 'var(--bg)',
        color: 'var(--text)',
        maxWidth: 480,
        margin: '0 auto',
      }}
    >
      {/* ── TopBar ──────────────────────────────────────────────── */}
      <div
        style={{
          padding: '14px 16px 10px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '0.5px solid rgba(255,255,255,.07)',
          position: 'sticky',
          top: 0,
          background: 'rgba(12,15,26,0.96)',
          backdropFilter: 'blur(12px)',
          zIndex: 20,
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <span
              style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)' }}
            >
              {displayName}
            </span>
            <span
              style={{
                fontSize: 9,
                padding: '1px 6px',
                borderRadius: 8,
                background: `${badge.color}22`,
                color: badge.color,
                fontFamily: 'var(--mono)',
                fontWeight: 600,
              }}
            >
              {badge.label}
            </span>
          </div>
          {unitDisplay && (
            <div
              style={{
                fontSize: 10,
                color: 'var(--muted)',
                marginTop: 1,
                fontFamily: 'var(--mono)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {unitDisplay}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* Context switcher — only shown when user leads multiple units */}
          {(user.churchContexts?.length ?? 0) > 1 && (
            <select
              value={user.activeChurch?.id || ''}
              onChange={(e) => handleContextSwitch(e.target.value)}
              disabled={loadingCtx}
              style={{
                fontSize: 10,
                fontFamily: 'var(--mono)',
                background: '#1A2040',
                color: 'var(--muted)',
                border: '1px solid var(--border)',
                borderRadius: 8,
                padding: '3px 6px',
                cursor: 'pointer',
                maxWidth: 130,
                outline: 'none',
              }}
            >
              {user.churchContexts.map((ctx) => (
                <option key={`${ctx.level}:${ctx.id}`} value={ctx.id}>
                  {ctx.name} ({ctx.level === 'overseer' ? 'Council' : ctx.level})
                </option>
              ))}
            </select>
          )}
          <button
            onClick={handleLogout}
            style={{
              fontSize: 10,
              color: 'var(--muted)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontFamily: 'var(--mono)',
              padding: '4px 6px',
            }}
          >
            logout
          </button>
          <Avatar user={user} />
        </div>
      </div>

      {/* ── Content ─────────────────────────────────────────────── */}
      {loading ? (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '60vh',
            color: 'var(--muted)',
            fontSize: 13,
            fontFamily: 'var(--mono)',
          }}
        >
          Loading…
        </div>
      ) : (
        <div style={{ paddingBottom: 40 }}>
          {grouped.map((week, weekIdx) => {
            const prog = weekProgress(entries, week.isoWeek)
            const isCurrentWeek = week.isoWeek === thisWeek
            const days = getDaysOfISOWeek(week.isoWeek)
            const isFirstWeek = weekIdx === 0

            return (
              <div key={week.isoWeek}>
                {/* Week separator between weeks (not before the first) */}
                {!isFirstWeek && !isCurrentWeek && (
                  <WeekSeparator
                    label={weekSeparatorLabel(week.isoWeek, weekIdx + 1)}
                  />
                )}
                {!isFirstWeek && isCurrentWeek && (
                  <WeekSeparator label='Current week' />
                )}

                {/* Week header with progress */}
                <WeekHeader
                  isoWeek={week.isoWeek}
                  label={weekLabel(week.isoWeek)}
                  total={prog.total}
                  done={prog.done}
                />

                {/* Day sections — all 7 days, empty ones show "no activities" */}
                {days.map((dayDate) => {
                  const dayEntries = (week.dayMap.get(dayDate) || []).filter(e => !e.done)
                  const isThisDay = dayDate === TODAY
                  return (
                    <div key={dayDate} ref={isThisDay ? todayRef : undefined}>
                      <DaySection
                        date={dayDate}
                        entries={dayEntries}
                        today={TODAY}
                        onTap={handleTap}
                      />
                    </div>
                  )
                })}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
