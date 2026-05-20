// src/utils/auth.js
// JWT decode + role→level mapping
// Wire real auth by replacing getCurrentUser() body

import { getActivitiesForLevel } from '../data/activities'
import { fetchMemberLeaderships } from './neo4j'

const LEAD_CHURCHES_URL =
  import.meta.env.VITE_LEAD_CHURCHES_API_URL ||
  'https://rgldisl2bxl3l2upaauxodtrhy0uxkot.lambda-url.eu-west-2.on.aws/auth/churches'

export function decodeJWT(token) {
  try {
    return JSON.parse(atob(token.split('.')[1]))
  } catch {
    return null
  }
}

export function getLevelFromRoles(roles = []) {
  const r = roles.map((x) => x.toLowerCase())
  if (r.some((x) => x.includes('adminstream') || x.includes('leaderstream')))
    return 'bishop'
  if (r.some((x) => x.includes('oversight') || x.includes('council')))
    return 'overseer'
  if (r.some((x) => x.includes('governorship'))) return 'governorship'
  if (r.some((x) => x.includes('bacenta'))) return 'bacenta'
  return 'bacenta'
}

export function isAdmin(roles = []) {
  return roles.some((r) => r.startsWith('admin'))
}

function hasActivities(level) {
  return getActivitiesForLevel(level).length > 0
}

