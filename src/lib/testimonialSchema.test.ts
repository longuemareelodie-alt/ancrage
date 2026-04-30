import { describe, it, expect } from "vitest";
import fr from "@/i18n/locales/fr.json";
import {
  validateTestimonial,
  validateTestimonials,
  type Testimonial,
} from "./testimonialSchema";

const liveTestimonials = (fr as any).home.testimonials.items as Testimonial[];

describe("testimonialSchema — règles unitaires", () => {
  const valid: Testimonial = {
    name: "Camille",
    context: "32 ans · 2 enfants",
    delay: "J+5",
    before: "Je criais 3 fois par jour. Je m'endormais en pleurant.",
    result:
      "« Au 5e jour, je n'ai pas crié une seule fois. J'ai compris que je pouvais sentir la vague monter et la laisser passer. »",
    metrics: [
      { label: "Fréquence des crises", before: "3/jour", after: "0 sur 7 jours" },
      { label: "Durée d'apaisement", before: "45 min", after: "2 min" },
      { label: "Clarté mentale", before: "Ruminations 1h+", after: "Endormie en 15 min" },
    ],
  };

  it("accepte un témoignage conforme", () => {
    const r = validateTestimonial(valid);
    expect(r.valid).toBe(true);
    expect(r.errors).toEqual([]);
  });

  it("rejette le vocabulaire médical", () => {
    const r = validateTestimonial({
      ...valid,
      result: "« Ancrage a guéri ma dépression en 5 jours. »",
    });
    expect(r.valid).toBe(false);
    expect(r.errors.some((e) => e.rule === "vocab.medical")).toBe(true);
  });

  it("rejette les promesses universelles", () => {
    const r = validateTestimonial({
      ...valid,
      result: "« Résultat garanti pour toutes les mamans. »",
    });
    expect(r.valid).toBe(false);
    expect(r.errors.some((e) => e.rule === "vocab.universal_claim")).toBe(true);
  });

  it("rejette un délai mal formaté", () => {
    const r = validateTestimonial({ ...valid, delay: "tout de suite" });
    expect(r.errors.some((e) => e.rule === "format.delay")).toBe(true);
  });

  it("exige exactement 3 indicateurs", () => {
    const r = validateTestimonial({ ...valid, metrics: valid.metrics.slice(0, 2) });
    expect(r.errors.some((e) => e.rule === "metrics.count")).toBe(true);
  });

  it("avertit si avant == après dans une métrique", () => {
    const r = validateTestimonial({
      ...valid,
      metrics: [
        { label: "Stable", before: "Pareil", after: "Pareil" },
        valid.metrics[1],
        valid.metrics[2],
      ],
    });
    expect(r.warnings.some((w) => w.rule === "metrics.no_change")).toBe(true);
  });

  it("avertit si la citation n'est pas en guillemets français", () => {
    const r = validateTestimonial({
      ...valid,
      result: 'Au 5e jour, j\'ai compris que je pouvais sentir la vague monter et la laisser passer.',
    });
    expect(r.warnings.some((w) => w.rule === "format.quote")).toBe(true);
  });

  it("avertit sur le ton off (jargon marketing)", () => {
    const r = validateTestimonial({
      ...valid,
      result:
        "« C'est le meilleur produit que j'ai testé, vraiment révolutionnaire pour ma performance. »",
    });
    expect(r.warnings.some((w) => w.rule === "tone.off")).toBe(true);
  });

  it("rejette un champ obligatoire manquant", () => {
    const r = validateTestimonial({ ...valid, name: "" });
    expect(r.errors.some((e) => e.field === "name" && e.rule === "required")).toBe(true);
  });
});

describe("testimonialSchema — témoignages en production (fr.json)", () => {
  it("expose au moins 3 témoignages sur la home", () => {
    expect(Array.isArray(liveTestimonials)).toBe(true);
    expect(liveTestimonials.length).toBeGreaterThanOrEqual(3);
  });

  it("valide TOUS les témoignages actuellement publiés", () => {
    const { valid, results } = validateTestimonials(liveTestimonials);
    if (!valid) {
      // Affichage lisible pour debug si un témoignage est invalide
      // eslint-disable-next-line no-console
      console.error(
        "Témoignages invalides :",
        results
          .filter((r) => !r.valid)
          .map((r) => ({ name: r.name, errors: r.errors })),
      );
    }
    expect(valid).toBe(true);
  });
});
