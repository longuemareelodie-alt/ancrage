// Webhook failure alerter.
// Called fire-and-forget at the end of the Mollie webhook handler.
// Counts recent error/failed entries in premium_activation_log.
// If threshold reached, sends an alert via email (always) and Slack (if configured),
// with a per-window debounce to avoid spam.

import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// === Tunables ===
const FAILURE_THRESHOLD = 3;             // X
const WINDOW_MINUTES = 15;               // Y minutes
const COOLDOWN_MINUTES = 30;             // anti-spam: 1 alert max per cooldown window
const ALERT_KEY = "mollie_webhook_failures";
const ALERT_EMAIL_TO = "contact@digitalmamanlibre.com";
const ALERT_FROM_DOMAIN = "notify.digitalmamanlibre.com";
const ALERT_FROM_NAME = "Eclosia Alerts";

// Slack: optional. Set SLACK_WEBHOOK_URL secret to enable.
const SLACK_WEBHOOK_URL = Deno.env.get("SLACK_WEBHOOK_URL") ?? null;

interface FailureRow {
  id: string;
  status: string;
  payment_id: string | null;
  message: string | null;
  created_at: string;
  user_id: string | null;
  user_email?: string | null;
  raw?: unknown;
}

interface AlertContext {
  firstErrorAt: string | null;
  lastErrorAt: string | null;
  lastPayload: unknown;
  lastPayloadAt: string | null;
  lastPaymentId: string | null;
  lastUserId: string | null;
  lastUserEmail: string | null;
}

function buildContext(failures: FailureRow[]): AlertContext {
  if (failures.length === 0) {
    return {
      firstErrorAt: null, lastErrorAt: null, lastPayload: null, lastPayloadAt: null,
      lastPaymentId: null, lastUserId: null, lastUserEmail: null,
    };
  }
  // failures arrive ordered desc by created_at
  const last = failures[0];
  const first = failures[failures.length - 1];
  const withPayload = failures.find((f) => f.raw != null);
  return {
    firstErrorAt: first.created_at,
    lastErrorAt: last.created_at,
    lastPayload: withPayload?.raw ?? null,
    lastPayloadAt: withPayload?.created_at ?? null,
    lastPaymentId: last.payment_id,
    lastUserId: last.user_id,
    lastUserEmail: last.user_email ?? null,
  };
}

function truncate(s: string, n: number) {
  return s.length > n ? s.slice(0, n) + "…(truncated)" : s;
}

async function sendSlackAlert(text: string, failures: FailureRow[], ctx: AlertContext) {
  if (!SLACK_WEBHOOK_URL) return { skipped: true };

  const fields = [
    `*Last payment_id:* \`${ctx.lastPaymentId ?? "—"}\``,
    `*Last user:* ${ctx.lastUserEmail ? `\`${ctx.lastUserEmail}\`` : "—"}${ctx.lastUserId ? ` (\`${ctx.lastUserId}\`)` : ""}`,
    `*First error:* ${ctx.firstErrorAt ?? "—"}`,
    `*Last error:* ${ctx.lastErrorAt ?? "—"}`,
  ].join("\n");

  const payloadText = ctx.lastPayload
    ? truncate(JSON.stringify(ctx.lastPayload, null, 2), 2500)
    : "— aucun payload Mollie capturé —";

  const blocks: Array<Record<string, unknown>> = [
    { type: "section", text: { type: "mrkdwn", text } },
    { type: "section", text: { type: "mrkdwn", text: fields } },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text:
          "*Recent failures:*\n" +
          failures
            .slice(0, 10)
            .map(
              (f) =>
                `• \`${f.status}\` · ${new Date(f.created_at).toISOString()} · ${
                  f.payment_id ?? "no payment_id"
                } · ${f.user_email ?? f.user_id ?? "no user"} · ${f.message ?? ""}`,
            )
            .join("\n"),
      },
    },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `*Dernier payload Mollie reçu* (${ctx.lastPayloadAt ?? "n/a"}):\n\`\`\`${payloadText}\`\`\``,
      },
    },
  ];
  try {
    const res = await fetch(SLACK_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, blocks }),
    });
    return { ok: res.ok, status: res.status };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

