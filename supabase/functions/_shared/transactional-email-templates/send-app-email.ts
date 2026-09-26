import { createClient } from 'npm:@supabase/supabase-js@2'
import { sendTemplateEmail } from './send-email.ts'
import { TEMPLATES } from './registry.ts'

// Server-only. Sends a registered template through the managed helper and
// keeps the app's send history (email_send_log) the way the old send path did.
export async function sendAppEmail(params: {
  templateName: string
  recipientEmail?: string
  idempotencyKey?: string
  templateData?: Record<string, any>
}): Promise<{ error: Error | null; sent: boolean }> {
  const { templateName, recipientEmail = '', idempotencyKey, templateData } = params
  const recipient = TEMPLATES[templateName]?.to || recipientEmail
  const db = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  )
  const log = async (status: string, error_message?: string) => {
    const { error } = await db.from('email_send_log').insert({
      message_id: null,
      template_name: templateName,
      recipient_email: recipient,
      status,
      error_message: error_message ?? null,
    })
    if (error) console.error('email_send_log write failed', { code: error.code, message: error.message })
  }
  try {
    const r = await sendTemplateEmail(templateName, recipientEmail, { templateData, idempotencyKey })
    if (r.sent) {
      await log('sent')
      return { error: null, sent: true }
    }
    await log('suppressed')
    return { error: null, sent: false }
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    await log('failed', msg)
    return { error: e instanceof Error ? e : new Error(msg), sent: false }
  }
}
