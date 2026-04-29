import { useEffect, useState } from "react";
import { Volume2, Gauge, Languages, Music2, Pause as PauseIcon, Wind, Eye } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import {
  RATE_LABELS,
  type SpeechRate,
  type SpeechLang,
  LANG_LABELS,
  LANG_OPTIONS,
  getSpeechRate,
  setSpeechRate,
  getSpeechLang,
  setSpeechLang,
  getSpeechVoiceURI,
  setSpeechVoiceURI,
  loadVoices,
  getSentencePauseMs,
  setSentencePauseMs,
  getCommaPauseMs,
  setCommaPauseMs,
  getSpeechPitch,
  setSpeechPitch,
  getSlowKeywords,
  setSlowKeywords,
  getSilentMode,
  setSilentMode,
} from "@/lib/speechPrefs";

const RATE_OPTIONS: SpeechRate[] = ["slow", "normal", "fast"];

const PREVIEW_TEXT: Record<SpeechLang, string> = {
  "fr-FR": "Inspire profondément, retiens, puis expire lentement. Tu es ici, en sécurité.",
  "fr-CA": "Inspire profondément, retiens, puis expire lentement. Tu es ici, en sécurité.",
  "en-US": "Inhale slowly, hold, then exhale. You are here, safe.",
};

interface SpeechPrefsProps {
  className?: string;
}

