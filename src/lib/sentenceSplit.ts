// French-aware sentence splitter.
//
// Splits a string into sentences while preserving the index of each sentence
// in the original input. Handles:
//   - common French abbreviations (M., Mme, Dr, St., etc., cf., p.ex., env., …)
//   - decimal / thousands numbers ("3.14", "1.000", "12,5")
//   - acronyms made of single letters separated by dots ("S.O.S.", "U.S.A.")
//   - initials in compound names ("J.-P. Sartre")
//   - the French ellipsis (…) and ASCII triple-dot ("..."), exclamation /
//     question marks, and quote marks (» " ' ’ ”)
//   - successive punctuation ("?!", "!!!", "?…", "..!")
//   - French opening/closing guillemets « … » (don't break inside an open
//     quotation; include the closing » in the sentence)
//   - parentheses (…) and brackets […] (don't break inside an open group)
//   - skipping a split when the next char is lowercase / a digit (sentence
//     continuation), unless punctuation is ! ? … which always end a sentence
//
// Returned sentences are TRIMMED, with `start` / `end` referring to the
// trimmed slice within the original input.

export interface Sentence {
  text: string;
  start: number;
  end: number;
}

// Abbreviations that should never end a sentence even when followed by ".".
// Compared case-insensitively against the *last word* (without trailing dot).
const FR_ABBREVIATIONS: ReadonlySet<string> = new Set([
  // Civilités
  "m", "mm", "mme", "mmes", "mlle", "mlles", "mr", "mrs",
  "dr", "drs", "pr", "prs", "me", "mes",
  // Saints / lieux
  "st", "ste", "sts", "stes",
  // Locutions
  "etc", "cf", "ex", "env", "av", "apr", "ap", "vs", "ca",
  "art", "ch", "fig", "ill", "n", "no", "p", "pp", "vol",
  "tél", "tel", "fax", "ref", "réf", "éd", "ed",
  "sec", "min", "hab",
  // Heures / unités courantes
  "h", "kg", "km", "cm", "mm", "ml", "cl",
]);

// English abbreviations — used when the detected/specified language is EN,
// or as a fallback when language detection is uncertain.
const EN_ABBREVIATIONS: ReadonlySet<string> = new Set([
  // Titles
  "mr", "mrs", "ms", "mx", "dr", "prof", "sr", "jr", "st",
  "rev", "hon", "gen", "col", "capt", "lt", "sgt", "pvt",
  // Locutions
  "etc", "vs", "ie", "eg", "cf", "approx", "est", "no", "nos",
  "vol", "ch", "p", "pp", "fig", "ed", "eds", "ref", "min", "max",
  // Companies / org
  "inc", "co", "ltd", "llc", "corp", "plc",
  // Times / units
  "am", "pm", "a", "p", "kg", "lb", "oz", "ft", "in", "mi", "km",
  // Geo
  "us", "usa", "uk", "eu",
]);

// Closing punctuation that may follow a terminator (".", "!", "?", "…")
// and still belong to the same sentence boundary.
const CLOSING_CHARS = new Set(["\"", "'", "”", "’", "»", ")", "]"]);

function isLetter(ch: string): boolean {
  if (!ch) return false;
  // Match Unicode letters (incl. accented FR letters).
  return /\p{L}/u.test(ch);
}

function isDigit(ch: string): boolean {
  return ch >= "0" && ch <= "9";
}

function isUpperLetter(ch: string): boolean {
  return isLetter(ch) && ch === ch.toUpperCase() && ch !== ch.toLowerCase();
}

function lastWordBeforeDot(input: string, dotIndex: number): string {
  // Walk backwards collecting letters/digits.
  let i = dotIndex - 1;
  let out = "";
  while (i >= 0) {
    const ch = input[i];
    if (isLetter(ch) || isDigit(ch)) {
      out = ch + out;
      i--;
    } else {
      break;
    }
  }
  return out;
}

/**
 * Decide whether the terminator at `i` (one of . ! ? …) is a real sentence
 * boundary in the given context.
 */
