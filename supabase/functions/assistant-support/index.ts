import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const TYPES = [
  "routine",
  "checklist",
  "emploi-du-temps",
  "histoire",
  "recompenses",
  "cartes",
  "activite",
];

const SYSTEM = `Tu es l'assistant d'Éclosia, une application pour les parents d'enfants neuroatypiques.

Un parent te décrit une situation concrète du quotidien ("mon fils refuse de mettre ses chaussures").
Tu proposes 2 à 4 supports visuels imprimables, prêts à l'emploi.

Types disponibles (utilise exactement ces identifiants) :
- "routine" : suite d'étapes visuelles, avec horaires possibles.
- "checklist" : lignes à cocher.
- "emploi-du-temps" : moments de la journée avec horaires.
- "histoire" : histoire sociale, une phrase courte par ligne, à la première personne de l'enfant.
- "recompenses" : objectifs simples à valoriser.
- "cartes" : mots ou besoins isolés, un par carte.
- "activite" : un moment préparé ; la première ligne commence par "Matériel :", la deuxième par "Objectif :", puis les étapes.

Règles :
- Tu parles au parent avec "tu", ton doux, jamais culpabilisant, jamais médical.
- Les phrases destinées à l'enfant sont très courtes, concrètes, positives.
- 4 à 8 éléments par support.
- Aucun diagnostic, aucun conseil médical.
- Tu réponds UNIQUEMENT avec un objet JSON valide, sans texte autour, de la forme :
{"intro":"une phrase pour le parent","supports":[{"type":"routine","title":"...","description":"...","items":[{"label":"...","time":"07:00"}]}]}
Le champ "time" est optionnel et réservé aux routines et emplois du temps.`;

const URGENT_HINT = `Contexte : le parent est en pleine difficulté, maintenant.
- L'intro fait une seule phrase, rassurante, sans consigne longue.
- Commence par un support de retour au calme ou de communication immédiate (cartes, routine de calme).
- Les phrases sont encore plus courtes que d'habitude.`;


Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "Unauthorized" }, 401);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return json({ error: "Unauthorized" }, 401);

    const { situation, childName, urgent } = await req.json();
    if (!situation || typeof situation !== "string" || situation.trim().length < 5) {
      return json({ error: "invalid_input", message: "Décris la situation en quelques mots." }, 400);
    }

    const lovableKey = Deno.env.get("LOVABLE_API_KEY");
    if (!lovableKey) return json({ error: "LOVABLE_API_KEY missing" }, 500);

    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${lovableKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3.6-flash",
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: SYSTEM },
          {
            role: "user",
            content: `Situation : ${situation.slice(0, 800)}${
              childName ? `\nPrénom de l'enfant : ${childName}` : ""
            }`,
          },
        ],
      }),
    });

    if (!aiRes.ok) {
      const text = await aiRes.text();
      if (aiRes.status === 429) {
        return json({ error: "rate_limited", message: "Trop de demandes, réessaie dans un instant." }, 429);
      }
      if (aiRes.status === 402) {
        return json({ error: "credits_exhausted", message: "Crédits IA épuisés." }, 402);
      }
      throw new Error(`AI gateway error ${aiRes.status}: ${text}`);
    }

    const data = await aiRes.json();
    const raw = data?.choices?.[0]?.message?.content ?? "";
    let parsed: { intro?: string; supports?: unknown };
    try {
      parsed = JSON.parse(raw);
    } catch {
      const match = raw.match(/\{[\s\S]*\}/);
      if (!match) throw new Error("Réponse illisible");
      parsed = JSON.parse(match[0]);
    }

    const supports = (Array.isArray(parsed.supports) ? parsed.supports : [])
      .filter((s: { type?: string; items?: unknown }) => TYPES.includes(s?.type ?? "") && Array.isArray(s?.items))
      .slice(0, 4)
      .map((s: { type: string; title?: string; description?: string; items: { label?: string; time?: string }[] }) => ({
        type: s.type,
        title: String(s.title ?? "Support").slice(0, 80),
        description: String(s.description ?? "").slice(0, 160),
        items: s.items
          .filter((i) => i?.label)
          .slice(0, 10)
          .map((i) => ({ label: String(i.label).slice(0, 140), ...(i.time ? { time: String(i.time).slice(0, 5) } : {}) })),
      }))
      .filter((s) => s.items.length > 0);

    if (!supports.length) {
      return json({ error: "empty", message: "Je n'ai pas réussi à créer un support. Reformule en une phrase." }, 200);
    }

    return json({ intro: String(parsed.intro ?? "").slice(0, 300), supports });
  } catch (e) {
    console.error("assistant-support error", e);
    return json({ error: "internal", message: "Une erreur est survenue. Réessaie." }, 500);
  }
});