function uniqueChurchContexts(contexts) {
  const seen = new Set()
  return contexts.filter((ctx) => {
    const key = `${ctx.level}:${ctx.id}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

function normalizeChurchContexts(member) {
  const toContext = (item, level, source) => {
    if (!item?.id) return null
    return {
      id: item.id,
      name: item.name || `${source} ${item.id.slice(0, 6)}`,
      level,
      source,
    }
  }

  const contexts = [
    ...(member?.leadsCouncil || []).map((x) =>
      toContext(x, 'overseer', 'Council Lead'),
    ),
    ...(member?.isAdminForCouncil || []).map((x) =>
      toContext(x, 'overseer', 'Council Admin'),
    ),
    ...(member?.isArrivalsAdminForCouncil || []).map((x) =>
      toContext(x, 'overseer', 'Council Arrivals Admin'),
    ),
    ...(member?.leadsGovernorship || []).map((x) =>
      toContext(x, 'governorship', 'Governorship Lead'),
    ),
    ...(member?.isAdminForGovernorship || []).map((x) =>
      toContext(x, 'governorship', 'Governorship Admin'),
    ),
    ...(member?.isArrivalsAdminForGovernorship || []).map((x) =>
      toContext(x, 'governorship', 'Governorship Arrivals Admin'),
    ),
    ...(member?.leadsBacenta || []).map((x) =>
      toContext(x, 'bacenta', 'Bacenta Lead'),
    ),
  ].filter(Boolean)

  const fallbackBacentaId = member?.bacenta?.id
  if (fallbackBacentaId) {
    contexts.push({
      id: fallbackBacentaId,
      name: member?.leadsBacenta?.[0]?.name || 'Assigned Bacenta',
      level: 'bacenta',
      source: 'Member Bacenta',
    })
  }

  return uniqueChurchContexts(contexts).filter((ctx) =>
    hasActivities(ctx.level),
  )
}

function localFallbackChurchContexts(payload) {
  return uniqueChurchContexts(
    [
      payload?.council?.id
        ? {
            id: payload.council.id,
            name: payload.council.name || 'Council',
            level: 'overseer',
            source: 'Local Council',
          }
        : null,
      payload?.governorship?.id
        ? {
            id: payload.governorship.id,
            name: payload.governorship.name || 'Governorship',
            level: 'governorship',
            source: 'Local Governorship',
          }
        : null,
      payload?.bacenta?.id
        ? {
            id: payload.bacenta.id,
            name: payload.bacenta.name || 'Bacenta',
            level: 'bacenta',
            source: 'Local Bacenta',
          }
        : null,
    ].filter(Boolean),
  ).filter((ctx) => hasActivities(ctx.level))
}

// ── MOCK — swap this whole block when real auth is ready ──────────────────
export const MOCK_USER = {
  userId: '7573ecf9-b445-40ce-ba24-5c8ed262bf82',
  email: 'dabick14@gmail.com',
  firstName: 'David Dag',
  lastName: 'Vanderpuije',
  roles: ['leaderBacenta', 'leaderOversight', 'adminStream'],
  bacenta: { id: '9e926ea4', name: 'God Chasers' },
  governorship: { id: 'a9eda2d9', name: 'Haatso Mabey' },
  council: { name: 'Colossians 1' },
  stream: { id: '2dd77486', name: 'Colossians' },
}

export function getCurrentUser() {
  const token = localStorage.getItem('accessToken')
  if (token) {
    const payload = decodeJWT(token)
    if (payload) return enrichUser(payload)
  }
  // Demo mode (no real token)
  const demo = localStorage.getItem('demoUser')
  if (demo) {
    try {
      return JSON.parse(demo)
    } catch {
      /* ignore */
    }
  }
  // Fall back to mock during development when nothing is stored
  return enrichUser(MOCK_USER)
}

export function enrichUser(payload) {
  const level = getLevelFromRoles(payload.roles || [])
  // membership fields (bacenta/governorship/council/stream) are no longer in
  // the JWT — they come from Neo4j via resolveChurchContextsForUser().
  // enrichUser() stays synchronous; churchContexts starts empty and is
  // populated by the async resolution step after login.
  const churchContexts = localFallbackChurchContexts(payload)
  const activeChurch = churchContexts[0] || null
  return {
    ...payload,
    level: activeChurch?.level || level,
    unitName: activeChurch?.name || '',
    isAdmin: isAdmin(payload.roles || []),
    churchContexts,
    activeChurch,
  }
}

export async function fetchLeadChurchesByEmail(email, accessToken) {
  if (!email) throw new Error('Email is required to load church contexts')
  if (!accessToken)
    throw new Error('Access token is required to load church contexts')

  const response = await fetch(LEAD_CHURCHES_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ email }),
  })

  const json = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new Error(json?.message || 'Failed to fetch lead churches')
  }

  return json
}

export async function resolveChurchContextsForUser(user) {
  // ── Leadership contexts (leadsCouncil, leadsGovernorship, leadsBacenta)
  //   These are in the JWT payload — read them directly, no network call.
  const leadershipContexts = normalizeChurchContexts(user)

  // ── Membership hierarchy (bacenta → governorship → council → stream)
  //   This is being removed from the JWT; Neo4j is now the source of truth.
  //   Fall back to any membership fields still present in the JWT payload
  //   (covers the transition period and dev mode).
  let member = null
  let membershipContexts = []
  try {
    member = await fetchMemberLeaderships(user.email)
    if (member) {
      membershipContexts = localFallbackChurchContexts(member)
    }
  } catch {
    membershipContexts = localFallbackChurchContexts(user)
  }

  const churchContexts = uniqueChurchContexts([
    ...leadershipContexts,
    ...membershipContexts,
  ]).filter((ctx) => hasActivities(ctx.level))

  return {
    member,
    churchContexts,
    activeChurch: churchContexts[0] || null,
  }
}

export function withActiveChurch(user, church) {
  const nextChurch = church || user?.activeChurch || null
  if (!nextChurch) return user
  return {
    ...user,
    activeChurch: nextChurch,
    level: nextChurch.level,
    unitName: nextChurch.name,
  }
}

// ── Real login call ───────────────────────────────────────────────────────
export async function loginWithCredentials(email, password) {
  const res = await fetch(`${import.meta.env.VITE_AUTH_API_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || data.message || 'Login failed')

  localStorage.setItem('accessToken', data.tokens.accessToken)
  localStorage.setItem('refreshToken', data.tokens.refreshToken)

  // NOTE: setSupabaseAuth() is only needed if RLS is enabled and Supabase's
  // JWT secret matches the FLC auth system's signing secret. Skip for now
  // since RLS is disabled — re-enable once secrets are aligned.
  // const { setSupabaseAuth } = await import('./supabase');
  // await setSupabaseAuth(data.tokens.accessToken);

  const payload = decodeJWT(data.tokens.accessToken)
  const { id, ...userFields } = data.user
  const user = enrichUser({
    ...payload,
    ...userFields,
    userId: payload.userId ?? id,
  })

  // Sync the leader's profile to Supabase (upsert — safe to call every login)
  try {
    const { upsertProfile } = await import('./logs')
    await upsertProfile(user)
  } catch (err) {
    // Non-fatal: profile sync failure should not block login
    console.warn('[auth] upsertProfile failed:', err.message)
  }

  return user
}

export function logout() {
  localStorage.removeItem('accessToken')
  localStorage.removeItem('refreshToken')
  localStorage.removeItem('demoUser')
}