function isSentenceBoundary(
  input: string,
  i: number,
  abbrevs: ReadonlySet<string>,
): boolean {
  const ch = input[i];

  // ! ? … always end a sentence (even in numbers / abbreviations).
  if (ch === "!" || ch === "?" || ch === "…") return true;

  // From here on: ch === "."
  const prev = input[i - 1] ?? "";
  const next = input[i + 1] ?? "";

  // Decimal / thousands separator: digit . digit  (e.g. 3.14, 1.000).
  if (isDigit(prev) && isDigit(next)) return false;

  // Known abbreviation (checked BEFORE the initials heuristic so that "M.",
  // "Mme.", "Dr." don't get split even when followed by an uppercase name).
  const word = lastWordBeforeDot(input, i).toLowerCase();
  if (word && abbrevs.has(word)) return false;

  // Single-letter acronym pattern: "S.O.S.", "U.S.A.", "J.-P.".
  // Trigger: previous char is a single uppercase letter AND the char before
  // it is start-of-string, whitespace, "." or "-".
  if (isUpperLetter(prev)) {
    const before = input[i - 2] ?? "";
    if (
      before === "" ||
      before === "." ||
      before === "-" ||
      /\s/.test(before)
    ) {
      // Looks like an initial. Continuation cases (NOT a boundary):
      //   "J.-P." → next is "-"
      //   "U.S.A" → next is uppercase letter directly (no space)
      //   "J. P." → next is whitespace then uppercase + "."
      if (next === "-") return false;
      if (isUpperLetter(next)) return false;
      if (next === "" ) return true;
      if (/\s/.test(next)) {
        // Peek the next non-whitespace char.
        let k = i + 1;
        while (k < input.length && /\s/.test(input[k])) k++;
        const nextChar = input[k] ?? "";
        const nextNext = input[k + 1] ?? "";
        if (isUpperLetter(nextChar) && nextNext === ".") return false;
        return true;
      }
      return false;
    }
  }

  // Otherwise, only a boundary if followed by EOS or whitespace + uppercase
  // letter / digit / opening quote.
  if (next === "") return true;
  if (!/\s/.test(next) && !CLOSING_CHARS.has(next)) {
    // "word.next" with no space — treat as not a boundary (e.g. "fichier.txt").
    return false;
  }

  // Skip closing chars (» " ' …) and whitespace, then peek.
  let k = i + 1;
  while (k < input.length && (CLOSING_CHARS.has(input[k]) || /\s/.test(input[k]))) {
    k++;
  }
  const peek = input[k] ?? "";
  if (peek === "") return true;
  // New sentence usually starts with an uppercase letter, a digit, an opening
  // quote/dash, or « (French opening guillemet).
  if (isUpperLetter(peek)) return true;
  if (isDigit(peek)) return true;
  if (peek === "«" || peek === "(" || peek === "[" || peek === "—" || peek === "–" || peek === "-" || peek === "\"" || peek === "“" || peek === "‘") return true;
  // Lowercase follow-up → sentence continues.
  return false;
}

