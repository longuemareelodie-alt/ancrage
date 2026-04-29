import { splitSentencesText } from "./sentenceSplit";

export type SpeechRate = "slow" | "normal" | "fast";
export type SpeechLang = "fr-FR" | "fr-CA" | "en-US";

const VOICE_KEY = "calm_speech_voice";
const RATE_KEY = "calm_speech_rate"; // legacy global rate (migrated per-lang)
const LANG_KEY = "calm_speech_lang";
// Legacy global keys (kept as fallback during migration to per-lang values).
const SENTENCE_PAUSE_KEY = "calm_speech_sentence_pause";
const COMMA_PAUSE_KEY = "calm_speech_comma_pause";
const PITCH_KEY = "calm_speech_pitch";
const SLOW_KEYWORDS_KEY = "calm_speech_slow_keywords";
const SILENT_MODE_KEY = "calm_speech_silent_mode";
const FOCUS_FOLLOW_KEY = "calm_speech_focus_follow";

// Per-language storage keys.
const rateKeyFor = (lang: SpeechLang) => `calm_speech_rate__${lang}`;
const pitchKeyFor = (lang: SpeechLang) => `calm_speech_pitch__${lang}`;
const sentencePauseKeyFor = (lang: SpeechLang) => `calm_speech_sentence_pause__${lang}`;
const commaPauseKeyFor = (lang: SpeechLang) => `calm_speech_comma_pause__${lang}`;
const slowKeywordsKeyFor = (lang: SpeechLang) => `calm_speech_slow_keywords__${lang}`;
const silentModeKeyFor = (lang: SpeechLang) => `calm_speech_silent_mode__${lang}`;
const focusFollowKeyFor = (lang: SpeechLang) => `calm_speech_focus_follow__${lang}`;

export const SENTENCE_PAUSE_DEFAULT = 400; // ms
export const COMMA_PAUSE_DEFAULT = 150; // ms
export const PITCH_DEFAULT = 1; // 0.5..1.5
export const SLOW_KEYWORDS_DEFAULT = true;
export const SILENT_MODE_DEFAULT = false;
export const FOCUS_FOLLOW_DEFAULT = false;

/** Mots-clés de respiration ralentis automatiquement (rate * 0.7). */
export const BREATH_KEYWORDS = [
  "inspire", "inspires", "inspirer", "inspiration",
  "expire", "expires", "expirer", "expiration",
  "retiens", "retenir", "souffle", "respire", "respires",
  "ancre", "ancrer", "détends", "détendre",
  "breathe", "inhale", "exhale", "hold",
];

export const LANG_LABELS: Record<SpeechLang, string> = {
  "fr-FR": "Français (France)",
  "fr-CA": "Français (Canada)",
  "en-US": "English (US)",
};

export const LANG_OPTIONS: SpeechLang[] = ["fr-FR", "fr-CA", "en-US"];

/** Normalize an arbitrary BCP-47 tag onto a supported SpeechLang. */
export function normalizeSpeechLang(lang: string | undefined | null): SpeechLang {
  if (!lang) return getSpeechLang();
  const lower = lang.toLowerCase();
  if (lower === "fr-fr") return "fr-FR";
  if (lower === "fr-ca") return "fr-CA";
  if (lower === "en-us") return "en-US";
  if (lower.startsWith("fr")) return "fr-FR";
  if (lower.startsWith("en")) return "en-US";
  return getSpeechLang();
}

export function getSpeechLang(): SpeechLang {
  if (typeof window === "undefined") return "fr-FR";
  const v = localStorage.getItem(LANG_KEY);
  if (v === "fr-FR" || v === "fr-CA" || v === "en-US") return v;
  return "fr-FR";
}

export function setSpeechLang(lang: SpeechLang) {
  if (typeof window === "undefined") return;
  localStorage.setItem(LANG_KEY, lang);
  // Reset voice — saved voice may not match the new language.
  localStorage.removeItem(VOICE_KEY);
  window.dispatchEvent(new CustomEvent("calm-speech-prefs-change"));
}

export const RATE_VALUES: Record<SpeechRate, number> = {
  slow: 0.75,
  normal: 0.95,
  fast: 1.2,
};

export const RATE_LABELS: Record<SpeechRate, string> = {
  slow: "Ralenti",
  normal: "Normal",
  fast: "Rapide",
};

export function getSpeechRate(lang?: SpeechLang | string): SpeechRate {
  if (typeof window === "undefined") return "normal";
  const target = lang ? normalizeSpeechLang(lang) : getSpeechLang();
  const perLang = localStorage.getItem(rateKeyFor(target));
  if (perLang === "slow" || perLang === "normal" || perLang === "fast") return perLang;
  // Fallback to legacy global value (migrated lazily on next set).
  const legacy = localStorage.getItem(RATE_KEY);
  if (legacy === "slow" || legacy === "normal" || legacy === "fast") return legacy;
  return "normal";
}

