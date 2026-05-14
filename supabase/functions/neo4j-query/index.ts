// supabase/functions/neo4j-query/index.ts
//
// Proxies Cypher queries to a self-hosted Neo4j instance via the Bolt protocol.
// The client supplies a verified FLC JWT so we know who is making the request.
// Neo4j credentials never leave the server.
//
// Required Supabase secrets (set with `npx supabase secrets set`):
//   FLC_JWT_SECRET  — HS256 signing secret from the FLC auth Lambda
//   NEO4J_URI       — Direct Bolt URI, must use bolt+s:// for encrypted standalone
//                     e.g. bolt+s://dev-neo4j.firstlovecenter.com:7687
//                     (neo4j:// requires routing support — not in the lite driver)
//   NEO4J_USER      — Neo4j username (e.g. neo4j)
//   NEO4J_PASSWORD  — Neo4j password
//
// Optional Supabase secrets:
//   NEO4J_DATABASE  — target database name (default: neo4j)
//
// Request shape:
//   POST /functions/v1/neo4j-query
//   Authorization: Bearer <FLC JWT>
//   Content-Type: application/json
//   { "query": "CYPHER QUERY", "parameters": { ...params } }
//
// Response shape (success):
//   { "data": [ { "member": {...}, "membership": {...} } ] }
//
// Response shape (error):
//   { "error": "message" }

import * as jose from 'https://deno.land/x/jose@v4.14.4/index.ts'
import neo4j from 'https://deno.land/x/neo4j_driver_lite@5.15.0/mod.ts'

const FLC_JWT_SECRET  = Deno.env.get('FLC_JWT_SECRET')!
const NEO4J_URI       = Deno.env.get('NEO4J_URI')!
const NEO4J_USER      = Deno.env.get('NEO4J_USER')!
const NEO4J_PASSWORD  = Deno.env.get('NEO4J_PASSWORD')!
const NEO4J_DATABASE  = Deno.env.get('NEO4J_DATABASE') ?? 'neo4j'

const corsHeaders = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Headers': 'authorization, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

function jsonResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

function jsonError(message: string, status = 400) {
  return jsonResponse({ error: message }, status)
}

Deno.serve(async (req: Request) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return jsonError('Method not allowed', 405)
  }

  // bolt+s:// in the URI handles TLS — no extra driver config needed.
  // The lite driver supports direct bolt connections but not neo4j:// routing.
  const driver = neo4j.driver(
    NEO4J_URI,
    neo4j.auth.basic(NEO4J_USER, NEO4J_PASSWORD),
    { connectionTimeout: 8000 },
  )

  try {
    // ── 1. Verify FLC JWT ────────────────────────────────────────────
    const authHeader = req.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return jsonError('Missing or invalid Authorization header', 401)
    }
    const token = authHeader.slice(7)

    let jwtPayload: jose.JWTPayload & { userId?: string }
    try {
      const secret = new TextEncoder().encode(FLC_JWT_SECRET)
      const { payload } = await jose.jwtVerify(token, secret)
      jwtPayload = payload as typeof jwtPayload
    } catch {
      return jsonError('Invalid or expired JWT', 401)
    }

    if (!jwtPayload.userId) {
      return jsonError('JWT missing userId claim', 401)
    }

    // ── 2. Parse + validate body ─────────────────────────────────────
    let body: { query?: string; parameters?: Record<string, unknown> }
    try {
      body = await req.json()
    } catch {
      return jsonError('Invalid JSON body', 400)
    }

    const { query, parameters = {} } = body
    if (!query || typeof query !== 'string') {
      return jsonError('Missing or invalid "query" in request body', 400)
    }

    // ── 3. Run Cypher via Bolt driver ────────────────────────────────
    // Race against a hard 10s deadline so a network/firewall issue surfaces
    // as a clear error rather than a silent hang.
    const queryPromise = driver.executeQuery(query, parameters, {
      database: NEO4J_DATABASE,
    })
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Neo4j connection timed out after 10s')), 10_000)
    )

    const { records } = await Promise.race([queryPromise, timeoutPromise])

    // Each record is a plain object keyed by the RETURN aliases
    // e.g. { member: {...}, membership: {...} }
    const data = records.map((r) => r.toObject())

    return jsonResponse({ data })

  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error'
    console.error('neo4j-query unhandled error:', message)
    return jsonError(message, 500)
  } finally {
    await driver.close()
  }
})
