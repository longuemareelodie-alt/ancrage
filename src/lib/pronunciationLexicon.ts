/**
 * User-defined pronunciation lexicon.
 *
 * Each entry tells the TTS engine: when you encounter `word`, speak it
 * as `replacement` instead. The displayed text is never altered — only
 * the string passed to the speech synthesizer is.
 *
 * Two modes:
 *  - "phonetic": replacement is read as-is (e.g. "Hugo" → "Ugo").
 *  - "spell":    replacement is split letter-by-letter, separated by
 *                spaces and dots so the TTS spells it out
 *                (e.g. "SNCF" → "S. N. C. F.").
 */

export type PronunciationMode = "phonetic" | "spell";

export interface PronunciationEntry {
  id: string;
  word: string;
  replacement: string;
  mode: PronunciationMode;
  caseSensitive: boolean;
  wholeWord: boolean;
}

const STORAGE_KEY = "calm_pronunciation_lexicon_v1";
const CHANGE_EVENT = "calm-pronunciation-lexicon-change";

import { getSpeechLang, normalizeSpeechLang, type SpeechLang } from "./speechPrefs";

const lexiconKeyFor = (lang: SpeechLang) => `${STORAGE_KEY}__${lang}`;

function readEntries(key: string): PronunciationEntry[] {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isValidEntry);
  } catch {
    return [];
  }
}

export function getLexicon(lang?: SpeechLang | string): PronunciationEntry[] {
  if (typeof window === "undefined") return [];
  const target = lang ? normalizeSpeechLang(lang) : getSpeechLang();
  const perLang = readEntries(lexiconKeyFor(target));
  if (perLang.length > 0) return perLang;
  // Fallback: migrate legacy global lexicon (only used until first per-lang save).
  const legacyRaw = localStorage.getItem(lexiconKeyFor(target));
  if (legacyRaw !== null) return perLang; // explicit empty per-lang
  return readEntries(STORAGE_KEY);
}

export function setLexicon(entries: PronunciationEntry[], lang?: SpeechLang | string) {
  if (typeof window === "undefined") return;
  const target = lang ? normalizeSpeechLang(lang) : getSpeechLang();
  localStorage.setItem(lexiconKeyFor(target), JSON.stringify(entries));
  window.dispatchEvent(new CustomEvent(CHANGE_EVENT));
}

export function upsertEntry(entry: PronunciationEntry, lang?: SpeechLang | string) {
  const all = getLexicon(lang);
  const idx = all.findIndex((e) => e.id === entry.id);
  if (idx === -1) all.push(entry);
  else all[idx] = entry;
  setLexicon(all, lang);
}

export function removeEntry(id: string, lang?: SpeechLang | string) {
  setLexicon(getLexicon(lang).filter((e) => e.id !== id), lang);
}

export function newEntry(): PronunciationEntry {
  return {
    id: cryptoRandomId(),
    word: "",
    replacement: "",
    mode: "phonetic",
    caseSensitive: false,
    wholeWord: true,
  };
}

function isValidEntry(v: unknown): v is PronunciationEntry {
  if (!v || typeof v !== "object") return false;
  const e = v as Record<string, unknown>;
  return (
    typeof e.id === "string" &&
    typeof e.word === "string" &&
    typeof e.replacement === "string" &&
    (e.mode === "phonetic" || e.mode === "spell") &&
    typeof e.caseSensitive === "boolean" &&
    typeof e.wholeWord === "boolean"
  );
}

function cryptoRandomId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `lex_${Math.random().toString(36).slice(2)}_${Date.now().toString(36)}`;
}

/** Escape a string so it can be safely embedded in a RegExp. */
function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Convert a replacement to its spell-out form: "SNCF" → "S. N. C. F.".
 * Spaces in the replacement are preserved as longer pauses.
 */
function spellOut(replacement: string): string {
  return replacement
    .split(/\s+/)
    .map((word) =>
      Array.from(word)
        .map((ch) => ch.toUpperCase())
        .join(". "),
    )
    .filter(Boolean)
    .join(", ") + (replacement ? "." : "");
}

/**
 * Apply all lexicon entries to a text string. Returns the text that
 * should be sent to the speech synthesizer.
 */
export function applyLexicon(
  text: string,
  entries: PronunciationEntry[] = getLexicon(),
): string {
  if (!text || entries.length === 0) return text;
  let out = text;
  // Apply longer source words first so "Saint-Étienne" wins over "Saint".
  const sorted = [...entries].sort((a, b) => b.word.length - a.word.length);
  for (const entry of sorted) {
    const word = entry.word.trim();
    if (!word) continue;
    const replacement =
      entry.mode === "spell" ? spellOut(entry.replacement.trim() || word) : entry.replacement;
    if (replacement === word && entry.mode === "phonetic") continue;

    const flags = entry.caseSensitive ? "g" : "gi";
    // Use Unicode-aware word boundaries: lookarounds for non-letter chars
    // (covers accented characters which \b treats as word breaks in JS).
    const escaped = escapeRegExp(word);
    const pattern = entry.wholeWord
      ? new RegExp(`(?<![\\p{L}\\p{N}])${escaped}(?![\\p{L}\\p{N}])`, flags + "u")
      : new RegExp(escaped, flags);
    try {
      out = out.replace(pattern, replacement);
    } catch {
      // Fallback if Unicode property escapes unsupported.
      const fallback = entry.wholeWord
        ? new RegExp(`\\b${escaped}\\b`, flags)
        : new RegExp(escaped, flags);
      out = out.replace(fallback, replacement);
    }
  }
  return out;
}

/** Subscribe to lexicon changes (returns an unsubscribe function). */
export function onLexiconChange(cb: () => void): () => void {
  if (typeof window === "undefined") return () => undefined;
  const handler = () => cb();
  window.addEventListener(CHANGE_EVENT, handler);
  return () => window.removeEventListener(CHANGE_EVENT, handler);
}
