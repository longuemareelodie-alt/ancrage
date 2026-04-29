import { useEffect, useState } from "react";
import { Volume2, Gauge, Languages, Music2, Pause as PauseIcon, Wind, Eye, AlertTriangle, Crosshair } from "lucide-react";
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
  getFocusFollow,
  setFocusFollow,
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

type VoiceMatch = "exact" | "fallback" | "none";

const SpeechPrefs = ({ className = "" }: SpeechPrefsProps) => {
  const [exactVoices, setExactVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [fallbackVoices, setFallbackVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [match, setMatch] = useState<VoiceMatch>("exact");
  const initialLang = getSpeechLang();
  const [voiceURI, setVoiceURI] = useState<string | null>(() => getSpeechVoiceURI(initialLang));
  const [rate, setRate] = useState<SpeechRate>(() => getSpeechRate());
  const [lang, setLang] = useState<SpeechLang>(() => initialLang);
  const [supported, setSupported] = useState(true);
  const [sentencePause, setSentencePauseState] = useState<number>(() => getSentencePauseMs());
  const [commaPause, setCommaPauseState] = useState<number>(() => getCommaPauseMs());
  const [pitch, setPitchState] = useState<number>(() => getSpeechPitch());
  const [slowKw, setSlowKwState] = useState<boolean>(() => getSlowKeywords());
  const [silentMode, setSilentModeState] = useState<boolean>(() => getSilentMode());
  const [focusFollow, setFocusFollowState] = useState<boolean>(() => getFocusFollow());

  // Combined list (used by handleVoiceChange to find an actual voice).
  const voices = [...exactVoices, ...fallbackVoices];

  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      setSupported(false);
      return;
    }
    let cancelled = false;
    loadVoices().then((all) => {
      if (cancelled) return;
      const lower = lang.toLowerCase();
      const primary = lower.split("-")[0];
      const exact = all.filter((v) => v.lang.toLowerCase() === lower);
      const sameLang = all.filter(
        (v) => v.lang.toLowerCase() !== lower && v.lang.toLowerCase().startsWith(primary),
      );
      setExactVoices(exact);
      setFallbackVoices(sameLang);
      if (exact.length > 0) setMatch("exact");
      else if (sameLang.length > 0) setMatch("fallback");
      else setMatch("none");
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
    // Load all per-language preferences for the newly selected language.
    setRate(getSpeechRate(l));
    setPitchState(getSpeechPitch(l));
    setSentencePauseState(getSentencePauseMs(l));
    setCommaPauseState(getCommaPauseMs(l));
    setSlowKwState(getSlowKeywords(l));
    setSilentModeState(getSilentMode(l));
    setFocusFollowState(getFocusFollow(l));
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
    setSpeechRate(r, lang);
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

        {match === "fallback" && (
          <div className="mb-2 flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 p-2 text-xs text-amber-900 dark:text-amber-200">
            <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <p>
              Aucune voix exacte pour <strong>{LANG_LABELS[lang]}</strong> sur cet appareil.
              Choisis une voix de secours dans la même langue ci-dessous.
            </p>
          </div>
        )}
        {match === "none" && (
          <div className="mb-2 flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-2 text-xs text-destructive">
            <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <p>
              Aucune voix disponible pour <strong>{LANG_LABELS[lang]}</strong> sur cet appareil.
              La synthèse utilisera la voix système par défaut.
            </p>
          </div>
        )}

        <select
          value={voiceURI ?? "__default__"}
          onChange={(e) => handleVoiceChange(e.target.value)}
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
        >
          <option value="__default__">
            {match === "exact"
              ? `Voix par défaut (${lang})`
              : match === "fallback"
                ? `Voix par défaut du système (${lang} indisponible)`
                : `Voix par défaut du système`}
          </option>

          {exactVoices.length > 0 && (
            <optgroup label={`Voix exactes — ${LANG_LABELS[lang]}`}>
              {exactVoices.map((v) => (
                <option key={v.voiceURI} value={v.voiceURI}>
                  {v.name} ({v.lang})
                </option>
              ))}
            </optgroup>
          )}

          {fallbackVoices.length > 0 && (
            <optgroup label={`Voix de secours — même langue (${lang.split("-")[0]}-*)`}>
              {fallbackVoices.map((v) => (
                <option key={v.voiceURI} value={v.voiceURI}>
                  {v.name} ({v.lang})
                </option>
              ))}
            </optgroup>
          )}
        </select>
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          <span className="flex items-center gap-2">
            <Gauge className="h-3.5 w-3.5" />
            Vitesse de lecture
          </span>
          <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] normal-case tracking-normal text-muted-foreground">
            {LANG_LABELS[lang]}
          </span>
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
          <span className="flex items-center gap-2 normal-case tracking-normal">
            <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">
              {LANG_LABELS[lang]}
            </span>
            <span className="font-mono text-foreground">{pitch.toFixed(2)}</span>
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
            setSpeechPitch(next, lang);
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
          <span className="flex items-center gap-2 normal-case tracking-normal">
            <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">
              {LANG_LABELS[lang]}
            </span>
            <span className="font-mono text-foreground">{(sentencePause / 1000).toFixed(2)} s</span>
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
            setSentencePauseMs(next, lang);
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
          <span className="flex items-center gap-2 normal-case tracking-normal">
            <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">
              {LANG_LABELS[lang]}
            </span>
            <span className="font-mono text-foreground">{(commaPause / 1000).toFixed(2)} s</span>
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
            setCommaPauseMs(next, lang);
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
            setSlowKeywords(c, lang);
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
            setSilentMode(c, lang);
          }}
          aria-label="Activer la surbrillance silencieuse"
        />
      </div>

      {/* Suivi du focus clavier */}
      <div className="flex items-start justify-between gap-3 rounded-xl bg-muted/40 p-3">
        <div className="flex items-start gap-2">
          <Crosshair className="mt-0.5 h-4 w-4 text-primary" />
          <div>
            <p className="text-sm font-semibold">Suivre la phrase au clavier</p>
            <p className="text-xs text-muted-foreground">
              Le focus clavier se déplace sur la phrase en cours pendant la lecture
              (utile pour suivre le texte avec un lecteur d'écran ou une loupe).
            </p>
          </div>
        </div>
        <Switch
          checked={focusFollow}
          onCheckedChange={(c) => {
            setFocusFollowState(c);
            setFocusFollow(c, lang);
          }}
          aria-label="Suivre la phrase active avec le focus clavier"
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
