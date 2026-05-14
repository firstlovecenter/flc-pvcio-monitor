// supabase/functions/upsert-profile/index.ts
//
// Security middleware for upserting leader profile rows.
// Flow:
//   React app  →  POST /functions/v1/upsert-profile  (FLC JWT in Authorization header)
//              →  verify JWT with FLC_JWT_SECRET (HS256)
//              →  enforce profile.id = userId from JWT payload
//              →  upsert row via service role key (bypasses RLS)
//              →  return { success: true }
//
// Required Supabase secrets (set with `npx supabase secrets set`):
//   FLC_JWT_SECRET           — HS256 signing secret from the FLC auth Lambda
//   SUPABASE_SERVICE_ROLE_KEY — from Supabase dashboard → Settings → API
//   SUPABASE_URL is auto-injected by the Supabase runtime

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import * as jose from 'https://deno.land/x/jose@v4.14.4/index.ts'

const SUPABASE_URL     = Deno.env.get('SUPABASE_URL')!
const SERVICE_ROLE_KEY = Deno.env.get('SERVICE_ROLE_KEY')!
const FLC_JWT_SECRET   = Deno.env.get('FLC_JWT_SECRET')!

const corsHeaders = {
  'Access-Control-Allow-Origin':  '*',
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

    // ── 2. Parse body ────────────────────────────────────────────────
    let body: { profile?: Record<string, unknown> }
    try {
      body = await req.json()
    } catch {
      return jsonError('Invalid JSON body', 400)
    }

    const { profile } = body
    if (!profile || typeof profile !== 'object') {
      return jsonError('Missing or invalid "profile" in request body', 400)
    }

    // ── 3. Enforce profile.id from the verified token ────────────────
    profile.id = userId

    // ── 4. Upsert via service role (bypasses RLS) ────────────────────
    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
      auth: { persistSession: false },
    })

    const { error } = await supabase
      .from('profiles')
      .upsert(profile, { onConflict: 'id' })

    if (error) {
      console.error('[upsert-profile] DB error:', error.message)
      return jsonError(error.message, 500)
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (err) {
    console.error('[upsert-profile] Unexpected error:', err)
    return jsonError('Internal server error', 500)
  }
})

function jsonError(message: string, status: number): Response {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}
