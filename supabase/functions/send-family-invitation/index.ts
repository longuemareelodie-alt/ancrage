import { sendAppEmail } from '../_shared/transactional-email-templates/send-app-email.ts'
import { cors, json, getCaller, admin, str } from '../_shared/transactional-email-templates/caller.ts'

const ALLOWED = /^https:\/\/((www\.)?digitalmamanlibre\.com|[a-z0-9-]+\.lovable\.app)$/
const siteOrigin = (req: Request) => {
  const o = req.headers.get('origin') ?? ''
  return ALLOWED.test(o) ? o : 'https://www.digitalmamanlibre.com'
}

// Recipient comes from the caller's own invitation row, never from the browser.
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: cors })
  const user = await getCaller(req)
  if (!user) return json({ error: 'Unauthorized' }, 401)
  const b = await req.json().catch(() => ({}))
  const token = str(b.token, 200)
  if (!token) return json({ error: 'invalid_input' }, 400)
  const { data: inv, error } = await admin()
    .from('family_invitations')
    .select('email, personal_note')
    .eq('token', token)
    .eq('inviter_user_id', user.id)
    .maybeSingle()
  if (error || !inv) return json({ error: 'not_found' }, 404)
  const r = await sendAppEmail({
    templateName: 'invitation-proche',
    recipientEmail: String(inv.email).toLowerCase(),
    idempotencyKey: `invitation-proche-${token}`,
    templateData: {
      inviterFirstName: str(b.inviterFirstName, 80),
      roleLabel: str(b.roleLabel, 80),
      personalNote: inv.personal_note ?? '',
      inviteUrl: `${siteOrigin(req)}/invitation?token=${encodeURIComponent(token)}`,
    },
  })
  if (r.error) return json({ error: 'send_failed' }, 500)
  return json({ success: true, sent: r.sent })
})
