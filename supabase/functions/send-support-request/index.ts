import { sendAppEmail } from '../_shared/transactional-email-templates/send-app-email.ts'
import { cors, json, getCaller, str } from '../_shared/transactional-email-templates/caller.ts'

// Fixed recipient (support inbox, defined in the template).
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: cors })
  const user = await getCaller(req)
  if (!user) return json({ error: 'Unauthorized' }, 401)
  const b = await req.json().catch(() => ({}))
  const message = str(b.message, 5000)?.trim()
  const fromEmail = str(b.fromEmail, 254)?.trim()
  if (!message || !fromEmail || !/^\S+@\S+\.\S+$/.test(fromEmail)) {
    return json({ error: 'invalid_input' }, 400)
  }
  const r = await sendAppEmail({
    templateName: 'support-request',
    idempotencyKey: `support-${user.id}-${crypto.randomUUID()}`,
    templateData: {
      fromName: str(b.fromName, 120),
      fromEmail,
      message,
      ticketId: str(b.ticketId, 80),
      context: str(b.context, 500),
      diagnostics: typeof b.diagnostics === 'object' ? b.diagnostics : str(b.diagnostics, 4000),
      url: str(b.url, 500),
      userAgent: str(b.userAgent, 500),
    },
  })
  if (r.error) return json({ error: 'send_failed' }, 500)
  return json({ success: true })
})
