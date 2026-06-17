import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: entries, error } = await supabase
      .from("private_journal_entries")
      .select("content, created_at, prompt_key, mode")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true })
      .limit(100);

    if (error) throw error;

    if (!entries || entries.length === 0) {
      return new Response(
        JSON.stringify({
          insight:
            "Ton journal est encore une page blanche. Écris ce que tu portes aujourd'hui — je serai là pour me souvenir avec toi. 🌱",
          entryCount: 0,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build a compact chronological summary for the model
    const first = entries[0];
    const last = entries[entries.length - 1];
    const firstDate = new Date(first.created_at);
    const lastDate = new Date(last.created_at);
    const daysSinceFirst = Math.max(
      1,
      Math.floor((lastDate.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24))
    );

    const formatted = entries
      .map((e, i) => {
        const d = new Date(e.created_at).toLocaleDateString("fr-FR", {
          day: "numeric",
          month: "long",
          year: "numeric",
        });
        return `Entrée ${i + 1} — ${d}:\n${e.content.slice(0, 600)}`;
      })
      .join("\n\n---\n\n");

    const lovableKey = Deno.env.get("LOVABLE_API_KEY");
    if (!lovableKey) {
      return new Response(JSON.stringify({ error: "LOVABLE_API_KEY missing" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const systemPrompt = `Tu es une présence douce, féminine, chaleureuse et profondément humaine au sein d'Eclosia, un espace de reconstruction pour les mamans atypiques.

Ta mission : relire le journal intime d'une maman et lui offrir un court message personnel qui retrace son chemin émotionnel.

Règles essentielles :
- Tu utilises "tu", jamais "vous".
- Tu cites des éléments concrets de ses entrées (sentiments, mots, situations) sans jamais inventer.
- Tu compares là où elle en était au début/au milieu et là où elle en est aujourd'hui (dernière entrée).
- Tu nommes ce qui a changé, ce qui revient, ce qu'elle traverse.
- Ton ton est doux, validant, jamais moralisateur, jamais coaching agressif.
- Aucune injonction au bonheur, aucune positivité forcée.
- Tu termines par une phrase rassurante très courte.
- Longueur : 3 à 5 phrases maximum.
- Pas d'emojis dans le corps du texte (un seul à la toute fin si pertinent : 🌱).
- Tu ne donnes ni conseil médical ni diagnostic.`;

    const userPrompt = `Voici le journal de cette maman, du plus ancien au plus récent (${entries.length} entrée${entries.length > 1 ? "s" : ""} sur environ ${daysSinceFirst} jour${daysSinceFirst > 1 ? "s" : ""}) :

${formatted}

Rédige maintenant ton message personnel pour elle, qui fait le lien entre ses premières entrées et son entrée la plus récente.`;

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
    const insight = data?.choices?.[0]?.message?.content?.trim() ?? "";

    return new Response(
      JSON.stringify({
        insight,
        entryCount: entries.length,
        daysSinceFirst,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("journal-memory-insight error", err);
    return new Response(
      JSON.stringify({ error: "internal_error", message: String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
