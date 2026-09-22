import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const MODEL = "google/gemini-3.1-flash-tts-preview";
const MAX_CHARS = 600;
// Voix Gemini autorisées : douces, adultes, jamais caricaturales.
const VOICES = new Set(["Kore", "Aoede", "Callirrhoe", "Leda", "Zephyr", "Vindemiatrix"]);

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const json = (body: unknown, status: number) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

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

    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) return json({ error: "LOVABLE_API_KEY is not configured" }, 500);

    const body = await req.json().catch(() => null);
    const text = typeof body?.text === "string" ? body.text.trim() : "";
    if (!text) return json({ error: "Aucun texte à lire" }, 400);
    if (text.length > MAX_CHARS) return json({ error: "Texte trop long" }, 400);

    const voice = typeof body?.voice === "string" && VOICES.has(body.voice) ? body.voice : "Kore";
    const style = typeof body?.style === "string" ? body.style.slice(0, 200) : "";
    // Le ton se pilote dans le texte parlé (contrat Gemini TTS).
    const spoken = `${style || "Dis d'une voix douce, calme et chaleureuse, en français"}: ${text}`;

    const upstream = await fetch("https://ai.gateway.lovable.dev/v1/audio/speech", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL,
        contents: [{ role: "user", parts: [{ text: spoken }] }],
        generationConfig: {
          responseModalities: ["AUDIO"],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: voice } } },
        },
      }),
    });

    if (!upstream.ok) {
      const details = await upstream.text();
      console.error(`speech failed [${upstream.status}]: ${details}`);
      return new Response(details, {
        status: upstream.status,
        headers: {
          ...corsHeaders,
          "Content-Type": upstream.headers.get("content-type") ?? "application/json",
        },
      });
    }

    return new Response(upstream.body, {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": upstream.headers.get("content-type") ?? "audio/wav",
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("speak-soft error", error);
    return json({ error: error instanceof Error ? error.message : "Unknown error" }, 500);
  }
});
