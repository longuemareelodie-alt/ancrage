// retry-account-email-now
//
// Permet à un admin de relancer manuellement un email d'activation en attente
// (ou échoué) sans attendre le cron `retry-account-emails`. Reprend la même
// logique métier que le worker mais pour une seule ligne, identifiée par son
// id, et avec authentification admin obligatoire.
//
// Auth: vérifie le JWT du caller, charge son user_id, exige role 'admin'
// dans user_roles. Si ok, exécute la relance avec le service role.
import { createClient } from "npm:@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SITE_ORIGIN = "https://www.digitalmamanlibre.com";

// Backoff aligné sur retry-account-emails pour cohérence métier
const BACKOFF_MINUTES = [1, 5, 15, 60, 240, 720];
const computeNextAttemptAt = (attempts: number): string => {
  const idx = Math.min(attempts, BACKOFF_MINUTES.length - 1);
  return new Date(Date.now() + BACKOFF_MINUTES[idx] * 60_000).toISOString();
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

interface RequestBody {
  /** UUID de la ligne pending_account_emails à relancer */
  id?: string;
  /** Si true, ne fait que reset attempts/status à 'pending' sans envoi (utile
   * pour réarmer une ligne 'failed' avant que le cron la reprenne). */
  resetOnly?: boolean;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  if (req.method !== "POST") {
    return json({ error: "method_not_allowed" }, 405);
  }

  const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
  const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY");
  if (!SERVICE_ROLE_KEY || !SUPABASE_URL || !ANON_KEY) {
    return json({ error: "server_config_error" }, 500);
  }

  // ---- Auth: valide le JWT du caller et exige role admin ----
  const authHeader = req.headers.get("authorization") ?? "";
  const jwt = authHeader.replace(/^Bearer\s+/i, "").trim();
  if (!jwt) return json({ error: "unauthorized", reason: "missing_jwt" }, 401);

  // Client "as caller" pour résoudre auth.uid() à partir du JWT
  const userClient = createClient(SUPABASE_URL, ANON_KEY, {
    global: { headers: { Authorization: `Bearer ${jwt}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data: userData, error: userErr } = await userClient.auth.getUser();
  if (userErr || !userData?.user) {
    return json({ error: "unauthorized", reason: "invalid_jwt" }, 401);
  }
  const callerId = userData.user.id;

  // Service-role client pour vérifier le rôle et exécuter la relance
  const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: roleRow } = await admin
    .from("user_roles")
    .select("role")
    .eq("user_id", callerId)
    .eq("role", "admin")
    .maybeSingle();
  if (!roleRow) {
    return json({ error: "forbidden", reason: "not_admin" }, 403);
  }

  // ---- Validation body ----
  let body: RequestBody;
  try {
    body = (await req.json()) as RequestBody;
  } catch {
    return json({ error: "invalid_json" }, 400);
  }
  const id = typeof body?.id === "string" ? body.id.trim() : "";
  if (!id) return json({ error: "missing_id" }, 400);
  const resetOnly = body?.resetOnly === true;

  // ---- Récupération de la ligne ----
  const { data: row, error: rowErr } = await admin
    .from("pending_account_emails")
    .select("id, email, payment_id, user_id, template_name, attempts, max_attempts, status")
    .eq("id", id)
    .maybeSingle();
  if (rowErr || !row) {
    return json({ error: "not_found" }, 404);
  }

  const nowIso = new Date().toISOString();

  // ---- Mode resetOnly : remet la ligne en pending sans envoi ----
  if (resetOnly) {
    const { error: updErr } = await admin
      .from("pending_account_emails")
      .update({
        status: "pending",
        attempts: 0,
        last_error: null,
        next_attempt_at: nowIso,
        last_attempt_at: null,
        sent_at: null,
      })
      .eq("id", id);
    if (updErr) return json({ error: "update_failed", details: updErr.message }, 500);
    return json({ ok: true, action: "reset", id, by: callerId });
  }

  // ---- Mode envoi immédiat ----
  const newAttempts = row.attempts + 1;

  try {
    // 1) Régénère un magic link frais (les anciens expirent vite)
    const { data: linkData, error: linkErr } = await admin.auth.admin.generateLink({
      type: "recovery",
      email: row.email,
      options: { redirectTo: `${SITE_ORIGIN}/activation-compte?welcome=1` },
    });
    if (linkErr) throw linkErr;

    const actionLink =
      linkData?.properties?.action_link
      ?? (linkData as unknown as { action_link?: string })?.action_link
      ?? null;
    if (!actionLink) throw new Error("no_action_link");

    // 2) Envoi via send-transactional-email (idempotency key inclut "manual"
    //    pour éviter collision avec les retries automatiques du cron)
    const { error: sendErr } = await admin.functions.invoke(
      "send-transactional-email",
      {
        body: {
          templateName: row.template_name,
          recipientEmail: row.email,
          idempotencyKey: `account-activation-${row.payment_id}-manual-${callerId}-${Date.now()}`,
          templateData: { firstName: "", actionUrl: actionLink },
        },
      },
    );
    if (sendErr) throw sendErr;

    // 3) Marque envoyé
    await admin
      .from("pending_account_emails")
      .update({
        status: "sent",
        attempts: newAttempts,
        last_attempt_at: nowIso,
        sent_at: nowIso,
        last_error: null,
      })
      .eq("id", id);

    return json({ ok: true, action: "sent", id, attempts: newAttempts, by: callerId });
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
    await admin
      .from("pending_account_emails")
      .update(update)
      .eq("id", id);

    return json({
      ok: false,
      action: exhausted ? "failed" : "retry_scheduled",
      id,
      attempts: newAttempts,
      error: message,
    }, 500);
  }
});