const SpeechPrefs = ({ className = "" }: SpeechPrefsProps) => {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [voiceURI, setVoiceURI] = useState<string | null>(() => getSpeechVoiceURI());
  const [rate, setRate] = useState<SpeechRate>(() => getSpeechRate());
  const [lang, setLang] = useState<SpeechLang>(() => getSpeechLang());
  const [supported, setSupported] = useState(true);
  const [sentencePause, setSentencePauseState] = useState<number>(() => getSentencePauseMs());
  const [commaPause, setCommaPauseState] = useState<number>(() => getCommaPauseMs());
  const [pitch, setPitchState] = useState<number>(() => getSpeechPitch());
  const [slowKw, setSlowKwState] = useState<boolean>(() => getSlowKeywords());
  const [silentMode, setSilentModeState] = useState<boolean>(() => getSilentMode());

  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      setSupported(false);
      return;
    }
    let cancelled = false;
    loadVoices().then((all) => {
      if (cancelled) return;
      const lower = lang.toLowerCase();
      // Match exact locale first; fall back to primary language.
      const exact = all.filter((v) => v.lang.toLowerCase() === lower);
      if (exact.length > 0) {
        setVoices(exact);
        return;
      }
      const primary = lower.split("-")[0];
      const sameLang = all.filter((v) => v.lang.toLowerCase().startsWith(primary));
      setVoices(sameLang.length > 0 ? sameLang : all);
    });
    return () => {
      cancelled = true;
    };
  }, [lang]);

  if (!supported) {
    return (
      <div className={`rounded-xl border border-border bg-muted/40 p-3 text-xs text-muted-foreground ${className}`}>
        La synthèse vocale n'est pas disponible sur ce navigateur.
      </div>
    );
  }

  const handleLangChange = (l: SpeechLang) => {
    setLang(l);
    setSpeechLang(l);
    setVoiceURI(null); // store cleared by setSpeechLang
  };

  const handleVoiceChange = (uri: string) => {
    const next = uri === "__default__" ? null : uri;
    setVoiceURI(next);
    setSpeechVoiceURI(next);
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(PREVIEW_TEXT[lang]);
      u.lang = lang;
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

  const playPreview = async () => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    const { buildUtteranceSegments, RATE_VALUES } = await import("@/lib/speechPrefs");
    const synth = window.speechSynthesis;
    synth.cancel();
    const baseRate = RATE_VALUES[rate];
    const voice = voices.find((v) => v.voiceURI === voiceURI);
    const segs = buildUtteranceSegments(PREVIEW_TEXT[lang], {
      sentencePauseMs: sentencePause,
      commaPauseMs: commaPause,
      slowKeywords: slowKw,
    });
    let i = 0;
    const playNext = () => {
      if (i >= segs.length) return;
      const seg = segs[i++];
      if (seg.pauseMs && seg.pauseMs > 0) {
        window.setTimeout(playNext, seg.pauseMs);
        return;
      }
      const u = new SpeechSynthesisUtterance(seg.text ?? "");
      u.lang = lang;
      if (voice) u.voice = voice;
      u.rate = Math.max(0.1, Math.min(2, baseRate * (seg.rateMultiplier ?? 1)));
      u.pitch = pitch;
      u.onend = playNext;
      u.onerror = () => undefined;
      synth.speak(u);
    };
    playNext();
  };

  return (
    <div className={`space-y-3 rounded-2xl border border-border bg-card p-4 shadow-sm ${className}`}>
      <div>
        <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          <Languages className="h-3.5 w-3.5" />
          Langue
        </div>
        <div role="radiogroup" aria-label="Langue de lecture" className="flex flex-wrap gap-2">
          {LANG_OPTIONS.map((l) => {
            const active = lang === l;
            return (
              <button
                key={l}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => handleLangChange(l)}
                className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
                  active
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background text-muted-foreground hover:bg-muted"
                }`}
              >
                {LANG_LABELS[l]}
              </button>
            );
          })}
        </div>
      </div>

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
          <option value="__default__">Voix par défaut ({lang})</option>
          {voices.map((v) => (
            <option key={v.voiceURI} value={v.voiceURI}>
              {v.name} ({v.lang})
            </option>
          ))}
        </select>
        {voices.length === 0 && (
          <p className="mt-1 text-xs text-muted-foreground">
            Aucune voix détectée pour cette langue.
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

      {/* Hauteur de la voix (pitch) */}
      <div>
        <div className="mb-2 flex items-center justify-between gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          <span className="flex items-center gap-2">
            <Music2 className="h-3.5 w-3.5" />
            Hauteur de la voix
          </span>
          <span className="font-mono normal-case tracking-normal text-foreground">
            {pitch.toFixed(2)}
          </span>
        </div>
        <Slider
          value={[pitch]}
          min={0.5}
          max={1.5}
          step={0.05}
          onValueChange={(v) => {
            const next = v[0];
            setPitchState(next);
            setSpeechPitch(next);
          }}
          aria-label="Hauteur de la voix"
        />
        <div className="mt-1 flex justify-between text-[10px] text-muted-foreground">
          <span>Grave</span>
          <span>Aigu</span>
        </div>
      </div>

      {/* Pause entre phrases */}
      <div>
        <div className="mb-2 flex items-center justify-between gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          <span className="flex items-center gap-2">
            <PauseIcon className="h-3.5 w-3.5" />
            Pause entre phrases
          </span>
          <span className="font-mono normal-case tracking-normal text-foreground">
            {(sentencePause / 1000).toFixed(2)} s
          </span>
        </div>
        <Slider
          value={[sentencePause]}
          min={0}
          max={1500}
          step={50}
          onValueChange={(v) => {
            const next = v[0];
            setSentencePauseState(next);
            setSentencePauseMs(next);
          }}
          aria-label="Pause entre phrases"
        />
      </div>

      {/* Pause sur les virgules */}
      <div>
        <div className="mb-2 flex items-center justify-between gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          <span className="flex items-center gap-2">
            <PauseIcon className="h-3.5 w-3.5" />
            Pause sur les virgules
          </span>
          <span className="font-mono normal-case tracking-normal text-foreground">
            {(commaPause / 1000).toFixed(2)} s
          </span>
        </div>
        <Slider
          value={[commaPause]}
          min={0}
          max={800}
          step={25}
          onValueChange={(v) => {
            const next = v[0];
            setCommaPauseState(next);
            setCommaPauseMs(next);
          }}
          aria-label="Pause sur les virgules"
        />
      </div>

      {/* Ralentir mots-clés respiration */}
      <div className="flex items-start justify-between gap-3 rounded-xl bg-muted/40 p-3">
        <div className="flex items-start gap-2">
          <Wind className="mt-0.5 h-4 w-4 text-primary" />
          <div>
            <p className="text-sm font-semibold">Ralentir les mots de respiration</p>
            <p className="text-xs text-muted-foreground">
              « inspire », « expire », « retiens »… seront prononcés plus lentement.
            </p>
          </div>
        </div>
        <Switch
          checked={slowKw}
          onCheckedChange={(c) => {
            setSlowKwState(c);
            setSlowKeywords(c);
          }}
          aria-label="Ralentir les mots-clés de respiration"
        />
      </div>

      {/* Mode surbrillance silencieuse */}
      <div className="flex items-start justify-between gap-3 rounded-xl border border-primary/20 bg-primary/5 p-3">
        <div className="flex items-start gap-2">
          <Eye className="mt-0.5 h-4 w-4 text-primary" />
          <div>
            <p className="text-sm font-semibold">Surbrillance seule (sans audio)</p>
            <p className="text-xs text-muted-foreground">
              Quand tu appuies sur Lecture, la phrase en cours est mise en évidence
              au rythme de la voix, mais aucun son n'est joué.
            </p>
          </div>
        </div>
        <Switch
          checked={silentMode}
          onCheckedChange={(c) => {
            setSilentModeState(c);
            setSilentMode(c);
          }}
          aria-label="Activer la surbrillance silencieuse"
        />
      </div>

      {/* Tester */}
      <button
        type="button"
        onClick={playPreview}
        className="w-full rounded-full border border-primary bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        Tester ces réglages
      </button>
    </div>
  );
};

export default SpeechPrefs;