function escapeHtml(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

async function sendEmailAlert(
  supabase: ReturnType<typeof createClient>,
  text: string,
  failures: FailureRow[],
  ctx: AlertContext,
) {
  const rowsHtml = failures
    .slice(0, 10)
    .map(
      (f) => `
      <tr>
        <td style="padding:6px 10px;border-bottom:1px solid #eee;font-family:monospace;font-size:12px;">${f.status}</td>
        <td style="padding:6px 10px;border-bottom:1px solid #eee;font-size:12px;">${new Date(f.created_at).toISOString()}</td>
        <td style="padding:6px 10px;border-bottom:1px solid #eee;font-family:monospace;font-size:12px;">${f.payment_id ?? "—"}</td>
        <td style="padding:6px 10px;border-bottom:1px solid #eee;font-size:12px;">${escapeHtml(f.user_email ?? f.user_id ?? "—")}</td>
        <td style="padding:6px 10px;border-bottom:1px solid #eee;font-size:12px;">${escapeHtml(f.message ?? "")}</td>
      </tr>`,
    )
    .join("");

  const payloadJson = ctx.lastPayload
    ? truncate(JSON.stringify(ctx.lastPayload, null, 2), 5000)
    : "— aucun payload Mollie capturé —";

  const summaryHtml = `
    <table style="border-collapse:collapse;width:100%;margin-top:16px;font-size:13px;background:#fafafa;border:1px solid #eee;">
      <tr><td style="padding:6px 10px;color:#666;width:170px;">Last payment_id</td>
          <td style="padding:6px 10px;font-family:monospace;">${escapeHtml(ctx.lastPaymentId ?? "—")}</td></tr>
      <tr><td style="padding:6px 10px;color:#666;">Last user email</td>
          <td style="padding:6px 10px;font-family:monospace;">${escapeHtml(ctx.lastUserEmail ?? "—")}</td></tr>
      <tr><td style="padding:6px 10px;color:#666;">Last user_id</td>
          <td style="padding:6px 10px;font-family:monospace;">${escapeHtml(ctx.lastUserId ?? "—")}</td></tr>
      <tr><td style="padding:6px 10px;color:#666;">First error (UTC)</td>
          <td style="padding:6px 10px;font-family:monospace;">${escapeHtml(ctx.firstErrorAt ?? "—")}</td></tr>
      <tr><td style="padding:6px 10px;color:#666;">Last error (UTC)</td>
          <td style="padding:6px 10px;font-family:monospace;">${escapeHtml(ctx.lastErrorAt ?? "—")}</td></tr>
      <tr><td style="padding:6px 10px;color:#666;">Last payload at</td>
          <td style="padding:6px 10px;font-family:monospace;">${escapeHtml(ctx.lastPayloadAt ?? "—")}</td></tr>
    </table>`;

  const html = `
    <div style="font-family:system-ui,-apple-system,sans-serif;max-width:720px;margin:auto;padding:20px;">
      <h2 style="color:#b91c1c;">⚠️ Mollie webhook : seuil d'erreurs atteint</h2>
      <p>${text}</p>
      <p style="color:#666;font-size:13px;">Seuil : ${FAILURE_THRESHOLD} erreurs sur ${WINDOW_MINUTES} minutes.<br/>
      Anti-spam : pas de nouvelle alerte avant ${COOLDOWN_MINUTES} minutes.</p>

      <h3 style="margin-top:20px;font-size:14px;color:#333;">Contexte clé</h3>
      ${summaryHtml}

      <h3 style="margin-top:20px;font-size:14px;color:#333;">Erreurs récentes</h3>
      <table style="border-collapse:collapse;width:100%;margin-top:8px;font-size:13px;">
        <thead>
          <tr style="background:#f3f4f6;text-align:left;">
            <th style="padding:8px 10px;">Status</th>
            <th style="padding:8px 10px;">Date (UTC)</th>
            <th style="padding:8px 10px;">Payment ID</th>
            <th style="padding:8px 10px;">User</th>
            <th style="padding:8px 10px;">Message</th>
          </tr>
        </thead>
        <tbody>${rowsHtml}</tbody>
      </table>

      <h3 style="margin-top:20px;font-size:14px;color:#333;">Dernier payload Mollie reçu ${
        ctx.lastPayloadAt ? `(${escapeHtml(ctx.lastPayloadAt)})` : ""
      }</h3>
      <pre style="background:#0f172a;color:#e2e8f0;padding:12px;border-radius:6px;font-size:11px;overflow:auto;max-height:360px;">${escapeHtml(payloadJson)}</pre>

      <p style="margin-top:24px;font-size:12px;color:#888;">
        Voir le journal complet : <a href="https://www.digitalmamanlibre.com/admin/premium-log">/admin/premium-log</a>
      </p>
    </div>
  `;

  const messageId = `webhook-alert-${Date.now()}-${crypto.randomUUID()}`;
  const payload = {
    to: ALERT_EMAIL_TO,
    from: `${ALERT_FROM_NAME} <alerts@${ALERT_FROM_DOMAIN}>`,
    sender_domain: ALERT_FROM_DOMAIN,
    subject: `[Eclosia] ⚠️ Webhook Mollie : ${failures.length} erreurs en ${WINDOW_MINUTES} min`,
    html,
    text,
    label: "webhook_alert",
    purpose: "transactional",
    message_id: messageId,
    queued_at: new Date().toISOString(),
  };

  const { error } = await supabase.rpc("enqueue_email", {
    queue_name: "email_transactional",
    payload,
  });
  return { ok: !error, error: error?.message };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  // Authorization: must be called with the service-role key (internal trigger).
  const authHeader = req.headers.get("authorization") ?? "";
  const expected = `Bearer ${serviceKey}`;
  if (authHeader !== expected) {
    return new Response(JSON.stringify({ error: "unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  try {
    // 1. Count recent failures (incl. user_id and raw payload for context)
    const since = new Date(Date.now() - WINDOW_MINUTES * 60 * 1000).toISOString();
    const { data: failuresRaw, error: fErr } = await supabase
      .from("premium_activation_log")
      .select("id, status, payment_id, message, created_at, user_id, raw")
      .in("status", ["error", "failed"])
      .gte("created_at", since)
      .order("created_at", { ascending: false })
      .limit(50);

    if (fErr) throw new Error(`query failed: ${fErr.message}`);

    const count = failuresRaw?.length ?? 0;
    if (count < FAILURE_THRESHOLD) {
      return new Response(
        JSON.stringify({ ok: true, alerted: false, count, threshold: FAILURE_THRESHOLD }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // 2. Check cooldown
    const { data: state } = await supabase
      .from("webhook_alert_state")
      .select("last_alert_at")
      .eq("id", ALERT_KEY)
      .maybeSingle();

    if (state?.last_alert_at) {
      const elapsedMs = Date.now() - new Date(state.last_alert_at).getTime();
      if (elapsedMs < COOLDOWN_MINUTES * 60 * 1000) {
        return new Response(
          JSON.stringify({
            ok: true,
            alerted: false,
            reason: "cooldown",
            count,
            cooldown_remaining_s: Math.ceil(
              (COOLDOWN_MINUTES * 60 * 1000 - elapsedMs) / 1000,
            ),
          }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
    }

    // 2b. Resolve user emails for the failures that have a user_id
    const userIds = Array.from(
      new Set((failuresRaw ?? []).map((f: any) => f.user_id).filter(Boolean)),
    ) as string[];
    const emailByUser = new Map<string, string>();
    if (userIds.length > 0) {
      const { data: profs } = await supabase
        .from("profiles")
        .select("user_id, email")
        .in("user_id", userIds);
      for (const p of profs ?? []) {
        if (p?.user_id && p?.email) emailByUser.set(p.user_id as string, p.email as string);
      }
    }

    const failures: FailureRow[] = (failuresRaw ?? []).map((f: any) => ({
      id: f.id,
      status: f.status,
      payment_id: f.payment_id,
      message: f.message,
      created_at: f.created_at,
      user_id: f.user_id,
      user_email: f.user_id ? emailByUser.get(f.user_id) ?? null : null,
      raw: f.raw,
    }));
    const ctx = buildContext(failures);

    // 3. Send alerts
    const text = `Le webhook Mollie a enregistré ${count} échec(s) (status error/failed) lors des ${WINDOW_MINUTES} dernières minutes.`;
    const [emailRes, slackRes] = await Promise.all([
      sendEmailAlert(supabase, text, failures, ctx),
      sendSlackAlert(text, failures, ctx),
    ]);

    // 4. Update cooldown state
    await supabase
      .from("webhook_alert_state")
      .upsert({
        id: ALERT_KEY,
        last_alert_at: new Date().toISOString(),
        last_failure_count: count,
        updated_at: new Date().toISOString(),
      });

    return new Response(
      JSON.stringify({
        ok: true,
        alerted: true,
        count,
        threshold: FAILURE_THRESHOLD,
        window_minutes: WINDOW_MINUTES,
        email: emailRes,
        slack: slackRes,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error("[notify-webhook-failure] error", e);
    return new Response(
      JSON.stringify({ ok: false, error: e instanceof Error ? e.message : String(e) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
