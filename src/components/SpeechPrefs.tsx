import { useEffect, useState } from "react";
import { Volume2, Gauge } from "lucide-react";
import {
  RATE_LABELS,
  type SpeechRate,
  getSpeechRate,
  setSpeechRate,
  getSpeechVoiceURI,
  setSpeechVoiceURI,
  loadVoices,
} from "@/lib/speechPrefs";

const RATE_OPTIONS: SpeechRate[] = ["slow", "normal", "fast"];

interface SpeechPrefsProps {
  className?: string;
  /** Restrict the voice list to a language prefix (e.g. "fr"). */
  langFilter?: string;
}

const SpeechPrefs = ({ className = "", langFilter = "fr" }: SpeechPrefsProps) => {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [voiceURI, setVoiceURI] = useState<string | null>(() => getSpeechVoiceURI());
  const [rate, setRate] = useState<SpeechRate>(() => getSpeechRate());
  const [supported, setSupported] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      setSupported(false);
      return;
    }
    let cancelled = false;
    loadVoices().then((all) => {
      if (cancelled) return;
      const filtered = all.filter((v) =>
        v.lang.toLowerCase().startsWith(langFilter.toLowerCase()),
      );
      setVoices(filtered.length > 0 ? filtered : all);
    });
    return () => {
      cancelled = true;
    };
  }, [langFilter]);

  if (!supported) {
    return (
      <div className={`rounded-xl border border-border bg-muted/40 p-3 text-xs text-muted-foreground ${className}`}>
        La synthèse vocale n'est pas disponible sur ce navigateur.
      </div>
    );
  }

  const handleVoiceChange = (uri: string) => {
    const next = uri === "__default__" ? null : uri;
    setVoiceURI(next);
    setSpeechVoiceURI(next);
    // Preview
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance("Bonjour, voici un aperçu de ma voix.");
      const voice = voices.find((v) => v.voiceURI === next);
      if (voice) u.voice = voice;
      u.rate = rate === "slow" ? 0.75 : rate === "fast" ? 1.2 : 0.95;
      window.speechSynthesis.speak(u);
    }
  };

  const handleRateChange = (r: SpeechRate) => {
    setRate(r);
    setSpeechRate(r);
  };

  return (
    <div className={`space-y-3 rounded-2xl border border-border bg-card p-4 shadow-sm ${className}`}>
      <div>
        <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          <Volume2 className="h-3.5 w-3.5" />
          Voix
        </div>
        <select
          value={voiceURI ?? "__default__"}
          onChange={(e) => handleVoiceChange(e.target.value)}
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
        >
          <option value="__default__">Voix par défaut du navigateur</option>
          {voices.map((v) => (
            <option key={v.voiceURI} value={v.voiceURI}>
              {v.name} ({v.lang})
            </option>
          ))}
        </select>
        {voices.length === 0 && (
          <p className="mt-1 text-xs text-muted-foreground">
            Aucune voix détectée pour le moment.
          </p>
        )}
      </div>

      <div>
        <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          <Gauge className="h-3.5 w-3.5" />
          Vitesse de lecture
        </div>
        <div role="radiogroup" aria-label="Vitesse de lecture" className="flex gap-2">
          {RATE_OPTIONS.map((r) => {
            const active = rate === r;
            return (
              <button
                key={r}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => handleRateChange(r)}
                className={`flex-1 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
                  active
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background text-muted-foreground hover:bg-muted"
                }`}
              >
                {RATE_LABELS[r]}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default SpeechPrefs;
