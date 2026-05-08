/**
 * E2E-style guardrail: no "essai gratuit 7 jours" CTA may appear in the
 * public-facing UI (pages, components, i18n bundles, transactional emails).
 *
 * The offer was unified into a single Premium price (59 €). Any reappearance
 * of free-trial / 7-day-trial CTAs would be a regression — this test fails
 * the build before it ships.
 */
import { describe, it, expect } from "vitest";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, extname } from "node:path";

const ROOTS = [
  "src/pages",
  "src/components",
  "src/i18n/locales",
  "supabase/functions/_shared/transactional-email-templates",
];

const ALLOWED_EXT = new Set([".ts", ".tsx", ".json"]);

// Patterns that would indicate a free-trial CTA leaked back into the UI.
// We are deliberately strict: any case-insensitive match fails the test.
const FORBIDDEN_PATTERNS: { name: string; regex: RegExp }[] = [
  { name: "essai gratuit", regex: /essai\s*gratuit/i },
  { name: "free trial", regex: /free\s*trial/i },
  { name: "kostenlose Testphase", regex: /kostenlose?\s*test(phase|version)?/i },
  { name: "prueba gratuita", regex: /prueba\s*gratuita/i },
  { name: "تجربة مجانية", regex: /تجربة\s*مجانية/ },
  // CTA-shaped phrases combining "7 jours" with a trial verb.
  { name: "commencer/démarrer 7 jours", regex: /(commenc(?:e|er)|démarrer|essayer)[^.\n]{0,30}7\s*jours/i },
  { name: "start 7 days trial", regex: /(start|try)[^.\n]{0,20}7[-\s]?days?/i },
];

function walk(dir: string, out: string[] = []): string[] {
  let entries: string[];
  try {
    entries = readdirSync(dir);
  } catch {
    return out;
  }
  for (const name of entries) {
    const full = join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) {
      walk(full, out);
    } else if (ALLOWED_EXT.has(extname(name))) {
      out.push(full);
    }
  }
  return out;
}

const files = ROOTS.flatMap((r) => walk(r));

describe("public UI never advertises a free 7-day trial", () => {
  it("collects scanable files", () => {
    expect(files.length).toBeGreaterThan(0);
  });

  for (const { name, regex } of FORBIDDEN_PATTERNS) {
    it(`contains no "${name}" CTA`, () => {
      const offenders: { file: string; line: number; text: string }[] = [];
      for (const file of files) {
        const content = readFileSync(file, "utf8");
        const lines = content.split("\n");
        lines.forEach((text, idx) => {
          if (regex.test(text)) {
            offenders.push({ file, line: idx + 1, text: text.trim().slice(0, 200) });
          }
        });
      }
      expect(
        offenders,
        `Found forbidden "${name}" mentions:\n` +
          offenders.map((o) => `  ${o.file}:${o.line} → ${o.text}`).join("\n"),
      ).toEqual([]);
    });
  }
});