export function setSpeechRate(rate: SpeechRate, lang?: SpeechLang | string) {
  if (typeof window === "undefined") return;
  const target = lang ? normalizeSpeechLang(lang) : getSpeechLang();
  localStorage.setItem(rateKeyFor(target), rate);
  window.dispatchEvent(new CustomEvent("calm-speech-prefs-change"));
}

export function getSpeechVoiceURI(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(VOICE_KEY);
}

export function setSpeechVoiceURI(uri: string | null) {
  if (typeof window === "undefined") return;
  if (uri) localStorage.setItem(VOICE_KEY, uri);
  else localStorage.removeItem(VOICE_KEY);
  window.dispatchEvent(new CustomEvent("calm-speech-prefs-change"));
}

/** Load available voices, handling the async voiceschanged event. */
export function loadVoices(): Promise<SpeechSynthesisVoice[]> {
  return new Promise((resolve) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      resolve([]);
      return;
    }
    const synth = window.speechSynthesis;
    const existing = synth.getVoices();
    if (existing.length > 0) {
      resolve(existing);
      return;
    }
    const handler = () => {
      synth.removeEventListener("voiceschanged", handler);
      resolve(synth.getVoices());
    };
    synth.addEventListener("voiceschanged", handler);
    // Fallback in case the event never fires.
    setTimeout(() => resolve(synth.getVoices()), 1000);
  });
}

export function resolveVoice(voices: SpeechSynthesisVoice[], lang = "fr-FR"): SpeechSynthesisVoice | null {
  const stored = getSpeechVoiceURI();
  if (stored) {
    const found = voices.find((v) => v.voiceURI === stored);
    if (found) return found;
  }
  const lower = lang.toLowerCase();
  // 1. Exact locale match (e.g. fr-CA).
  const exact = voices.find((v) => v.lang.toLowerCase() === lower);
  if (exact) return exact;
  // 2. Same primary language (e.g. fr-* when fr-CA not available).
  const primary = lower.split("-")[0];
  return voices.find((v) => v.lang.toLowerCase().startsWith(primary)) ?? null;
}

// ---------- Énonciation ----------

function readNumber(key: string, fallback: number, min: number, max: number): number {
  if (typeof window === "undefined") return fallback;
  const raw = localStorage.getItem(key);
  if (raw === null) return fallback;
  const n = Number(raw);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, n));
}

function readBoolPerLang(
  perLangKey: string,
  legacyKey: string,
  fallback: boolean,
): boolean {
  if (typeof window === "undefined") return fallback;
  const v = localStorage.getItem(perLangKey);
  if (v === "1") return true;
  if (v === "0") return false;
  const legacy = localStorage.getItem(legacyKey);
  if (legacy === "1") return true;
  if (legacy === "0") return false;
  return fallback;
}

export function getSentencePauseMs(lang?: SpeechLang | string): number {
  const target = lang ? normalizeSpeechLang(lang) : getSpeechLang();
  const perLang = readNumber(sentencePauseKeyFor(target), Number.NaN, 0, 1500);
  if (Number.isFinite(perLang)) return perLang;
  return readNumber(SENTENCE_PAUSE_KEY, SENTENCE_PAUSE_DEFAULT, 0, 1500);
}
export function setSentencePauseMs(ms: number, lang?: SpeechLang | string) {
  if (typeof window === "undefined") return;
  const target = lang ? normalizeSpeechLang(lang) : getSpeechLang();
  localStorage.setItem(sentencePauseKeyFor(target), String(Math.round(ms)));
  window.dispatchEvent(new CustomEvent("calm-speech-prefs-change"));
}

export function getCommaPauseMs(lang?: SpeechLang | string): number {
  const target = lang ? normalizeSpeechLang(lang) : getSpeechLang();
  const perLang = readNumber(commaPauseKeyFor(target), Number.NaN, 0, 800);
  if (Number.isFinite(perLang)) return perLang;
  return readNumber(COMMA_PAUSE_KEY, COMMA_PAUSE_DEFAULT, 0, 800);
}
export function setCommaPauseMs(ms: number, lang?: SpeechLang | string) {
  if (typeof window === "undefined") return;
  const target = lang ? normalizeSpeechLang(lang) : getSpeechLang();
  localStorage.setItem(commaPauseKeyFor(target), String(Math.round(ms)));
  window.dispatchEvent(new CustomEvent("calm-speech-prefs-change"));
}

export function getSpeechPitch(lang?: SpeechLang | string): number {
  if (typeof window === "undefined") return PITCH_DEFAULT;
  const target = lang ? normalizeSpeechLang(lang) : getSpeechLang();
  const perLang = readNumber(pitchKeyFor(target), Number.NaN, 0.5, 1.5);
  if (Number.isFinite(perLang)) return perLang;
  // Fallback to legacy global pitch.
  return readNumber(PITCH_KEY, PITCH_DEFAULT, 0.5, 1.5);
}
export function setSpeechPitch(pitch: number, lang?: SpeechLang | string) {
  if (typeof window === "undefined") return;
  const target = lang ? normalizeSpeechLang(lang) : getSpeechLang();
  localStorage.setItem(pitchKeyFor(target), pitch.toFixed(2));
  window.dispatchEvent(new CustomEvent("calm-speech-prefs-change"));
}

