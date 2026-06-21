// Génère un fichier SEPA pain.001.001.03 pour les commissions ambassadrices validées
// Déclenché par cron mensuel ou manuellement par admin
import { createClient } from 'npm:@supabase/supabase-js@2'
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors'

// Configuration
const MIN_PAYOUT_CENTS = 2000 // 20 €
const CREDITOR_NAME = 'Eclosia'
const CREDITOR_IBAN = Deno.env.get('ECLOSIA_IBAN') ?? '' // À configurer
const CREDITOR_BIC = Deno.env.get('ECLOSIA_BIC') ?? ''
const ADMIN_EMAIL = 'longuemareelodie9@gmail.com'

interface Referral {
  id: string
  ambassador_user_id: string
  commission_cents: number
}

interface Ambassador {
  user_id: string
  iban: string
  holder_name: string
  email: string
  first_name: string | null
}

const xmlEscape = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;')

const formatAmount = (cents: number) => (cents / 100).toFixed(2)

function buildSepaXml(args: {
  msgId: string
  creationDate: string
  executionDate: string
  totalCents: number
  txCount: number
  payments: Array<{
    endToEndId: string
    amountCents: number
    holderName: string
    iban: string
    remittance: string
  }>
}): string {
  const total = formatAmount(args.totalCents)
  const pmts = args.payments
    .map(
      (p) => `      <CdtTrfTxInf>
        <PmtId><EndToEndId>${xmlEscape(p.endToEndId)}</EndToEndId></PmtId>
        <Amt><InstdAmt Ccy="EUR">${formatAmount(p.amountCents)}</InstdAmt></Amt>
        <Cdtr><Nm>${xmlEscape(p.holderName).slice(0, 70)}</Nm></Cdtr>
        <CdtrAcct><Id><IBAN>${xmlEscape(p.iban)}</IBAN></Id></CdtrAcct>
        <RmtInf><Ustrd>${xmlEscape(p.remittance).slice(0, 140)}</Ustrd></RmtInf>
      </CdtTrfTxInf>`,
    )
    .join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>
<Document xmlns="urn:iso:std:iso:20022:tech:xsd:pain.001.001.03">
  <CstmrCdtTrfInitn>
    <GrpHdr>
      <MsgId>${xmlEscape(args.msgId)}</MsgId>
      <CreDtTm>${args.creationDate}</CreDtTm>
      <NbOfTxs>${args.txCount}</NbOfTxs>
      <CtrlSum>${total}</CtrlSum>
      <InitgPty><Nm>${xmlEscape(CREDITOR_NAME)}</Nm></InitgPty>
    </GrpHdr>
    <PmtInf>
      <PmtInfId>${xmlEscape(args.msgId)}</PmtInfId>
      <PmtMtd>TRF</PmtMtd>
      <NbOfTxs>${args.txCount}</NbOfTxs>
      <CtrlSum>${total}</CtrlSum>
      <PmtTpInf><SvcLvl><Cd>SEPA</Cd></SvcLvl></PmtTpInf>
      <ReqdExctnDt>${args.executionDate}</ReqdExctnDt>
      <Dbtr><Nm>${xmlEscape(CREDITOR_NAME)}</Nm></Dbtr>
      <DbtrAcct><Id><IBAN>${xmlEscape(CREDITOR_IBAN)}</IBAN></Id></DbtrAcct>
      ${CREDITOR_BIC ? `<DbtrAgt><FinInstnId><BIC>${xmlEscape(CREDITOR_BIC)}</BIC></FinInstnId></DbtrAgt>` : '<DbtrAgt><FinInstnId><Othr><Id>NOTPROVIDED</Id></Othr></FinInstnId></DbtrAgt>'}
      <ChrgBr>SLEV</ChrgBr>
${pmts}
    </PmtInf>
  </CstmrCdtTrfInitn>
</Document>`
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )

    if (!CREDITOR_IBAN) {
      return new Response(
        JSON.stringify({ error: 'ECLOSIA_IBAN not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    // 1. Récupère toutes les commissions validated non encore liées à un payout
    const { data: referrals, error: refErr } = await supabase
      .from('ambassador_referrals')
      .select('id, ambassador_user_id, commission_cents')
      .eq('status', 'validated')
      .is('payout_id', null)

    if (refErr) throw refErr
    const refs = (referrals ?? []) as Referral[]

    if (refs.length === 0) {
      return new Response(
        JSON.stringify({ success: true, message: 'No validated referrals to pay', batch_id: null }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    // 2. Agrège par ambassadrice
    const byAmb = new Map<string, { total: number; refIds: string[] }>()
    for (const r of refs) {
      const cur = byAmb.get(r.ambassador_user_id) ?? { total: 0, refIds: [] }
      cur.total += r.commission_cents
      cur.refIds.push(r.id)
      byAmb.set(r.ambassador_user_id, cur)
    }

    // 3. Filtre seuil min + récupère IBAN + email
    const eligibleIds = [...byAmb.keys()]
    const { data: profiles } = await supabase
      .from('ambassador_profiles')
      .select('user_id, iban_encrypted, iban_holder_name')
      .in('user_id', eligibleIds)

    const { data: userProfiles } = await supabase
      .from('profiles')
      .select('user_id, email, first_name')
      .in('user_id', eligibleIds)

    const ambMap = new Map<string, Ambassador>()
    for (const p of profiles ?? []) {
      const up = (userProfiles ?? []).find((u: any) => u.user_id === p.user_id)
      if (p.iban_encrypted && p.iban_holder_name && up?.email) {
        ambMap.set(p.user_id, {
          user_id: p.user_id,
          iban: p.iban_encrypted,
          holder_name: p.iban_holder_name,
          email: up.email,
          first_name: up.first_name ?? null,
        })
      }
    }

    // 4. Construit le batch
    const now = new Date()
    const batchId = `ECL-${now.getUTCFullYear()}${String(now.getUTCMonth() + 1).padStart(2, '0')}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`
    const execDate = new Date(now.getTime() + 2 * 86400000).toISOString().slice(0, 10)
    const creationIso = now.toISOString().slice(0, 19)

    const payments: Array<any> = []
    const payoutInserts: Array<any> = []
    const referralUpdates: Array<{ id: string; payout_id: string }> = []
    let totalCents = 0
    const skipped: Array<{ user_id: string; reason: string; amount: number }> = []

    for (const [userId, info] of byAmb) {
      const amb = ambMap.get(userId)
      if (!amb) {
        skipped.push({ user_id: userId, reason: 'no_iban', amount: info.total })
        continue
      }
      if (info.total < MIN_PAYOUT_CENTS) {
        skipped.push({ user_id: userId, reason: 'below_threshold', amount: info.total })
        continue
      }
      const payoutId = crypto.randomUUID()
      payoutInserts.push({
        id: payoutId,
        ambassador_user_id: userId,
        amount_cents: info.total,
        referral_count: info.refIds.length,
        sepa_batch_id: batchId,
        status: 'pending_upload',
        scheduled_for: execDate,
        sepa_xml_path: null,
        iban_last4: amb.iban.slice(-4),
        holder_name: amb.holder_name,
      })
      for (const rid of info.refIds) referralUpdates.push({ id: rid, payout_id: payoutId })
      payments.push({
        endToEndId: payoutId.replace(/-/g, '').slice(0, 35),
        amountCents: info.total,
        holderName: amb.holder_name,
        iban: amb.iban,
        remittance: `Eclosia commission ${batchId}`,
      })
      totalCents += info.total
    }

    if (payments.length === 0) {
      return new Response(
        JSON.stringify({ success: true, message: 'No eligible ambassadors (threshold or no IBAN)', skipped, batch_id: null }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    // 5. Insère payouts
    const { error: insErr } = await supabase.from('ambassador_payouts').insert(payoutInserts)
    if (insErr) throw insErr

    // Lie les referrals à leur payout
    for (const u of referralUpdates) {
      await supabase
        .from('ambassador_referrals')
        .update({ payout_id: u.payout_id })
        .eq('id', u.id)
    }

    // 6. Génère XML
    const xml = buildSepaXml({
      msgId: batchId,
      creationDate: creationIso,
      executionDate: execDate,
      totalCents,
      txCount: payments.length,
      payments,
    })

    // 7. Upload storage
    const filePath = `${now.getUTCFullYear()}/${batchId}.xml`
    const { error: upErr } = await supabase.storage
      .from('sepa-batches')
      .upload(filePath, new Blob([xml], { type: 'application/xml' }), {
        contentType: 'application/xml',
        upsert: true,
      })
    if (upErr) throw upErr

    // Update path
    await supabase
      .from('ambassador_payouts')
      .update({ sepa_xml_path: filePath })
      .eq('sepa_batch_id', batchId)

    // 8. Signed URL 30 jours
    const { data: signed } = await supabase.storage
      .from('sepa-batches')
      .createSignedUrl(filePath, 60 * 60 * 24 * 30)

    // 9. Email admin
    await supabase.functions.invoke('send-transactional-email', {
      body: {
        templateName: 'sepa-batch-ready',
        recipientEmail: ADMIN_EMAIL,
        idempotencyKey: `sepa-batch-${batchId}`,
        templateData: {
          batchId,
          payoutCount: payments.length,
          totalEuros: formatAmount(totalCents),
          executionDate: execDate,
          downloadUrl: signed?.signedUrl ?? '',
          skippedCount: skipped.length,
        },
      },
    })

    return new Response(
      JSON.stringify({
        success: true,
        batch_id: batchId,
        payout_count: payments.length,
        total_cents: totalCents,
        skipped,
        file_path: filePath,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  } catch (e) {
    console.error('generate-sepa-batch error', e)
    return new Response(
      JSON.stringify({ error: (e as Error).message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  }
})
