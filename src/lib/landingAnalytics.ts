/**
 * Mesure du parcours commercial (landing → checkout → achat).
 * Aucun script tiers ajouté : on pousse dans `window.dataLayer` (lu par un
 * outil de mesure si la famille en branche un) et on émet un évènement DOM.
 * Aucune donnée personnelle, aucun chiffre inventé.
 */
export type LandingEvent =
  | "landing_view"
  | "hero_cta_click"
  | "demo_video_start"
  | "demo_video_complete"
  | "studio_section_view"
  | "pricing_view"
  | "founder_offer_view"
  | "founder_cta_click"
  | "checkout_start"
  | "ambassador_click"
  | "faq_open";

type Payload = Record<string, string | number | boolean | null>;

export const track = (event: LandingEvent, payload: Payload = {}) => {
  if (typeof window === "undefined") return;
  const w = window as unknown as { dataLayer?: unknown[] };
  w.dataLayer = w.dataLayer || [];
  w.dataLayer.push({ event, ...payload });
  window.dispatchEvent(new CustomEvent("eclosia:analytics", { detail: { event, ...payload } }));
};

/** Émet une seule fois quand la section devient visible. */
export const useSectionView = (event: LandingEvent) => {
  return (node: HTMLElement | null) => {
    if (!node || typeof IntersectionObserver === "undefined") return;
    if (node.dataset.seen === "1") return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting && node.dataset.seen !== "1") {
            node.dataset.seen = "1";
            track(event);
            io.disconnect();
          }
        });
      },
      { threshold: 0.25 }
    );
    io.observe(node);
  };
};
