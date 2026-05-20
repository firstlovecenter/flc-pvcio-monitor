// src/utils/auth.js
// JWT decode + role→level mapping
// Wire real auth by replacing getCurrentUser() body

import { getActivitiesForLevel } from '../data/activities'
import { fetchMemberLeaderships } from './neo4j'

// Maps JWT churchScopes "leads*Of" keys → internal activity levels.
// Only "leads" keys are included — admin/teller/arrivals roles are not
// leadership roles and should not appear in the context switcher.
const LEADS_SCOPE_TO_LEVEL = {
  leadsBacentaOf:      'bacenta',
  leadsGovernorshipOf: 'governorship',
  leadsCouncilOf:      'overseer',
  leadsOversightOf:    'oversight', // no activities built for this level → filtered out
  leadsStreamOf:       'bishop',
}

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

/** Returns true if the token is missing or its `exp` claim is in the past. */
export function isTokenExpired(token) {
  if (!token) return true
  const payload = decodeJWT(token)
  if (!payload?.exp) return true
  // exp is in seconds; subtract a 30s buffer so we refresh before hard expiry
  return Date.now() / 1000 > payload.exp - 30
}

/**
 * Exchange the stored refreshToken for a new accessToken.
 * Stores the new token(s) in localStorage and returns the new accessToken.
 * Throws if the refresh fails — callers should treat that as a logout signal.
 */
export async function refreshAccessToken() {
  const refreshToken = localStorage.getItem('refreshToken')
  if (!refreshToken) throw new Error('No refresh token available')

  const res = await fetch(`${import.meta.env.VITE_AUTH_API_URL}/auth/refresh-token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || 'Token refresh failed')

  const newAccess = data.accessToken
  if (!newAccess) throw new Error('Refresh response missing accessToken')

  localStorage.setItem('accessToken', newAccess)

  return newAccess
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

// Build church contexts from the JWT churchScopes object.
// Only processes "leads*Of" keys — the user must actively lead the church
// for it to appear in the context switcher.
function churchContextsFromScopes(scopes = {}) {
  return Object.entries(LEADS_SCOPE_TO_LEVEL)
    .map(([key, level]) => {
      const item = scopes[key]
      if (!item?.id) return null
      return { id: item.id, name: item.name || level, level, source: key }
    })
    .filter(Boolean)
    .filter((ctx) => hasActivities(ctx.level))
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
  churchScopes: {
    leadsBacentaOf:     { id: '9e926ea4-6cbf-4cc3-b625-4b93e289d662', name: 'God Chasers' },
    leadsOversightOf:   { id: '6289b4e3-1712-431c-b301-adfdfd94bdbd', name: 'Africa West Family' },
    isAdminForStreamOf: { id: '47f2eb18-351f-4027-a9a7-864573375ffb', name: 'Yaounde Sunday Service' },
  },
  // Legacy membership fields — kept for stream-name resolution in timeline filtering.
  // These come from Neo4j in production; hardcoded here for dev mode only.
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
  // Build church contexts from JWT churchScopes (leads*Of keys only).
  // Fall back to localFallbackChurchContexts for old-format tokens that
  // don't yet have the churchScopes field.
  const scopeContexts = churchContextsFromScopes(payload.churchScopes || {})
  const churchContexts = scopeContexts.length
    ? scopeContexts
    : localFallbackChurchContexts(payload)
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
  // Church contexts come directly from churchScopes in the JWT — already built
  // by enrichUser(). No network call is needed for the context switcher.
  //
  // We still call fetchMemberLeaderships to get the membership hierarchy
  // (bacenta → governorship → council → stream) so that timeline stream
  // filtering (user.stream?.name) keeps working.
  let member = null
  try {
    member = await fetchMemberLeaderships(user.email)
  } catch {
    // Non-fatal — timeline stream filtering degrades gracefully without it.
  }

  const churchContexts = user.churchContexts || []
  return {
    member,
    churchContexts,
    activeChurch: user.activeChurch || churchContexts[0] || null,
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
