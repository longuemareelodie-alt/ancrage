import { useEffect, useRef, useState } from "react";
import { Volume2, Pause, Play, Square, RotateCcw } from "lucide-react";
import {
  RATE_VALUES,
  getSpeechRate,
  getSpeechLang,
  getSpeechPitch,
  loadVoices,
  resolveVoice,
  buildUtteranceSegments,
} from "@/lib/speechPrefs";
import { applyLexicon } from "@/lib/pronunciationLexicon";

type SpeechState = "idle" | "speaking" | "paused";

interface SpeakButtonProps {
  text: string;
  lang?: string;
  className?: string;
}

/**
 * Bouton de guidage audio utilisant la synthèse vocale native du navigateur.
 * Permet de lire un texte, mettre en pause / reprendre, et arrêter.
 */
const SpeakButton = ({ text, lang, className = "" }: SpeakButtonProps) => {
  const [state, setState] = useState<SpeechState>("idle");
  const [supported, setSupported] = useState<boolean>(true);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const pauseTimerRef = useRef<number | null>(null);
  const playbackIdRef = useRef(0);

  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      setSupported(false);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (pauseTimerRef.current !== null) {
        window.clearTimeout(pauseTimerRef.current);
        pauseTimerRef.current = null;
      }
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        try {
          window.speechSynthesis.cancel();
        } catch {
          /* noop */
        }
      }
    };
  }, []);

  if (!supported) return null;

  const cancelAll = () => {
    if (pauseTimerRef.current !== null) {
      window.clearTimeout(pauseTimerRef.current);
      pauseTimerRef.current = null;
    }
    try {
      window.speechSynthesis.cancel();
    } catch {
      /* noop */
    }
  };

  const handlePlay = async () => {
    cancelAll();
    const playbackId = ++playbackIdRef.current;
    const synth = window.speechSynthesis;
    const effectiveLang = lang ?? getSpeechLang();

    const voices = await loadVoices();
    if (playbackId !== playbackIdRef.current) return;
    const voice = resolveVoice(voices, effectiveLang);
    const baseRate = RATE_VALUES[getSpeechRate(effectiveLang)];
    const pitch = getSpeechPitch(effectiveLang);

    const segments = buildUtteranceSegments(text);
    setState("speaking");

    let i = 0;
    const playNext = () => {
      if (playbackId !== playbackIdRef.current) return;
      if (i >= segments.length) {
        setState("idle");
        return;
      }
      const seg = segments[i++];
      if (seg.pauseMs && seg.pauseMs > 0) {
        pauseTimerRef.current = window.setTimeout(() => {
          if (playbackId !== playbackIdRef.current) return;
          playNext();
        }, seg.pauseMs);
        return;
      }
      const u = new SpeechSynthesisUtterance(applyLexicon(seg.text ?? ""));
      u.lang = effectiveLang;
      if (voice) u.voice = voice;
      u.rate = Math.max(0.1, Math.min(2, baseRate * (seg.rateMultiplier ?? 1)));
      u.pitch = pitch;
      u.onend = () => {
        if (playbackId !== playbackIdRef.current) return;
        playNext();
      };
      u.onerror = () => {
        if (playbackId !== playbackIdRef.current) return;
        setState("idle");
      };
      utteranceRef.current = u;
      synth.speak(u);
    };
    playNext();
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
    playbackIdRef.current++;
    cancelAll();
    setState("idle");
  };

  const baseBtn =
    "flex h-8 w-8 items-center justify-center rounded-full border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

  const stateAnnouncement =
    state === "speaking"
      ? "Lecture audio en cours."
      : state === "paused"
        ? "Lecture audio en pause."
        : "";

  if (state === "idle") {
    return (
      <>
        <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
          {stateAnnouncement}
        </div>
        <button
          type="button"
          onClick={handlePlay}
          aria-label="Lire à voix haute"
          aria-pressed={false}
          title="Guidage audio"
          className={`${baseBtn} border-border bg-background text-muted-foreground hover:bg-muted ${className}`}
        >
          <Volume2 className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      </>
    );
  }

  return (
    <div
      className={`flex shrink-0 items-center gap-1 ${className}`}
      role="group"
      aria-label="Contrôles du guidage audio"
    >
      <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
        {stateAnnouncement}
      </div>
      {state === "speaking" ? (
        <button
          type="button"
          onClick={handlePause}
          aria-label="Mettre la lecture en pause"
          aria-pressed={true}
          title="Pause"
          className={`${baseBtn} border-primary bg-primary text-primary-foreground`}
        >
          <Pause className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      ) : (
        <button
          type="button"
          onClick={handleResume}
          aria-label="Reprendre la lecture"
          aria-pressed={true}
          title="Reprendre"
          className={`${baseBtn} border-primary bg-primary text-primary-foreground`}
        >
          <Play className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      )}
      <button
        type="button"
        onClick={handlePlay}
        aria-label="Répéter la lecture depuis le début"
        title="Répéter"
        className="inline-flex h-8 items-center gap-1.5 rounded-full border border-border bg-background px-3 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
        <span>Répéter</span>
      </button>
      <button
        type="button"
        onClick={handleStop}
        aria-label="Arrêter la lecture audio"
        title="Arrêter"
        className={`${baseBtn} border-border bg-background text-muted-foreground hover:bg-muted`}
      >
        <Square className="h-3.5 w-3.5" aria-hidden="true" />
      </button>
    </div>
  );
};

export default SpeakButton;
