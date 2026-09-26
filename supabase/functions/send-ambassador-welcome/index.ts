import { sendAppEmail } from '../_shared/transactional-email-templates/send-app-email.ts'
import { cors, json, getCaller, str } from '../_shared/transactional-email-templates/caller.ts'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: cors })
  const user = await getCaller(req)
  if (!user?.email) return json({ error: 'Unauthorized' }, 401)
  const b = await req.json().catch(() => ({}))
  const contractVersion = str(b.contractVersion, 40) ?? ''
  const r = await sendAppEmail({
    templateName: 'ambassador-welcome',
    recipientEmail: user.email,
    idempotencyKey: `ambassador-welcome-${user.id}-${contractVersion}`,
    templateData: {
      firstName: str(b.firstName, 80),
      referralCode: str(b.referralCode, 40),
      contractVersion,
      acceptedAt: str(b.acceptedAt, 80),
    },
  })
  if (r.error) return json({ error: 'send_failed' }, 500)
  return json({ success: true, sent: r.sent })
})
