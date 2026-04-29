import { useEffect, useRef, useState } from "react";
import { Volume2, Pause, Play, Square, RotateCcw } from "lucide-react";
import {
  RATE_VALUES,
  getSpeechRate,
  getSpeechLang,
  loadVoices,
  resolveVoice,
} from "@/lib/speechPrefs";

type SpeechState = "idle" | "speaking" | "paused";

interface SpeakableTextProps {
  text: string;
  /** Optional secondary text (e.g. hint) appended after the main text. */
  hint?: string;
  lang?: string;
  className?: string;
  textClassName?: string;
}

/**
 * Splits a string into sentences while keeping their trailing punctuation,
 * and tracks the start offset of each sentence in the original string.
 */
interface Sentence {
  text: string;
  start: number;
  end: number;
}

function splitSentences(input: string): Sentence[] {
  const result: Sentence[] = [];
  // Match a run of non-terminator chars + the terminator (or end of string).
  const regex = /[^.!?…]+[.!?…]+|\S[^.!?…]*$/g;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(input)) !== null) {
    const raw = match[0];
    const trimmedStart = match.index + (raw.length - raw.trimStart().length);
    const text = raw.trim();
    if (!text) continue;
    result.push({
      text,
      start: trimmedStart,
      end: trimmedStart + text.length,
    });
  }
  if (result.length === 0 && input.trim()) {
    const t = input.trim();
    const start = input.indexOf(t);
    result.push({ text: t, start, end: start + t.length });
  }
  return result;
}

const SpeakableText = ({
  text,
  hint,
  lang,
  className = "",
  textClassName = "",
}: SpeakableTextProps) => {
  const [state, setState] = useState<SpeechState>("idle");
  const [supported, setSupported] = useState(true);
  const [activeIndex, setActiveIndex] = useState<number>(-1);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const fullText = hint ? `${text}. ${hint}` : text;
  const sentences = splitSentences(fullText);

  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      setSupported(false);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (utteranceRef.current && typeof window !== "undefined" && "speechSynthesis" in window) {
        try {
          window.speechSynthesis.cancel();
        } catch {
          /* noop */
        }
      }
    };
  }, []);

  const handlePlay = async () => {
    if (!supported) return;
    const synth = window.speechSynthesis;
    synth.cancel();

    const u = new SpeechSynthesisUtterance(fullText);
    u.lang = lang;

    const voices = await loadVoices();
    const voice = resolveVoice(voices, lang.split("-")[0] || "fr");
    if (voice) u.voice = voice;
    u.rate = RATE_VALUES[getSpeechRate()];
    u.pitch = 1;

    u.onstart = () => setActiveIndex(sentences.length > 0 ? 0 : -1);
    u.onboundary = (event) => {
      // Use charIndex to find the sentence the cursor is currently in.
      const idx = sentences.findIndex(
        (s) => event.charIndex >= s.start && event.charIndex < s.end,
      );
      if (idx >= 0) setActiveIndex(idx);
    };
    u.onend = () => {
      setState("idle");
      setActiveIndex(-1);
    };
    u.onerror = () => {
      setState("idle");
      setActiveIndex(-1);
    };

    utteranceRef.current = u;
    synth.speak(u);
    setState("speaking");
  };

  const handlePause = () => {
    window.speechSynthesis.pause();
    setState("paused");
  };

  const handleResume = () => {
    window.speechSynthesis.resume();
    setState("speaking");
  };

  const handleStop = () => {
    window.speechSynthesis.cancel();
    setState("idle");
    setActiveIndex(-1);
  };

  const baseBtn =
    "flex h-7 w-7 items-center justify-center rounded-full border transition-colors";

  return (
    <div className={className}>
      <p className={textClassName}>
        {sentences.length === 0
          ? fullText
          : sentences.map((s, i) => {
              const isActive = i === activeIndex;
              return (
                <span
                  key={`${s.start}-${i}`}
                  className={
                    isActive
                      ? "rounded-md bg-primary/15 px-1 text-foreground transition-colors"
                      : "transition-colors"
                  }
                >
                  {s.text}
                  {i < sentences.length - 1 ? " " : ""}
                </span>
              );
            })}
      </p>

      {supported && (
        <div className="mt-2 flex items-center gap-1">
          {state === "idle" ? (
            <button
              type="button"
              onClick={handlePlay}
              aria-label="Lire à voix haute"
              title="Guidage audio"
              className={`${baseBtn} border-border bg-background text-muted-foreground hover:bg-muted`}
            >
              <Volume2 className="h-3.5 w-3.5" />
            </button>
          ) : (
            <>
              {state === "speaking" ? (
                <button
                  type="button"
                  onClick={handlePause}
                  aria-label="Mettre en pause"
                  title="Pause"
                  className={`${baseBtn} border-primary bg-primary text-primary-foreground`}
                >
                  <Pause className="h-3.5 w-3.5" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleResume}
                  aria-label="Reprendre la lecture"
                  title="Reprendre"
                  className={`${baseBtn} border-primary bg-primary text-primary-foreground`}
                >
                  <Play className="h-3.5 w-3.5" />
                </button>
              )}
              <button
                type="button"
                onClick={handlePlay}
                aria-label="Répéter depuis le début"
                title="Répéter"
                className={`${baseBtn} border-border bg-background text-muted-foreground hover:bg-muted`}
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={handleStop}
                aria-label="Arrêter la lecture"
                title="Arrêter"
                className={`${baseBtn} border-border bg-background text-muted-foreground hover:bg-muted`}
              >
                <Square className="h-3.5 w-3.5" />
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default SpeakableText;
