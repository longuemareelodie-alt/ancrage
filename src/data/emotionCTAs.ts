// CTA contextualisé par émotion : à chaque état dominant, sa promesse et
// son action immédiate. Évite le CTA générique en bas de page.

export interface EmotionCTA {
  /** Mini-bandeau au-dessus du bouton — pose la promesse */
  promise: string;
  /** Sous-promesse — la mécanique en 1 phrase */
  mechanism: string;
  /** Texte du bouton — un verbe d'action immédiate */
  action: string;
  /** Destination */
  to: string;
  /** Réassurance courte — temps + absence d'engagement */
  reassurance: string;
  /** Couleur dominante (token sémantique) */
  tone: "primary" | "accent" | "secondary";
}

export const EMOTION_CTAS: Record<string, EmotionCTA> = {
  panique: {
    promise: "Ton corps a besoin d'un signal de sécurité — maintenant.",
    mechanism: "1 expiration longue suffit à amorcer la baisse d'adrénaline.",
    action: "Respirer avec moi · 60 s",
    to: "/calme",
    reassurance: "Aucun compte requis · tu peux fermer à tout moment.",
    tone: "primary",
  },
  hypervigilance: {
    promise: "Tu peux relâcher la garde une minute. Je veille avec toi.",
    mechanism: "Ramener tes sens dans le présent désactive l'alerte de fond.",
    action: "Ancrer mes 5 sens · 90 s",
    to: "/calme",
    reassurance: "Tu gardes la main — pause possible à chaque étape.",
    tone: "accent",
  },
  rumination: {
    promise: "Tes pensées tournent. On va leur poser une question fermée.",
    mechanism: "Un seul mot écrit suffit à interrompre la boucle mentale.",
    action: "Poser ma pensée · 2 min",
    to: "/post-flow",
    reassurance: "Personne ne lit ce que tu écris. C'est pour toi seule.",
    tone: "secondary",
  },
  explosion: {
    promise: "L'énergie est là — on la fait sortir sans casser.",
    mechanism: "Décharger physiquement avant de parler protège les liens.",
    action: "Évacuer en 90 s",
    to: "/calme",
    reassurance: "Pas de jugement. Tu n'as rien fait de mal.",
    tone: "primary",
  },
};

export const DEFAULT_EMOTION_CTA: EmotionCTA = {
  promise: "Tu mérites une minute de calme.",
  mechanism: "Un ancrage court vaut mieux qu'une grande résolution.",
  action: "Récupérer mon calme · 30 s",
  to: "/calme",
  reassurance: "Tu gardes la main, à ton rythme.",
  tone: "primary",
};

export function getEmotionCTA(key: string | undefined): EmotionCTA {
  if (!key) return DEFAULT_EMOTION_CTA;
  return EMOTION_CTAS[key] ?? DEFAULT_EMOTION_CTA;
}
