import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const MODEL = "google/gemini-3.5-transcribe";
const MAX_BYTES = 12 * 1024 * 1024; // sous la limite de 14 Mo du modèle

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

    const declared = Number(req.headers.get("content-length") ?? 0);
    if (declared > MAX_BYTES) return json({ error: "Audio trop long" }, 413);

    const incoming = await req.formData();
    const file = incoming.get("file");
    if (!(file instanceof File) || !file.size) return json({ error: "Aucun audio reçu" }, 400);
    if (file.size > MAX_BYTES) return json({ error: "Audio trop long" }, 413);
    if (!file.type.startsWith("audio/")) return json({ error: "Format audio non supporté" }, 400);

    const form = new FormData();
    form.append("model", MODEL);
    form.append("file", file, file.name || "recording.wav");
    form.append("response_format", "json");
    form.append("stream", "true");
    const language = incoming.get("language");
    if (typeof language === "string" && language) form.append("language", language);

    const upstream = await fetch("https://ai.gateway.lovable.dev/v1/audio/transcriptions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}` },
      body: form,
    });

    if (!upstream.ok) {
      const details = await upstream.text();
      console.error(`transcription failed [${upstream.status}]: ${details}`);
      return new Response(details, {
        status: upstream.status,
        headers: {
          ...corsHeaders,
          "Content-Type": upstream.headers.get("content-type") ?? "application/json",
        },
      });
    }

    return new Response(upstream.body, {
      status: upstream.status,
      headers: {
        ...corsHeaders,
        "Content-Type": upstream.headers.get("content-type") ?? "text/event-stream",
        "Cache-Control": "no-cache",
      },
    });
  } catch (error) {
    console.error("transcribe-voice error", error);
    return json({ error: error instanceof Error ? error.message : "Unknown error" }, 500);
  }
});
