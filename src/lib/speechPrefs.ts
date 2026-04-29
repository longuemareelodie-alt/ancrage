export type SpeechRate = "slow" | "normal" | "fast";
export type SpeechLang = "fr-FR" | "fr-CA" | "en-US";

const VOICE_KEY = "calm_speech_voice";
const RATE_KEY = "calm_speech_rate";
const LANG_KEY = "calm_speech_lang";

export const LANG_LABELS: Record<SpeechLang, string> = {
  "fr-FR": "Français (France)",
  "fr-CA": "Français (Canada)",
  "en-US": "English (US)",
};

export const LANG_OPTIONS: SpeechLang[] = ["fr-FR", "fr-CA", "en-US"];

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

export function getSpeechRate(): SpeechRate {
  if (typeof window === "undefined") return "normal";
  const v = localStorage.getItem(RATE_KEY);
  if (v === "slow" || v === "normal" || v === "fast") return v;
  return "normal";
}

export function setSpeechRate(rate: SpeechRate) {
  if (typeof window === "undefined") return;
  localStorage.setItem(RATE_KEY, rate);
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