export function getSlowKeywords(): boolean {
  if (typeof window === "undefined") return SLOW_KEYWORDS_DEFAULT;
  const v = localStorage.getItem(SLOW_KEYWORDS_KEY);
  if (v === null) return SLOW_KEYWORDS_DEFAULT;
  return v === "1";
}
export function setSlowKeywords(enabled: boolean) {
  if (typeof window === "undefined") return;
  localStorage.setItem(SLOW_KEYWORDS_KEY, enabled ? "1" : "0");
  window.dispatchEvent(new CustomEvent("calm-speech-prefs-change"));
}

export function getSilentMode(): boolean {
  if (typeof window === "undefined") return SILENT_MODE_DEFAULT;
  const v = localStorage.getItem(SILENT_MODE_KEY);
  if (v === null) return SILENT_MODE_DEFAULT;
  return v === "1";
}
export function setSilentMode(enabled: boolean) {
  if (typeof window === "undefined") return;
  localStorage.setItem(SILENT_MODE_KEY, enabled ? "1" : "0");
  window.dispatchEvent(new CustomEvent("calm-speech-prefs-change"));
}

export function getFocusFollow(): boolean {
  if (typeof window === "undefined") return FOCUS_FOLLOW_DEFAULT;
  const v = localStorage.getItem(FOCUS_FOLLOW_KEY);
  if (v === null) return FOCUS_FOLLOW_DEFAULT;
  return v === "1";
}
export function setFocusFollow(enabled: boolean) {
  if (typeof window === "undefined") return;
  localStorage.setItem(FOCUS_FOLLOW_KEY, enabled ? "1" : "0");
  window.dispatchEvent(new CustomEvent("calm-speech-prefs-change"));
}

/**
 * Découpe un texte en segments destinés à être prononcés séquentiellement,
 * en insérant des pauses (silences) et en ralentissant les mots-clés respiration.
 *
 * Chaque segment est soit:
 *  - { text, rate } : à parler avec ce taux de lecture
 *  - { pauseMs }    : silence (pause artificielle entre énoncés)
 */
export interface UtteranceSegment {
  text?: string;
  rateMultiplier?: number; // multiplied with base rate
  pauseMs?: number;
}

export function buildUtteranceSegments(
  fullText: string,
  opts?: {
    sentencePauseMs?: number;
    commaPauseMs?: number;
    slowKeywords?: boolean;
    keywordRateMultiplier?: number;
  },
): UtteranceSegment[] {
  const sentencePause = opts?.sentencePauseMs ?? getSentencePauseMs();
  const commaPause = opts?.commaPauseMs ?? getCommaPauseMs();
  const slowKeywords = opts?.slowKeywords ?? getSlowKeywords();
  const kwMul = opts?.keywordRateMultiplier ?? 0.7;

  // 1. Sentence split — FR-aware (handles abbreviations, decimals, etc.).
  const sentences = splitSentencesText(fullText);
  if (sentences.length === 0 && fullText.trim()) sentences.push(fullText.trim());

  const out: UtteranceSegment[] = [];

  sentences.forEach((sentence, sIdx) => {
    // 2. Comma split inside each sentence.
    const parts = commaPause > 0 ? sentence.split(/,\s*/) : [sentence];
    parts.forEach((part, pIdx) => {
      if (!part.trim()) return;

      if (slowKeywords) {
        // Word-level split, slowing down keyword runs.
        const words = part.match(/\S+|\s+/g) ?? [part];
        let buf = "";
        let bufIsKw = false;
        const flush = () => {
          if (!buf.trim()) {
            buf = "";
            return;
          }
          out.push({
            text: buf.trim(),
            rateMultiplier: bufIsKw ? kwMul : 1,
          });
          buf = "";
        };
        for (const w of words) {
          const norm = w
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[^a-z]/g, "");
          const isKw = norm.length > 0 && BREATH_KEYWORDS.some((kw) => kw.replace(/[^a-z]/g, "") === norm);
          if (isKw !== bufIsKw && buf.trim()) flush();
          bufIsKw = isKw || bufIsKw && !w.trim() ? bufIsKw : isKw;
          buf += w;
        }
        flush();
      } else {
        out.push({ text: part.trim(), rateMultiplier: 1 });
      }

      // Comma pause between parts (not after last part of sentence).
      if (pIdx < parts.length - 1 && commaPause > 0) {
        out.push({ pauseMs: commaPause });
      }
    });

    // Sentence pause between sentences.
    if (sIdx < sentences.length - 1 && sentencePause > 0) {
      out.push({ pauseMs: sentencePause });
    }
  });

  return out;
}
