import { useEffect, useRef, useState } from "react";
import { Volume2, Pause, Play, Square } from "lucide-react";

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
const SpeakButton = ({ text, lang = "fr-FR", className = "" }: SpeakButtonProps) => {
  const [state, setState] = useState<SpeechState>("idle");
  const [supported, setSupported] = useState<boolean>(true);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      setSupported(false);
    }
  }, []);

  // Cleanup on unmount: stop any ongoing speech started by this button.
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

  if (!supported) return null;

  const handlePlay = () => {
    const synth = window.speechSynthesis;
    // Stop anything currently playing (including from another card).
    synth.cancel();

    const u = new SpeechSynthesisUtterance(text);
    u.lang = lang;
    u.rate = 0.95;
    u.pitch = 1;
    u.onend = () => setState("idle");
    u.onerror = () => setState("idle");

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
  };

  const baseBtn =
    "flex h-7 w-7 items-center justify-center rounded-full border transition-colors";

  if (state === "idle") {
    return (
      <button
        type="button"
        onClick={handlePlay}
        aria-label="Lire à voix haute"
        title="Guidage audio"
        className={`${baseBtn} border-border bg-background text-muted-foreground hover:bg-muted ${className}`}
      >
        <Volume2 className="h-3.5 w-3.5" />
      </button>
    );
  }

  return (
    <div className={`flex shrink-0 items-center gap-1 ${className}`}>
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
        onClick={handleStop}
        aria-label="Arrêter la lecture"
        title="Arrêter"
        className={`${baseBtn} border-border bg-background text-muted-foreground hover:bg-muted`}
      >
        <Square className="h-3.5 w-3.5" />
      </button>
    </div>
  );
};

export default SpeakButton;