function splitWithAbbrevs(
  input: string,
  abbrevs: ReadonlySet<string>,
): Sentence[] {
  const out: Sentence[] = [];
  if (!input) return out;

  // Track nesting so we don't break a sentence in the middle of a quotation
  // or a parenthetical aside.
  let openGuillemet = 0; // « ... »
  let openParen = 0; // ( ... )
  let openBracket = 0; // [ ... ]

  let sentenceStart = 0;
  let i = 0;
  while (i < input.length) {
    const ch = input[i];

    // Update nesting counters as we scan.
    if (ch === "«") openGuillemet++;
    else if (ch === "»") openGuillemet = Math.max(0, openGuillemet - 1);
    else if (ch === "(") openParen++;
    else if (ch === ")") openParen = Math.max(0, openParen - 1);
    else if (ch === "[") openBracket++;
    else if (ch === "]") openBracket = Math.max(0, openBracket - 1);

    if (ch === "." || ch === "!" || ch === "?" || ch === "…") {
      let end = i;
      while (
        end + 1 < input.length &&
        (input[end + 1] === "." ||
          input[end + 1] === "!" ||
          input[end + 1] === "?" ||
          input[end + 1] === "…")
      ) {
        end++;
      }

      const insideGroup =
        openGuillemet > 0 || openParen > 0 || openBracket > 0;

      if (!insideGroup && isSentenceBoundary(input, end, abbrevs)) {
        let stop = end + 1;
        while (stop < input.length && CLOSING_CHARS.has(input[stop])) {
          const c = input[stop];
          if (c === "»") openGuillemet = Math.max(0, openGuillemet - 1);
          else if (c === ")") openParen = Math.max(0, openParen - 1);
          else if (c === "]") openBracket = Math.max(0, openBracket - 1);
          stop++;
        }
        const rawStart = sentenceStart;
        const rawEnd = stop;
        const slice = input.slice(rawStart, rawEnd);
        const leading = slice.length - slice.trimStart().length;
        const trailing = slice.length - slice.trimEnd().length;
        const trimmed = slice.trim();
        if (trimmed) {
          const isPunctOnly = /^[.!?…\s"'”’»\)\]]+$/.test(trimmed);
          if (isPunctOnly && out.length > 0) {
            const prev = out[out.length - 1];
            prev.text = (prev.text + trimmed).replace(/\s+/g, " ").trim();
            prev.end = rawEnd - trailing;
          } else {
            out.push({
              text: trimmed,
              start: rawStart + leading,
              end: rawEnd - trailing,
            });
          }
        }
        sentenceStart = stop;
        i = stop;
        continue;
      } else {
        i = end + 1;
        continue;
      }
    }
    i++;
  }

  if (sentenceStart < input.length) {
    const slice = input.slice(sentenceStart);
    const leading = slice.length - slice.trimStart().length;
    const trailing = slice.length - slice.trimEnd().length;
    const trimmed = slice.trim();
    if (trimmed) {
      out.push({
        text: trimmed,
        start: sentenceStart + leading,
        end: input.length - trailing,
      });
    }
  }

  return out;
}

import { detectLang, type DetectedLang } from "./langDetect";

export interface SplitOptions {
  /** Optional language hint (BCP-47 or short). When omitted, autodetect. */
  lang?: string;
}

const ABBREVS_BY_LANG: Record<DetectedLang, ReadonlySet<string>> = {
  fr: FR_ABBREVIATIONS,
  en: EN_ABBREVIATIONS,
};

const normalizeLang = (lang?: string): DetectedLang | null => {
  if (!lang) return null;
  const l = lang.toLowerCase();
  if (l.startsWith("fr")) return "fr";
  if (l.startsWith("en")) return "en";
  return null;
};

// Score a candidate split: penalises *very short* fragments (likely false
// boundaries on abbreviations) and *very long* fragments (likely missed
// boundaries). Lower is better.
function scoreSplit(sentences: Sentence[]): number {
  if (sentences.length === 0) return Number.POSITIVE_INFINITY;
  let score = 0;
  for (const s of sentences) {
    const len = s.text.length;
    if (len < 8) score += (8 - len) * 2; // suspiciously short
    if (len > 240) score += (len - 240) * 0.05; // suspiciously long
    // A fragment ending with a known title-like abbrev followed by capital
    // word in the NEXT sentence is a tell-tale of a false split.
    if (/\b(Mr|Mrs|Ms|Dr|St|Mme|Mlle)$/.test(s.text)) score += 12;
  }
  return score;
}

/**
 * Public API. Splits `input` into sentences. When `opts.lang` is omitted or
 * the autodetector is uncertain, tries both FR and EN abbreviation sets and
 * keeps the better-looking result. For mixed-language text, splits per
 * paragraph so each block gets its own language decision.
 */
export function splitSentences(input: string, opts: SplitOptions = {}): Sentence[] {
  if (!input) return [];

  const explicit = normalizeLang(opts.lang);

  // Per-paragraph processing keeps mixed FR/EN guides coherent.
  // We split on blank lines and preserve absolute offsets.
  const paragraphs: Array<{ text: string; offset: number }> = [];
  {
    const re = /\n\s*\n/g;
    let last = 0;
    let m: RegExpExecArray | null;
    while ((m = re.exec(input)) !== null) {
      paragraphs.push({ text: input.slice(last, m.index), offset: last });
      last = m.index + m[0].length;
    }
    paragraphs.push({ text: input.slice(last), offset: last });
  }

  const all: Sentence[] = [];
  for (const p of paragraphs) {
    if (!p.text.trim()) continue;

    let chosen: Sentence[];
    if (explicit) {
      chosen = splitWithAbbrevs(p.text, ABBREVS_BY_LANG[explicit]);
    } else {
      const det = detectLang(p.text);
      if (det.confidence >= 0.35) {
        chosen = splitWithAbbrevs(p.text, ABBREVS_BY_LANG[det.lang]);
      } else {
        // Uncertain → run both and pick the lower-scoring split. Tie-break
        // toward the detector's mild preference, then FR.
        const fr = splitWithAbbrevs(p.text, FR_ABBREVIATIONS);
        const en = splitWithAbbrevs(p.text, EN_ABBREVIATIONS);
        const sFr = scoreSplit(fr);
        const sEn = scoreSplit(en);
        if (sFr < sEn) chosen = fr;
        else if (sEn < sFr) chosen = en;
        else chosen = det.lang === "en" ? en : fr;
      }
    }

    for (const s of chosen) {
      all.push({
        text: s.text,
        start: s.start + p.offset,
        end: s.end + p.offset,
      });
    }
  }

  return all;
}

/**
 * Helper: same as `splitSentences` but returns just the sentence texts.
 * Used by the speech segmenter where positions don't matter.
 */
export function splitSentencesText(input: string, opts: SplitOptions = {}): string[] {
  return splitSentences(input, opts).map((s) => s.text);
}
