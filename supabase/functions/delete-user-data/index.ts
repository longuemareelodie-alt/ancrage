// Edge function: delete-user-data
// Supprime toutes les données personnelles d'un utilisateur authentifié
// puis supprime son compte auth. Utilise le service role car certaines
// tables ont des policies qui bloquent le DELETE côté client (subscriptions,
// emergency_uses, user_badges, user_progress, medication_reminder_log, profiles).
import { createClient } from "npm:@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const json = (payload: unknown, status = 200) =>
  new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

// Tables contenant des données utilisateur identifiables, dans l'ordre de
// suppression (dépendances logiques d'abord).
const USER_TABLES = [
  "user_notes",
  "emotion_checkins",
  "user_badges",
  "user_progress",
  "appointments",
  "medication_reminder_log",
  "medications",
  "medical_records",
  "emergency_uses",
  "push_subscriptions",
  "subscriptions",
  // profiles est supprimé en dernier
];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY");

    if (!supabaseUrl || !serviceRoleKey || !anonKey) {
      return json({ error: "server_config_error" }, 500);
    }

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return json({ error: "unauthorized" }, 401);
    }

    // Vérifie l'utilisateur appelant via son JWT
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData, error: userError } = await userClient.auth.getUser();
    if (userError || !userData?.user) {
      return json({ error: "unauthorized" }, 401);
    }
    const userId = userData.user.id;

    // Client admin pour passer outre les RLS et supprimer le compte auth
    const admin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false },
    });

    const results: Record<string, { ok: boolean; error?: string }> = {};

    for (const table of USER_TABLES) {
      const { error } = await admin.from(table).delete().eq("user_id", userId);
      results[table] = error
        ? { ok: false, error: error.message }
        : { ok: true };
    }

    // Supprime le profil
    const { error: profileError } = await admin
      .from("profiles")
      .delete()
      .eq("user_id", userId);
    results["profiles"] = profileError
      ? { ok: false, error: profileError.message }
      : { ok: true };

    // Supprime le compte auth (cascade sur tout ce qui resterait via FK)
    const { error: authError } = await admin.auth.admin.deleteUser(userId);
    results["auth_user"] = authError
      ? { ok: false, error: authError.message }
      : { ok: true };

    const allOk = Object.values(results).every((r) => r.ok);

    return json({
      success: allOk,
      user_id: userId,
      results,
    });
  } catch (error) {
    console.error("delete-user-data error", error);
    return json(
      {
        error: "internal_error",
        message: error instanceof Error ? error.message : String(error),
      },
      500,
    );
  }
});
