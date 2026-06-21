// Envoie les emails de notification aux ambassadrices d'un batch payé
// Appelé par l'admin après "Marquer comme payé"
import { createClient } from 'npm:@supabase/supabase-js@2'
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )

    const userClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } },
    )

    const { data: { user } } = await userClient.auth.getUser()
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Verify admin
    const { data: roleCheck } = await supabase
      .from('user_roles').select('role').eq('user_id', user.id).eq('role', 'admin').maybeSingle()
    if (!roleCheck) {
      return new Response(JSON.stringify({ error: 'Forbidden' }), {
        status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { batchId } = await req.json()
    if (!batchId || typeof batchId !== 'string') {
      return new Response(JSON.stringify({ error: 'batchId required' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { data: recipients, error } = await supabase.rpc('get_batch_recipients_admin', { _batch_id: batchId })
    if (error) throw error

    let sent = 0
    for (const r of (recipients ?? []) as any[]) {
      if (!r.email) continue
      const amountEuros = (r.amount_cents / 100).toFixed(2).replace('.', ',')
      await supabase.functions.invoke('send-transactional-email', {
        body: {
          templateName: 'ambassador-payout-sent',
          recipientEmail: r.email,
          idempotencyKey: `payout-${batchId}-${r.ambassador_user_id}`,
          templateData: {
            firstName: r.first_name,
            amountEuros,
            ibanLast4: r.iban_last4,
            batchId,
          },
        },
      })
      sent++
    }

    return new Response(JSON.stringify({ success: true, sent }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (e) {
    console.error('send-batch-payout-emails error', e)
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
