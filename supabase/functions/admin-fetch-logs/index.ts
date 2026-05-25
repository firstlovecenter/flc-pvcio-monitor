// supabase/functions/admin-fetch-logs/index.ts
//
// Admin-only edge function for reading activity_logs across multiple leaders.
// Uses the service role key to bypass RLS.
//
// Auth: bearer token must match ADMIN_API_KEY secret (same pattern as neo4j-query).
//
// Request body:
//   { weekStr: string, leaderIds: string[] }
//
// Response:
//   { data: { submitted_by_id, activity_id, submitted_by_name, submitted_at }[] }
//
// Required Supabase secrets:
//   ADMIN_API_KEY            — static secret shared with the Vite client env
//   SERVICE_ROLE_KEY         — from Supabase dashboard → Settings → API
//   SUPABASE_URL is auto-injected by the Supabase runtime

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SERVICE_ROLE_KEY = Deno.env.get('SERVICE_ROLE_KEY')!
const ADMIN_API_KEY = Deno.env.get('ADMIN_API_KEY')

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

function jsonError(message: string, status = 400) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return jsonError('Method not allowed', 405)
  }

  // ── 1. Verify admin API key ──────────────────────────────────────
  const authHeader = req.headers.get('Authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return jsonError('Missing or invalid Authorization header', 401)
  }
  const token = authHeader.slice(7)

  if (!ADMIN_API_KEY || token !== ADMIN_API_KEY) {
    return jsonError('Forbidden', 403)
  }

  // ── 2. Parse body ────────────────────────────────────────────────
  let body: { weekStr?: string; leaderIds?: string[] }
  try {
    body = await req.json()
  } catch {
    return jsonError('Invalid JSON body', 400)
  }

  const { weekStr, leaderIds } = body
  if (!weekStr || typeof weekStr !== 'string') {
    return jsonError('Missing or invalid "weekStr"', 400)
  }
  if (!Array.isArray(leaderIds) || leaderIds.length === 0) {
    return jsonError('Missing or empty "leaderIds" array', 400)
  }

  // ── 3. Query with service role key (bypasses RLS) ────────────────
  const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)

  const { data, error } = await admin
    .from('activity_logs')
    .select('submitted_by_id, activity_id, submitted_by_name, submitted_at')
    .eq('iso_week', weekStr)
    .in('submitted_by_id', leaderIds)
    .eq('type', 'activity')

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  return new Response(JSON.stringify({ data: data ?? [] }), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
})
