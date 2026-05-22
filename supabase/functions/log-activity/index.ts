// supabase/functions/log-activity/index.ts
//
// Security middleware for inserting activity_log rows.
// Flow:
//   React app  →  POST /functions/v1/log-activity  (FLC JWT in Authorization header)
//              →  verify JWT with FLC_JWT_SECRET (HS256)
//              →  extract + enforce submitted_by_id from JWT payload
//              →  insert row via service role key (bypasses RLS)
//              →  return inserted row
//
// Required Supabase secrets (set with `npx supabase secrets set`):
//   FLC_JWT_SECRET           — HS256 signing secret from the FLC auth Lambda
//   SUPABASE_SERVICE_ROLE_KEY — from Supabase dashboard → Settings → API
//   SUPABASE_URL is auto-injected by the Supabase runtime

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import * as jose from 'https://deno.land/x/jose@v4.14.4/index.ts'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SERVICE_ROLE_KEY = Deno.env.get('SERVICE_ROLE_KEY')!
const FLC_JWT_SECRET = Deno.env.get('FLC_JWT_SECRET')!

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

Deno.serve(async (req: Request) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return jsonError('Method not allowed', 405)
  }

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

    const userId = jwtPayload.userId
    if (!userId) {
      return jsonError('JWT missing userId claim', 401)
    }

    // ── 2. Parse + validate body ─────────────────────────────────────
    let body: { row?: Record<string, unknown> }
    try {
      body = await req.json()
    } catch {
      return jsonError('Invalid JSON body', 400)
    }

    const { row } = body
    if (!row || typeof row !== 'object') {
      return jsonError('Missing or invalid "row" in request body', 400)
    }

    // ── 3. Enforce submitted_by_id from the verified token ───────────
    // Do not trust the client-supplied value — overwrite with the JWT userId.
    row.submitted_by_id = userId

    // ── 4. Duplicate guard ───────────────────────────────────────────
    // If a log already exists for the same user + activity + date, return
    // the existing row instead of inserting a duplicate.
    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
      auth: { persistSession: false },
    })

    if (row.activity_id && row.activity_date) {
      const { data: existing } = await supabase
        .from('activity_logs')
        .select()
        .eq('submitted_by_id', userId)
        .eq('activity_id', row.activity_id as string)
        .eq('activity_date', row.activity_date as string)
        .eq('type', 'activity')
        .maybeSingle()

      if (existing) {
        return new Response(JSON.stringify(existing), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }
    }

    // ── 5. Insert via service role (bypasses RLS) ────────────────────
    const { data, error } = await supabase
      .from('activity_logs')
      .insert(row)
      .select()
      .single()

    if (error) {
      console.error('[log-activity] DB error:', error.message)
      return jsonError(error.message, 500)
    }

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error('[log-activity] Unexpected error:', err)
    return jsonError('Internal server error', 500)
  }
})

function jsonError(message: string, status: number): Response {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}
