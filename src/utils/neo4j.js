// src/utils/neo4j.js
//
// Client-side interface to the `neo4j-query` Supabase Edge Function.
// Neo4j credentials are never exposed to the browser — all queries are
// proxied through the Edge Function which verifies the FLC JWT first.
//
// Usage:
//   import { runNeo4jQuery, fetchMemberLeaderships } from './neo4j'
//
// To add a new query, create a named export below that calls runNeo4jQuery().

// Served by the Vercel serverless function at api/neo4j-query.ts.
// Uses a relative path so it works on any deployment domain automatically.
const NEO4J_FN_URL = '/api/neo4j-query'

// ── Core runner ──────────────────────────────────────────────────────────────

/**
 * Run a single Cypher query via the neo4j-query Edge Function.
 *
 * @param {string} query      - Cypher query string
 * @param {object} parameters - Named parameters for the query
 * @returns {Promise<Array>}  - The `data` array from the first result set.
 *                             Each element has shape: { row: [...], meta: [...] }
 * @throws {Error} on auth failure, network error, or Neo4j error
 */
export async function runNeo4jQuery(query, parameters = {}) {
  const token = localStorage.getItem('accessToken')
  if (!token)
    throw new Error('Not authenticated — no accessToken in localStorage')

  const res = await fetch(NEO4J_FN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ query, parameters }),
  })

  const json = await res.json().catch(() => ({}))
  if (!res.ok)
    throw new Error(json?.error || `neo4j-query failed (${res.status})`)

  return json.data ?? []
}

/**
 * Admin variant — authenticates with VITE_ADMIN_API_KEY instead of a user JWT.
 * Used by the compliance dashboard which has no FLC token.
 */
export async function adminRunNeo4jQuery(query, parameters = {}) {
  const key = import.meta.env.VITE_ADMIN_API_KEY
  if (!key) throw new Error('VITE_ADMIN_API_KEY is not set')

  const res = await fetch(NEO4J_FN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({ query, parameters }),
  })

  const json = await res.json().catch(() => ({}))
  if (!res.ok)
    throw new Error(json?.error || `neo4j-query (admin) failed (${res.status})`)

  return json.data ?? []
}

// ── Membership / leadership queries ─────────────────────────────────────────

// Sourced from the FLC auth service (MEMBER_MEMBERSHIP_CALL constant).
// Walks the BELONGS_TO → Bacenta → Governorship → Council → Stream chain.
const MEMBER_MEMBERSHIP_CALL = `CALL {
  WITH m
  OPTIONAL MATCH (m)-[:BELONGS_TO]->(b:Bacenta)
  OPTIONAL MATCH (g:Governorship)-[:HAS]->(b)
  OPTIONAL MATCH (c:Council)-[:HAS]->(g)
  OPTIONAL MATCH (s:Stream)-[:HAS]->(c)
  RETURN {
    bacenta:      CASE WHEN b IS NOT NULL THEN {id: b.id, name: coalesce(b.name, b.stream_name)} ELSE null END,
    governorship: CASE WHEN g IS NOT NULL THEN {id: g.id, name: g.name} ELSE null END,
    council:      CASE WHEN c IS NOT NULL THEN {id: c.id, name: c.name} ELSE null END,
    stream:       CASE WHEN s IS NOT NULL THEN {id: s.id, name: s.name} ELSE null END
  } AS membership
}`

// Full query — lookup by email OR id (mirrors the auth service).
// Intentionally excludes m.password — never needed on the frontend.
const FETCH_MEMBER_QUERY = `
  MATCH (m:User:Member)
  WHERE ($email IS NOT NULL AND m.email = $email)
     OR ($id IS NOT NULL AND m.id = $id)
  WITH m LIMIT 1
  ${MEMBER_MEMBERSHIP_CALL}
  RETURN
    m { .id, .firstName, .lastName, .email } AS member,
    membership
`

/**
 * Fetch a member's church-hierarchy context by email or Neo4j node id.
 *
 * Returns a single object merging the member fields with their membership
 * hierarchy (bacenta, governorship, council, stream), compatible with
 * enrichUser() and localFallbackChurchContexts() in auth.js.
 *
 * @param {string|null} email
 * @param {string|null} id    - Neo4j node id (optional alternative lookup)
 * @returns {Promise<object|null>} merged member+membership object, or null
 */
export async function fetchMemberLeaderships(email, id = null) {
  const rows = await runNeo4jQuery(FETCH_MEMBER_QUERY, {
    email: email ?? null,
    id: id ?? null,
  })
  if (!rows.length) return null
  // Bolt driver: each row is { member: {...}, membership: {...} }
  const { member, membership } = rows[0]
  // Spread membership (bacenta, governorship, council, stream) directly onto
  // the member object so localFallbackChurchContexts() in auth.js can read
  // payload.bacenta.id, payload.governorship.id, etc. as expected.
  return { ...member, ...membership }
}
