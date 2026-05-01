// send-activation-to-existing
//
// One-shot admin tool: for every premium user that signed up via Google OAuth
// and has no password set, generate a fresh recovery link pointing to
// /set-password and send the welcome-initiation email.
//
// Auth: caller must present the SERVICE_ROLE_KEY (apikey or Bearer header).
// Optional body: { dryRun?: boolean, onlyEmail?: string, includeAll?: boolean }
//   - dryRun: list candidates without sending
//   - onlyEmail: target a single email
//   - includeAll: include premium users even if they already have a password
//                 (use with care — overrides their existing password flow)
import { createClient } from "npm:@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SITE_ORIGIN = "https://www.digitalmamanlibre.com";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  if (!serviceRoleKey || !supabaseUrl) {
    return new Response(JSON.stringify({ error: "server_config_error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const presented = (req.headers.get("authorization") ?? "").replace(/^Bearer\s+/i, "")
    || req.headers.get("apikey")
    || "";
  // Accept either the runtime service role JWT or the vault-stored key used by pg_cron.
  const supabaseInit = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  let vaultKey: string | null = null;
  try {
    const { data } = await supabaseInit
      .schema("vault" as any)
      .from("decrypted_secrets")
      .select("decrypted_secret")
      .eq("name", "email_queue_service_role_key")
      .maybeSingle();
    vaultKey = (data as any)?.decrypted_secret ?? null;
  } catch { /* ignore */ }
  if (presented !== serviceRoleKey && (!vaultKey || presented !== vaultKey)) {
    return new Response(JSON.stringify({ error: "unauthorized" }), {
      status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  let body: { dryRun?: boolean; onlyEmail?: string; includeAll?: boolean } = {};
  try { body = await req.json(); } catch { /* empty body ok */ }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  // Build the candidate set.
  // 1. Get premium user ids.
  const { data: premiumProfiles, error: profErr } = await supabase
    .from("profiles")
    .select("id")
    .eq("is_premium", true);
  if (profErr) {
    return new Response(JSON.stringify({ error: "profiles_query_failed", detail: profErr.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  const premiumIds = new Set((premiumProfiles ?? []).map((p) => p.id));

  // 2. Page through auth users (admin API).
  const candidates: Array<{ id: string; email: string; hasPassword: boolean; providers: string[] }> = [];
  let page = 1;
  const perPage = 200;
  // Hard cap to avoid runaway loops.
  for (let i = 0; i < 50; i++) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage });
    if (error) {
      return new Response(JSON.stringify({ error: "list_users_failed", detail: error.message }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const users = data?.users ?? [];
    for (const u of users) {
      if (!u.email) continue;
      if (body.onlyEmail && u.email.toLowerCase() !== body.onlyEmail.toLowerCase()) continue;
      if (!body.onlyEmail && !premiumIds.has(u.id)) continue;
      const providers = (u.identities ?? []).map((i: any) => i.provider);
      // encrypted_password isn't exposed via admin API, so we infer "no password"
      // by absence of an `email` identity. Google-only users have providers=['google'].
      const hasEmailIdentity = providers.includes("email");
      const hasPassword = hasEmailIdentity; // best-effort proxy
      if (!body.includeAll && hasPassword) continue;
      candidates.push({ id: u.id, email: u.email, hasPassword, providers });
    }
    if (users.length < perPage) break;
    page++;
  }

  if (body.dryRun) {
    return new Response(JSON.stringify({ dryRun: true, count: candidates.length, candidates }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const results: Array<Record<string, unknown>> = [];
  for (const c of candidates) {
    try {
      const { data: linkData, error: linkErr } = await supabase.auth.admin.generateLink({
        type: "recovery",
        email: c.email,
        options: { redirectTo: `${SITE_ORIGIN}/activation-compte?welcome=1` },
      });
      if (linkErr) throw linkErr;
      const actionLink = linkData?.properties?.action_link
        ?? (linkData as any)?.action_link
        ?? null;
      if (!actionLink) throw new Error("no_action_link");

      const { error: sendErr } = await supabase.functions.invoke("send-transactional-email", {
        body: {
          templateName: "welcome-initiation",
          recipientEmail: c.email,
          idempotencyKey: `activation-existing-${c.id}-${Date.now()}`,
          templateData: { firstName: "", actionUrl: actionLink },
        },
      });
      if (sendErr) throw sendErr;
      results.push({ email: c.email, status: "sent" });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error("send-activation-to-existing failed", c.email, message);
      results.push({ email: c.email, status: "error", error: message });
    }
  }

  return new Response(JSON.stringify({ processed: results.length, results }), {
    status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
