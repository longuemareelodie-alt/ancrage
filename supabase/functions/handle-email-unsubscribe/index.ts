import { createClient } from 'npm:@supabase/supabase-js@2'
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors'

// Keeps the « Se désabonner » links of already-sent emails working.
// GET ?token=… → { valid, reason? } ; POST { token } → { success }
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  let token = new URL(req.url).searchParams.get('token')
  if (req.method === 'POST') {
    try {
      token = (await req.json())?.token ?? token
    } catch { /* ignore */ }
  }
  if (!token || typeof token !== 'string' || token.length > 200) {
    return json({ valid: false, reason: 'invalid' }, 400)
  }

  const db = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)
  const { data: row } = await db
    .from('email_unsubscribe_tokens')
    .select('id, email, used_at')
    .eq('token', token)
    .maybeSingle()
  if (!row) return json({ valid: false, reason: 'invalid' }, 404)

  if (req.method !== 'POST') {
    return row.used_at ? json({ valid: false, reason: 'already_unsubscribed' }) : json({ valid: true })
  }

  const email = String(row.email).toLowerCase()
  const { data: existing } = await db.from('suppressed_emails').select('id').eq('email', email).maybeSingle()
  if (!existing) {
    const { error } = await db
      .from('suppressed_emails')
      .insert({ email, reason: 'unsubscribe', metadata: { source: 'unsubscribe_link' } })
    if (error) return json({ success: false }, 500)
  }
  await db.from('email_unsubscribe_tokens').update({ used_at: new Date().toISOString() }).eq('id', row.id)
  return json({ success: true })
})
