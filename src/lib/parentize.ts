import type { ParentType } from "@/lib/parentType";

/**
 * Lightweight runtime swap so we can keep a single source of truth (the
 * historical "maman" copy) and present a "papa"-flavored version when needed.
 *
 * We deliberately keep this conservative: each rule targets a specific phrase
 * with the right casing/gender agreement so we don't accidentally mangle
 * unrelated text. New phrases can be added as the product grows.
 */

type Rule = { from: RegExp; to: string };

const PAPA_RULES: Rule[] = [
  // Identity / promise wording.
  { from: /la maman ancrée/g, to: "le papa ancré" },
  { from: /La maman ancrée/g, to: "Le papa ancré" },
  { from: /maman ancrée/g, to: "papa ancré" },
  { from: /devenir la maman/gi, to: "devenir le papa" },

  // Generic noun (when surfaced standalone).
  { from: /\bune maman\b/g, to: "un papa" },
  { from: /\bla maman\b/g, to: "le papa" },
  { from: /\bma maman\b/g, to: "mon papa" },
  { from: /\bMaman\b/g, to: "Papa" },

  // Adjective agreements that show up in the existing copy.
  { from: /\bbonne mère\b/g, to: "bon père" },
  { from: /\bune bonne mère\b/g, to: "un bon père" },
  { from: /\bfatiguée\b/g, to: "fatigué" },
  { from: /\bépuisée\b/g, to: "épuisé" },
  { from: /\bancrée\b/g, to: "ancré" },
  { from: /\bchoisie\b/g, to: "choisi" },
  { from: /\bdevenue\b/g, to: "devenu" },
  { from: /\bmise en alerte\b/g, to: "mis en alerte" },
  { from: /\brestée\b/g, to: "resté" },
  { from: /\bcassée\b/g, to: "cassé" },
];

export function parentize(text: string, parent: ParentType): string {
  if (parent !== "papa" || !text) return text;
  let out = text;
  for (const rule of PAPA_RULES) out = out.replace(rule.from, rule.to);
  return out;
}
