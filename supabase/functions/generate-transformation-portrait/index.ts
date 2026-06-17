import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface Body {
  year?: number;
  month?: number; // 1-12
  mode?: "manual" | "auto";
  userId?: string; // service-role only (cron)
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body: Body = await req.json().catch(() => ({}));
    const authHeader = req.headers.get("Authorization") ?? "";
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;

    const cronSecret = Deno.env.get("PORTRAIT_CRON_SECRET");
    const providedCronSecret = req.headers.get("x-cron-secret");
    const isServiceCall =
      typeof body.userId === "string" &&
      ((cronSecret && providedCronSecret === cronSecret) ||
        authHeader.includes(serviceKey));

    let userId: string | null = null;
    let supabase;

    if (isServiceCall) {
      supabase = createClient(supabaseUrl, serviceKey);
      userId = body.userId!;
    } else {
      const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
      supabase = createClient(supabaseUrl, anonKey, {
        global: { headers: { Authorization: authHeader } },
      });
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      userId = user.id;
    }

    // Default: previous month if not provided (cron runs on 1st)
    const now = new Date();
    let year = body.year ?? now.getUTCFullYear();
    let month = body.month ?? now.getUTCMonth() + 1; // current month manual default
    if (!body.year && !body.month && body.mode === "auto") {
      // previous month
      const prev = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1));
      year = prev.getUTCFullYear();
      month = prev.getUTCMonth() + 1;
    }

    const from = new Date(Date.UTC(year, month - 1, 1)).toISOString();
    const to = new Date(Date.UTC(year, month, 1)).toISOString();

    // Use service role to read entries when service call, otherwise user-scoped client (RLS).
    const reader = isServiceCall
      ? createClient(supabaseUrl, serviceKey)
      : supabase;

    const { data: entries, error: entriesErr } = await reader
      .from("private_journal_entries")
      .select("content, created_at")
      .eq("user_id", userId)
      .gte("created_at", from)
      .lt("created_at", to)
      .order("created_at", { ascending: true })
      .limit(200);

    if (entriesErr) throw entriesErr;

    if (!entries || entries.length === 0) {
      return new Response(
        JSON.stringify({
          error: "no_entries",
          message:
            "Aucune entrée de journal trouvée pour ce mois. Écris quelques pages et reviens créer ton portrait. 🌸",
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const formatted = entries
      .map((e, i) => {
        const d = new Date(e.created_at).toLocaleDateString("fr-FR", {
          day: "numeric",
          month: "long",
        });
        return `Entrée ${i + 1} — ${d}:\n${e.content.slice(0, 800)}`;
      })
      .join("\n\n---\n\n");

    const lovableKey = Deno.env.get("LOVABLE_API_KEY");
    if (!lovableKey) {
      return new Response(JSON.stringify({ error: "LOVABLE_API_KEY missing" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const monthName = new Date(Date.UTC(year, month - 1, 1)).toLocaleDateString(
      "fr-FR",
      { month: "long", year: "numeric" }
    );

    const systemPrompt = `Tu es une présence douce, féminine, chaleureuse et profondément humaine au sein d'Eclosia, un espace de reconstruction pour les mamans atypiques.

Ta mission : lire les entrées de journal d'une maman pour un mois donné et lui offrir un "Portrait de Transformation" en 4 sections.

Règles essentielles :
- Tu utilises "tu", jamais "vous".
- Tu t'appuies uniquement sur ce qu'elle a écrit. Tu ne fabriques rien.
- Ton ton est doux, validant, jamais moralisateur, jamais coaching agressif.
- Aucune positivité forcée, aucune injonction au bonheur.
- Pas d'emojis dans le corps du texte.
- Pas de conseil médical, pas de diagnostic.
- Chaque section : 3 à 5 phrases, concrètes, qui citent ce qu'elle a vécu.

Tu réponds STRICTEMENT en JSON valide avec EXACTEMENT ces 4 clés string :
{
  "overcome": "Ce que tu as surmonté ce mois-ci...",
  "developing": "Ce que tu es en train de développer...",
  "new_strengths": "Tes nouvelles forces...",
  "becoming": "La femme que tu es en train de devenir..."
}
Aucun autre texte, aucun bloc markdown, juste le JSON.`;

    const userPrompt = `Voici les entrées de journal de cette maman pour ${monthName} (${entries.length} entrée${entries.length > 1 ? "s" : ""}) :

${formatted}

Rédige maintenant son Portrait de Transformation au format JSON demandé.`;

    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${lovableKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!aiRes.ok) {
      const text = await aiRes.text();
      if (aiRes.status === 429) {
        return new Response(
          JSON.stringify({ error: "rate_limited", message: "Trop de demandes, réessaie dans un instant." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (aiRes.status === 402) {
        return new Response(
          JSON.stringify({ error: "credits_exhausted", message: "Crédits IA épuisés." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      throw new Error(`AI gateway error ${aiRes.status}: ${text}`);
    }

    const data = await aiRes.json();
    const raw = data?.choices?.[0]?.message?.content?.trim() ?? "{}";
    let parsed: { overcome?: string; developing?: string; new_strengths?: string; becoming?: string } = {};
    try {
      parsed = JSON.parse(raw);
    } catch {
      // Try to extract JSON inside fences
      const m = raw.match(/\{[\s\S]*\}/);
      if (m) parsed = JSON.parse(m[0]);
    }

    const overcome = parsed.overcome?.trim() || "—";
    const developing = parsed.developing?.trim() || "—";
    const new_strengths = parsed.new_strengths?.trim() || "—";
    const becoming = parsed.becoming?.trim() || "—";

    // Upsert via service role to bypass RLS for cron, and to safely update existing month.
    const writer = createClient(supabaseUrl, serviceKey);
    const { data: saved, error: saveErr } = await writer
      .from("transformation_portraits")
      .upsert(
        {
          user_id: userId,
          year,
          month,
          overcome,
          developing,
          new_strengths,
          becoming,
          entry_count: entries.length,
          generation_mode: body.mode === "auto" ? "auto" : "manual",
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id,year,month" }
      )
      .select()
      .single();

    if (saveErr) throw saveErr;

    return new Response(JSON.stringify({ portrait: saved }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("generate-transformation-portrait error", err);
    return new Response(
      JSON.stringify({ error: "internal_error", message: String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
