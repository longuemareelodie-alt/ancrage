import { sendAppEmail } from '../_shared/transactional-email-templates/send-app-email.ts'
import { cors, json, getCaller, admin, str } from '../_shared/transactional-email-templates/caller.ts'

// Sends the "welcome after first use" email once per account.
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: cors })
  const user = await getCaller(req)
  if (!user?.email) return json({ error: 'Unauthorized' }, 401)
  const b = await req.json().catch(() => ({}))

  const { data: already, error: qErr } = await admin()
    .from('email_send_log')
    .select('id')
    .eq('template_name', 'welcome-first-use')
    .eq('recipient_email', user.email)
    .eq('status', 'sent')
    .limit(1)
  if (qErr) console.error('email_send_log read failed', { code: qErr.code, message: qErr.message })
  if (already && already.length) return json({ success: true, sent: false, reason: 'already_sent' })

  const r = await sendAppEmail({
    templateName: 'welcome-first-use',
    recipientEmail: user.email,
    idempotencyKey: `welcome-first-use-${user.id}`,
    templateData: { firstName: str(b.firstName, 80) ?? undefined },
  })
  if (r.error) return json({ error: 'send_failed' }, 500)
  return json({ success: true, sent: r.sent })
})
