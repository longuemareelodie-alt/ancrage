// retry-account-emails
//
// Scheduled worker (pg_cron, every 5 minutes) that drains
// `pending_account_emails`. For each due row it:
//   1. Regenerates a fresh recovery action_link (Magic links expire fast,
//      so we never reuse the link the webhook would have queued.)
//   2. Invokes `send-transactional-email` with the welcome-initiation template.
//   3. On success → status='sent', sent_at=now().
//   4. On failure → attempts++, exponential backoff for next_attempt_at,
//      and after `max_attempts` reached → status='failed' (support can take over).
//
// Auth: the cron job authenticates with the project SERVICE ROLE KEY so we
// can keep verify_jwt = false here AND reject anonymous calls.
import { createClient } from "npm:@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SITE_ORIGIN = "https://www.digitalmamanlibre.com";
const BATCH_SIZE = 25;

// Backoff: 1m, 5m, 15m, 1h, 4h, 12h (≈ ~17 h total before failed)
const BACKOFF_MINUTES = [1, 5, 15, 60, 240, 720];

const safeStringify = (v: unknown) => {
  try { return JSON.stringify(v); } catch { return String(v); }
};

const computeNextAttemptAt = (attempts: number): string => {
  const idx = Math.min(attempts, BACKOFF_MINUTES.length - 1);
  const ms = BACKOFF_MINUTES[idx] * 60_000;
  return new Date(Date.now() + ms).toISOString();
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  // Authorize: only callers presenting the service role key (i.e. our cron
  // job) may trigger this worker. The Edge Function is deployed with
  // verify_jwt = false because pg_cron uses an apikey header, but we still
  // gate execution here.
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  if (!serviceRoleKey || !supabaseUrl) {
    return new Response(JSON.stringify({ error: "server_config_error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const authHeader = req.headers.get("authorization") ?? "";
  const apikeyHeader = req.headers.get("apikey") ?? "";
  const presented = authHeader.replace(/^Bearer\s+/i, "") || apikeyHeader;
  if (presented !== serviceRoleKey) {
    return new Response(JSON.stringify({ error: "unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const nowIso = new Date().toISOString();
  const { data: due, error: fetchErr } = await supabase
    .from("pending_account_emails")
    .select("id, email, payment_id, user_id, template_name, attempts, max_attempts")
    .eq("status", "pending")
    .lte("next_attempt_at", nowIso)
    .order("next_attempt_at", { ascending: true })
    .limit(BATCH_SIZE);

  if (fetchErr) {
    console.error("retry-account-emails: fetch failed", safeStringify(fetchErr));
    return new Response(JSON.stringify({ error: "fetch_failed" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const results: Array<Record<string, unknown>> = [];

  for (const row of due ?? []) {
    const newAttempts = row.attempts + 1;
    try {
      // 1. Regenerate a fresh recovery link
      const { data: linkData, error: linkErr } = await supabase.auth.admin.generateLink({
        type: "recovery",
        email: row.email,
        options: { redirectTo: `${SITE_ORIGIN}/activation-compte?welcome=1` },
      });
      if (linkErr) throw linkErr;

      const actionLink =
        linkData?.properties?.action_link
        ?? (linkData as any)?.action_link
        ?? null;
      if (!actionLink) throw new Error("no_action_link");

      // 2. Send the welcome-initiation email
      const { error: sendErr } = await supabase.functions.invoke(
        "send-transactional-email",
        {
          body: {
            templateName: row.template_name,
            recipientEmail: row.email,
            idempotencyKey: `account-activation-${row.payment_id}-r${newAttempts}`,
            templateData: { firstName: "", actionUrl: actionLink },
          },
        },
      );
      if (sendErr) throw sendErr;

      // 3. Mark sent
      await supabase
        .from("pending_account_emails")
        .update({
          status: "sent",
          attempts: newAttempts,
          last_attempt_at: nowIso,
          sent_at: nowIso,
          last_error: null,
        })
        .eq("id", row.id);

      results.push({ id: row.id, email: row.email, status: "sent", attempts: newAttempts });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      const exhausted = newAttempts >= row.max_attempts;
      const update: Record<string, unknown> = {
        attempts: newAttempts,
        last_attempt_at: nowIso,
        last_error: message.slice(0, 500),
      };
      if (exhausted) {
        update.status = "failed";
      } else {
        update.next_attempt_at = computeNextAttemptAt(newAttempts);
      }
      await supabase
        .from("pending_account_emails")
        .update(update)
        .eq("id", row.id);

      console.error(
        "retry-account-emails: send failed",
        safeStringify({ id: row.id, email: row.email, attempts: newAttempts, exhausted, message }),
      );
      results.push({
        id: row.id,
        email: row.email,
        status: exhausted ? "failed" : "retry_scheduled",
        attempts: newAttempts,
        error: message,
      });
    }
  }

  return new Response(
    JSON.stringify({ processed: results.length, results }),
    { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
  );
});
