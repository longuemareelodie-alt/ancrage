import { useCallback, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { recordWav } from "@/lib/voiceRecorder";

type Status = "idle" | "recording" | "transcribing";

const FUNCTION_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/transcribe-voice`;

/**
 * 🎙️ Dictée vocale — on parle, le texte s'écrit tout seul.
 * L'audio est enregistré en WAV complet, envoyé au serveur, et le transcript
 * revient en flux (SSE) pour s'afficher au fil de la phrase.
 */
export const useVoiceDictation = (options?: {
  onText?: (text: string) => void;
  onDone?: (text: string) => void;
  onError?: (message: string) => void;
}) => {
  const [status, setStatus] = useState<Status>("idle");
  const [partial, setPartial] = useState("");
  const recorderRef = useRef<Awaited<ReturnType<typeof recordWav>> | null>(null);

  const fail = useCallback(
    (message: string) => {
      setStatus("idle");
      setPartial("");
      options?.onError?.(message);
    },
    [options],
  );

  const start = useCallback(async () => {
    if (status !== "idle") return;
    try {
      recorderRef.current = await recordWav();
      setPartial("");
      setStatus("recording");
      navigator.vibrate?.(8);
    } catch {
      fail("Je n'ai pas pu accéder au micro. Autorise-le et réessaie.");
    }
  }, [status, fail]);

  const cancel = useCallback(() => {
    recorderRef.current?.cancel();
    recorderRef.current = null;
    setStatus("idle");
    setPartial("");
  }, []);

  const stop = useCallback(async () => {
    const recorder = recorderRef.current;
    if (!recorder || status !== "recording") return;
    recorderRef.current = null;
    let file: File;
    try {
      file = await recorder.stop();
    } catch {
      fail("Je n'ai rien entendu. Réessaie en parlant un peu plus longtemps.");
      return;
    }

    setStatus("transcribing");
    try {
      const { data: session } = await supabase.auth.getSession();
      const token = session.session?.access_token;
      if (!token) throw new Error("no-session");

      const form = new FormData();
      form.append("file", file, file.name);
      form.append("language", "fr");

      const response = await fetch(FUNCTION_URL, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });

      if (!response.ok || !response.body) {
        console.error("transcribe-voice failed", response.status, await response.text());
        fail("La dictée n'a pas fonctionné. On réessaie ?");
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let text = "";

      const handleEvent = (raw: string) => {
        const dataLines = raw
          .split("\n")
          .filter((l) => l.startsWith("data:"))
          .map((l) => l.slice(5).trim());
        if (!dataLines.length) return;
        const payload = dataLines.join("");
        if (!payload || payload === "[DONE]") return;
        try {
          const event = JSON.parse(payload);
          if (event.type === "transcript.text.delta" && typeof event.delta === "string") {
            text += event.delta;
          } else if (event.type === "transcript.text.done" && typeof event.text === "string") {
            text = event.text;
          } else if (typeof event.text === "string") {
            text = event.text;
          }
          setPartial(text);
          options?.onText?.(text);
        } catch {
          /* fragment ignoré */
        }
      };

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        let index: number;
        while ((index = buffer.indexOf("\n\n")) !== -1) {
          handleEvent(buffer.slice(0, index));
          buffer = buffer.slice(index + 2);
        }
      }
      if (buffer.trim()) handleEvent(buffer);

      const finalText = text.trim();
      setStatus("idle");
      setPartial("");
      if (!finalText) {
        options?.onError?.("Je n'ai pas réussi à comprendre. Réessaie doucement.");
        return;
      }
      navigator.vibrate?.(12);
      options?.onDone?.(finalText);
    } catch {
      fail("La dictée n'a pas fonctionné. On réessaie ?");
    }
  }, [status, fail, options]);

  return { status, partial, start, stop, cancel };
};
