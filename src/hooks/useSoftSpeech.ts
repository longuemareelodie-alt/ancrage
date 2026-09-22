import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { NEUTRAL_STYLE, type SoftVoice } from "@/data/softVoices";

type Status = "idle" | "loading" | "playing";

/**
 * Lecture à voix haute d'une phrase d'Éclosia.
 * Rien ne se lance tout seul : c'est toujours la maman qui appuie.
 */
export const useSoftSpeech = () => {
  const [status, setStatus] = useState<Status>("idle");
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const urlRef = useRef<string | null>(null);

  const cleanup = useCallback(() => {
    audioRef.current?.pause();
    audioRef.current = null;
    if (urlRef.current) {
      URL.revokeObjectURL(urlRef.current);
      urlRef.current = null;
    }
  }, []);

  useEffect(() => cleanup, [cleanup]);

  const stop = useCallback(() => {
    cleanup();
    setStatus("idle");
  }, [cleanup]);

  const speak = useCallback(
    async (text: string, options?: { voice?: SoftVoice; style?: string }) => {
      const phrase = text.trim();
      if (!phrase) return;
      cleanup();
      setStatus("loading");
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) throw new Error("Connecte-toi pour entendre Éclosia.");

        const res = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/speak-soft`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${session.access_token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              text: phrase.slice(0, 600),
              voice: options?.voice,
              style: options?.style ?? NEUTRAL_STYLE,
            }),
          },
        );
        if (!res.ok) throw new Error(await res.text());

        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        urlRef.current = url;
        const audio = new Audio(url);
        audioRef.current = audio;
        audio.onended = () => stop();
        audio.onerror = () => stop();
        await audio.play();
        setStatus("playing");
      } catch (error) {
        console.error("useSoftSpeech", error);
        cleanup();
        setStatus("idle");
        throw error;
      }
    },
    [cleanup, stop],
  );

  return { status, speak, stop };
};
