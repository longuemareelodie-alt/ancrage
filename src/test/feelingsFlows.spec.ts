import { describe, it, expect } from "vitest";
import {
  EXTENDED_EMOTIONS,
  getChildOutlet,
  getTeenTools,
  isCrisisEntry,
} from "@/data/childEmotionsCatalog";

const DEFAULT_TEEN_TOOLS_LEN = 4; // sentinel length of fallback

describe("Flow 9–12 — childOutlet per emotion", () => {
  for (const emotion of EXTENDED_EMOTIONS) {
    it(`expose un outil d'expression pour « ${emotion.label} » (${emotion.key})`, () => {
      const outlet = getChildOutlet(emotion.key);
      expect(outlet, `childOutlet manquant pour ${emotion.key}`).toBeTruthy();
      expect(typeof outlet).toBe("string");
      expect((outlet as string).length).toBeGreaterThan(10);
    });
  }
});

describe("Flow 12+ — teenTools dédiés par émotion", () => {
  for (const emotion of EXTENDED_EMOTIONS) {
    it(`expose des outils ado spécifiques pour « ${emotion.label} » (${emotion.key})`, () => {
      const tools = getTeenTools(emotion.key);
      expect(Array.isArray(tools)).toBe(true);
      expect(tools.length).toBeGreaterThanOrEqual(2);
      // Doit être différent du fallback (chaque émotion a sa propre liste)
      const isFallback =
        tools.length === DEFAULT_TEEN_TOOLS_LEN &&
        tools[0]?.startsWith("Mets de la musique calme");
      expect(isFallback, `outils ado fallback pour ${emotion.key}`).toBe(false);
    });
  }
});

describe("Flow 12+ — CTA crise déclenché à l'intensité ≥ 4 (scale 5)", () => {
  for (const emotion of EXTENDED_EMOTIONS) {
    it(`affiche la CTA crise pour « ${emotion.label} » à intensité 4`, () => {
      const crisis = isCrisisEntry({
        emotion: emotion.key,
        intensity: 4,
        intensityScale: 5,
      });
      expect(crisis).toBe(true);
    });

    it(`pas de CTA crise pour « ${emotion.label} » à intensité 2 (sauf crisisOnSelect)`, () => {
      const crisis = isCrisisEntry({
        emotion: emotion.key,
        intensity: 2,
        intensityScale: 5,
      });
      expect(crisis).toBe(Boolean(emotion.crisisOnSelect));
    });
  }
});
