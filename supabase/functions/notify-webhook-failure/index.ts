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
const ALERT_FROM_NAME = "Ancrage Alerts";

// Slack: optional. Set SLACK_WEBHOOK_URL secret to enable.
const SLACK_WEBHOOK_URL = Deno.env.get("SLACK_WEBHOOK_URL") ?? null;

interface FailureRow {
  id: string;
  status: string;
  payment_id: string | null;
  message: string | null;
  created_at: string;
}

async function sendSlackAlert(text: string, failures: FailureRow[]) {
  if (!SLACK_WEBHOOK_URL) return { skipped: true };
  const blocks = [
    { type: "section", text: { type: "mrkdwn", text } },
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
                } · ${f.message ?? ""}`,
            )
            .join("\n"),
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

async function sendEmailAlert(
  supabase: ReturnType<typeof createClient>,
  text: string,
  failures: FailureRow[],
) {
  const rowsHtml = failures
    .slice(0, 10)
    .map(
      (f) => `
      <tr>
        <td style="padding:6px 10px;border-bottom:1px solid #eee;font-family:monospace;font-size:12px;">${f.status}</td>
        <td style="padding:6px 10px;border-bottom:1px solid #eee;font-size:12px;">${new Date(f.created_at).toISOString()}</td>
        <td style="padding:6px 10px;border-bottom:1px solid #eee;font-family:monospace;font-size:12px;">${f.payment_id ?? "—"}</td>
        <td style="padding:6px 10px;border-bottom:1px solid #eee;font-size:12px;">${(f.message ?? "").replace(/</g, "&lt;")}</td>
      </tr>`,
    )
    .join("");

  const html = `
    <div style="font-family:system-ui,-apple-system,sans-serif;max-width:640px;margin:auto;padding:20px;">
      <h2 style="color:#b91c1c;">⚠️ Mollie webhook : seuil d'erreurs atteint</h2>
      <p>${text}</p>
      <p style="color:#666;font-size:13px;">Seuil : ${FAILURE_THRESHOLD} erreurs sur ${WINDOW_MINUTES} minutes.<br/>
      Anti-spam : pas de nouvelle alerte avant ${COOLDOWN_MINUTES} minutes.</p>
      <table style="border-collapse:collapse;width:100%;margin-top:16px;font-size:13px;">
        <thead>
          <tr style="background:#f3f4f6;text-align:left;">
            <th style="padding:8px 10px;">Status</th>
            <th style="padding:8px 10px;">Date (UTC)</th>
            <th style="padding:8px 10px;">Payment ID</th>
            <th style="padding:8px 10px;">Message</th>
          </tr>
        </thead>
        <tbody>${rowsHtml}</tbody>
      </table>
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
    subject: `[Ancrage] ⚠️ Webhook Mollie : ${failures.length} erreurs en ${WINDOW_MINUTES} min`,
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
    // 1. Count recent failures
    const since = new Date(Date.now() - WINDOW_MINUTES * 60 * 1000).toISOString();
    const { data: failures, error: fErr } = await supabase
      .from("premium_activation_log")
      .select("id, status, payment_id, message, created_at")
      .in("status", ["error", "failed"])
      .gte("created_at", since)
      .order("created_at", { ascending: false })
      .limit(50);

    if (fErr) throw new Error(`query failed: ${fErr.message}`);

    const count = failures?.length ?? 0;
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

    // 3. Send alerts
    const text = `Le webhook Mollie a enregistré ${count} échec(s) (status error/failed) lors des ${WINDOW_MINUTES} dernières minutes.`;
    const [emailRes, slackRes] = await Promise.all([
      sendEmailAlert(supabase, text, failures as FailureRow[]),
      sendSlackAlert(text, failures as FailureRow[]),
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
