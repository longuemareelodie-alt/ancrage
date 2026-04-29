export type SpeechRate = "slow" | "normal" | "fast";

const VOICE_KEY = "calm_speech_voice";
const RATE_KEY = "calm_speech_rate";

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

export function resolveVoice(voices: SpeechSynthesisVoice[], lang = "fr"): SpeechSynthesisVoice | null {
  const stored = getSpeechVoiceURI();
  if (stored) {
    const found = voices.find((v) => v.voiceURI === stored);
    if (found) return found;
  }
  // Default: first voice matching the requested language.
  return voices.find((v) => v.lang.toLowerCase().startsWith(lang.toLowerCase())) ?? null;
}
