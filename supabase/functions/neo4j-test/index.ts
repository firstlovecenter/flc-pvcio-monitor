// Temporary diagnostic — tests raw TCP + TLS connectivity to Neo4j.
// Delete this function after confirming the connection works.

const NEO4J_HOST = Deno.env.get('NEO4J_HOST') ?? 'dev-neo4j.firstlovecenter.com'
const NEO4J_PORT = parseInt(Deno.env.get('NEO4J_PORT') ?? '7687', 10)

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS')
    return new Response(null, { headers: corsHeaders })

  const results: Record<string, string> = {}

  // ── Test 1: raw TCP ────────────────────────────────────────────────
  try {
    const conn = await Deno.connect({ hostname: NEO4J_HOST, port: NEO4J_PORT })
    conn.close()
    results.tcp = `✅ TCP connected to ${NEO4J_HOST}:${NEO4J_PORT}`
  } catch (e) {
    results.tcp = `❌ TCP failed: ${(e as Error).message}`
  }

  // ── Test 2: TLS ────────────────────────────────────────────────────
  try {
    const conn = await Deno.connectTls({
      hostname: NEO4J_HOST,
      port: NEO4J_PORT,
    })
    conn.close()
    results.tls = `✅ TLS connected to ${NEO4J_HOST}:${NEO4J_PORT}`
  } catch (e) {
    results.tls = `❌ TLS failed: ${(e as Error).message}`
  }

  // ── Test 3: DNS ────────────────────────────────────────────────────
  try {
    const addrs = await Deno.resolveDns(NEO4J_HOST, 'A')
    results.dns = `✅ DNS resolved: ${addrs.join(', ')}`
  } catch (e) {
    results.dns = `❌ DNS failed: ${(e as Error).message}`
  }

  return new Response(JSON.stringify(results, null, 2), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
})
