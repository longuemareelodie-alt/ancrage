/**
 * Gabarit de validation des témoignages affichés sur la home.
 *
 * Objectifs :
 *  1. Cohérence narrative (avant/après mesurable, délai réaliste, contexte clair).
 *  2. Non-médicalisation (pas de vocabulaire de diagnostic, traitement, guérison…).
 *  3. Conformité au ton (sororal, incarné, sans promesse universelle).
 *  4. Sécurité juridique (mention de prénom modifié, disclaimer, pas d'allégation
 *     thérapeutique).
 *
 * Utilisation :
 *   import { validateTestimonial } from "@/lib/testimonialSchema";
 *   const result = validateTestimonial(myTestimonial);
 *   if (!result.valid) console.warn(result.errors);
 */

export type TestimonialMetric = {
  /** Libellé court de l'indicateur (ex. "Fréquence des crises"). */
  label: string;
  /** État avant l'utilisation d'Ancrage. */
  before: string;
  /** État après. */
  after: string;
};

export type Testimonial = {
  /** Prénom (modifié). */
  name: string;
  /** Contexte court : âge, nb d'enfants, situation. */
  context: string;
  /** Délai d'observation du résultat (format "J+N" ou "Sem N"). */
  delay: string;
  /** Phrase courte décrivant la situation initiale. */
  before: string;
  /** Citation du témoignage entre guillemets français « … ». */
  result: string;
  /** Exactement 3 indicateurs avant/après. */
  metrics: TestimonialMetric[];
};

export type ValidationIssue = {
  field: string;
  rule: string;
  message: string;
  severity: "error" | "warning";
};

export type ValidationResult = {
  valid: boolean;
  errors: ValidationIssue[];
  warnings: ValidationIssue[];
};

/* -------------------------------------------------------------------------- */
/* Règles                                                                     */
/* -------------------------------------------------------------------------- */

/**
 * Vocabulaire médical / thérapeutique INTERDIT.
 * Ancrage est un outil de bien-être, pas un dispositif médical.
 * Toute formulation laissant entendre un soin, un diagnostic ou une guérison
 * expose à un risque juridique (allégation de santé non autorisée).
 */
export const FORBIDDEN_MEDICAL_TERMS = [
  "guéri",
  "guérie",
  "guérison",
  "soigné",
  "soignée",
  "soigner",
  "traitement",
  "traité",
  "traitée",
  "thérapie",
  "thérapeutique",
  "diagnostic",
  "diagnostiqué",
  "diagnostiquée",
  "dépression",
  "dépressive",
  "burn-out",
  "burnout",
  "tdah",
  "anxiété généralisée",
  "trouble anxieux",
  "tspt",
  "ptsd",
  "ssri",
  "antidépresseur",
  "antidepresseur",
  "anxiolytique",
  "psychiatre m'a dit",
  "remplace ma thérapie",
  "remplace mon médecin",
  "plus besoin de mon traitement",
] as const;

/**
 * Promesses universelles INTERDITES.
 * Chaque corps est différent — pas de "ça marche pour toutes", "garanti", etc.
 */
export const FORBIDDEN_UNIVERSAL_CLAIMS = [
  "garanti",
  "garantie",
  "100% des",
  "toutes les mamans",
  "ça marche à tous les coups",
  "miracle",
  "miraculeux",
  "instantané",
  "définitivement",
  "pour toujours",
  "à vie", // sauf dans le contexte "accès à vie" → géré ailleurs
] as const;

/**
 * Mots qui violent le ton sororal/incarné.
 * On reste dans la première personne, sans hype marketing ni jargon corpo.
 */
export const OFF_TONE_TERMS = [
  "boostez",
  "optimisez",
  "performance",
  "roi",
  "leverage",
  "disruptif",
  "révolutionnaire",
  "game changer",
  "incroyable",
  "extraordinaire",
  "le meilleur produit",
] as const;

/**
 * Format attendu pour `delay` : "J+5", "Sem 2", "Semaine 3", "J+30"…
 * Pas de "en 1 semaine miraculeuse" ou "tout de suite".
 */
const DELAY_PATTERN = /^(J\+\d{1,3}|Sem(?:aine)?\s?\d{1,2})$/i;

/** Bornes de longueur (caractères) pour rester scannable. */
const LIMITS = {
  name: { min: 2, max: 30 },
  context: { min: 8, max: 80 },
  before: { min: 10, max: 160 },
  result: { min: 30, max: 320 },
  metricLabel: { min: 4, max: 60 },
  metricValue: { min: 1, max: 80 },
} as const;

const REQUIRED_METRICS = 3;

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

const norm = (s: string) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

const containsAny = (text: string, terms: readonly string[]): string[] => {
  const haystack = norm(text);
  return terms.filter((term) => haystack.includes(norm(term)));
};

