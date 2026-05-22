// api/neo4j-query.ts
//
// Vercel serverless function — proxies Cypher queries to Neo4j.
// Runs in Node.js; uses the official neo4j-driver (full, not lite).
// Neo4j credentials are server-side only and never exposed to the browser.
//
// Required env vars (set in Vercel dashboard → Settings → Environment Variables):
//   FLC_JWT_SECRET   — HS256 signing secret from the FLC auth Lambda
//   NEO4J_URI        — e.g. neo4j://dev-neo4j.firstlovecenter.com:7687
//   NEO4J_USER       — Neo4j username
//   NEO4J_PASSWORD   — Neo4j password
//
// Optional:
//   NEO4J_DATABASE   — database name (default: neo4j)
//   NEO4J_ENCRYPTED  — set to "true" to use ENCRYPTION_ON + TRUST_ALL_CERTIFICATES
//                      (mirrors the FLC auth Lambda's isEncrypted flag)

import type { VercelRequest, VercelResponse } from '@vercel/node'
import neo4j from 'neo4j-driver'
import { jwtVerify } from 'jose'

const FLC_JWT_SECRET = process.env.FLC_JWT_SECRET!
const ADMIN_API_KEY = process.env.ADMIN_API_KEY // optional — grants read-only admin access
const NEO4J_URI = process.env.NEO4J_URI!
const NEO4J_USER = process.env.NEO4J_USER!
const NEO4J_PASSWORD = process.env.NEO4J_PASSWORD!
const NEO4J_DATABASE = process.env.NEO4J_DATABASE ?? 'neo4j'
const NEO4J_ENCRYPTED = process.env.NEO4J_ENCRYPTED === 'true'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS preflight
  Object.entries(corsHeaders).forEach(([k, v]) => res.setHeader(k, v))
  if (req.method === 'OPTIONS') return res.status(204).end()
  if (req.method !== 'POST')
    return res.status(405).json({ error: 'Method not allowed' })

  // ── 1. Verify caller identity ────────────────────────────────────────
  // Accepts either a valid FLC JWT  OR  the ADMIN_API_KEY (admin dashboard).
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) {
    return res
      .status(401)
      .json({ error: 'Missing or invalid Authorization header' })
  }
  const token = authHeader.slice(7)

  // Fast path: admin API key (no JWT verification needed)
  const isAdminKey = ADMIN_API_KEY && token === ADMIN_API_KEY

  let userId: string
  if (!isAdminKey) {
    try {
      const secret = new TextEncoder().encode(FLC_JWT_SECRET)
      const { payload } = await jwtVerify(token, secret)
      userId = payload.userId as string
      if (!userId) throw new Error('missing userId')
    } catch {
      return res.status(401).json({ error: 'Invalid or expired JWT' })
    }
  } else {
    userId = 'admin'
  }

  // ── 2. Validate body ───────────────────────────────────────────────
  const { query, parameters = {} } = req.body ?? {}
  if (!query || typeof query !== 'string') {
    return res
      .status(400)
      .json({ error: 'Missing or invalid "query" in request body' })
  }

  // ── 3. Connect and run Cypher ──────────────────────────────────────
  // Mirror the FLC auth Lambda's driver config exactly.
  const driverConfig = NEO4J_ENCRYPTED
    ? {
        encrypted: 'ENCRYPTION_ON' as const,
        trust: 'TRUST_ALL_CERTIFICATES' as const,
        connectionTimeout: 10_000,
        maxConnectionPoolSize: 10,
      }
    : {
        connectionTimeout: 10_000,
        maxConnectionPoolSize: 10,
      }

  const driver = neo4j.driver(
    NEO4J_URI,
    neo4j.auth.basic(NEO4J_USER, NEO4J_PASSWORD),
    driverConfig,
  )

  try {
    const { records } = await driver.executeQuery(query, parameters, {
      database: NEO4J_DATABASE,
    })

    // Each record → plain object keyed by RETURN aliases
    // e.g. { member: {...}, membership: {...} }
    const data = records.map((r) => r.toObject())
    return res.status(200).json({ data })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error'
    console.error('[neo4j-query] error:', message, '| userId:', userId)
    return res.status(500).json({ error: message })
  } finally {
    await driver.close()
  }
}