const checkLength = (
  field: string,
  value: string,
  { min, max }: { min: number; max: number },
  errors: ValidationIssue[],
) => {
  const len = value.trim().length;
  if (len < min) {
    errors.push({
      field,
      rule: "length.min",
      message: `Trop court (${len} car., min ${min}).`,
      severity: "error",
    });
  }
  if (len > max) {
    errors.push({
      field,
      rule: "length.max",
      message: `Trop long (${len} car., max ${max}).`,
      severity: "error",
    });
  }
};

const checkForbidden = (
  field: string,
  value: string,
  terms: readonly string[],
  rule: string,
  severity: "error" | "warning",
  bag: ValidationIssue[],
) => {
  const hits = containsAny(value, terms);
  if (hits.length) {
    bag.push({
      field,
      rule,
      message: `Termes interdits détectés : ${hits.join(", ")}.`,
      severity,
    });
  }
};

/* -------------------------------------------------------------------------- */
/* Validation                                                                 */
/* -------------------------------------------------------------------------- */

export function validateTestimonial(t: Testimonial): ValidationResult {
  const errors: ValidationIssue[] = [];
  const warnings: ValidationIssue[] = [];

  // Présence des champs
  (["name", "context", "delay", "before", "result"] as const).forEach((f) => {
    if (!t[f] || typeof t[f] !== "string" || !t[f].trim()) {
      errors.push({
        field: f,
        rule: "required",
        message: "Champ obligatoire manquant.",
        severity: "error",
      });
    }
  });

  // Longueurs
  if (t.name) checkLength("name", t.name, LIMITS.name, errors);
  if (t.context) checkLength("context", t.context, LIMITS.context, errors);
  if (t.before) checkLength("before", t.before, LIMITS.before, errors);
  if (t.result) checkLength("result", t.result, LIMITS.result, errors);

  // Format délai
  if (t.delay && !DELAY_PATTERN.test(t.delay.trim())) {
    errors.push({
      field: "delay",
      rule: "format.delay",
      message: `"${t.delay}" doit suivre le format "J+N" ou "Sem N".`,
      severity: "error",
    });
  }

  // Citation entre guillemets français
  if (t.result && !/^«.+»$/.test(t.result.trim())) {
    warnings.push({
      field: "result",
      rule: "format.quote",
      message: "La citation doit être entourée de guillemets français « … ».",
      severity: "warning",
    });
  }

  // Vocabulaire médical / promesses / ton — appliqué à TOUS les champs texte
  const allText = [t.name, t.context, t.before, t.result].filter(Boolean).join(" \n ");
  checkForbidden("*", allText, FORBIDDEN_MEDICAL_TERMS, "vocab.medical", "error", errors);
  checkForbidden(
    "*",
    allText,
    FORBIDDEN_UNIVERSAL_CLAIMS,
    "vocab.universal_claim",
    "error",
    errors,
  );
  checkForbidden("*", allText, OFF_TONE_TERMS, "tone.off", "warning", warnings);

  // Métriques
  if (!Array.isArray(t.metrics)) {
    errors.push({
      field: "metrics",
      rule: "required",
      message: "Le champ metrics doit être un tableau.",
      severity: "error",
    });
  } else {
    if (t.metrics.length !== REQUIRED_METRICS) {
      errors.push({
        field: "metrics",
        rule: "metrics.count",
        message: `Exactement ${REQUIRED_METRICS} indicateurs requis (${t.metrics.length} fournis).`,
        severity: "error",
      });
    }
    t.metrics.forEach((m, i) => {
      const prefix = `metrics[${i}]`;
      (["label", "before", "after"] as const).forEach((f) => {
        if (!m[f] || !m[f].trim()) {
          errors.push({
            field: `${prefix}.${f}`,
            rule: "required",
            message: "Champ obligatoire manquant.",
            severity: "error",
          });
        }
      });
      if (m.label) checkLength(`${prefix}.label`, m.label, LIMITS.metricLabel, errors);
      if (m.before) checkLength(`${prefix}.before`, m.before, LIMITS.metricValue, errors);
      if (m.after) checkLength(`${prefix}.after`, m.after, LIMITS.metricValue, errors);

      // before == after = pas de transformation, on rejette
      if (m.before && m.after && norm(m.before) === norm(m.after)) {
        warnings.push({
          field: `${prefix}`,
          rule: "metrics.no_change",
          message: "L'indicateur 'avant' et 'après' sont identiques.",
          severity: "warning",
        });
      }

      // Vocabulaire médical/promesses dans les métriques aussi
      const mText = [m.label, m.before, m.after].join(" ");
      checkForbidden(prefix, mText, FORBIDDEN_MEDICAL_TERMS, "vocab.medical", "error", errors);
      checkForbidden(
        prefix,
        mText,
        FORBIDDEN_UNIVERSAL_CLAIMS,
        "vocab.universal_claim",
        "error",
        errors,
      );
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/** Valide une liste — utile pour les tests d'i18n. */
export function validateTestimonials(list: Testimonial[]): {
  valid: boolean;
  results: Array<ValidationResult & { name: string }>;
} {
  const results = list.map((t) => ({ name: t.name, ...validateTestimonial(t) }));
  return {
    valid: results.every((r) => r.valid),
    results,
  };
}
