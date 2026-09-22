/**
 * L'équipe PULSE : six compagnons qui portent chacun un domaine du quotidien.
 * Illustrations douces dessinées aux couleurs Éclosia, jamais de photo réaliste.
 * Le champ `domain` est stocké (optionnellement) sur les tâches et rendez-vous.
 */
import louve from "@/assets/mascots/louve.png";
import bichette from "@/assets/mascots/bichette.png";
import renard from "@/assets/mascots/renard.png";
import abeille from "@/assets/mascots/abeille.png";
import lapin from "@/assets/mascots/lapin.png";
import chat from "@/assets/mascots/chat.png";

export type PulseDomain = "moi" | "sante" | "admin" | "argent" | "ecole" | "maison";

export type Mascot = {
  domain: PulseDomain;
  /** Illustration douce du compagnon. */
  image: string;
  emoji: string;
  name: string;
  label: string;
  /** Classes de teinte douces, dérivées des tokens Éclosia. */
  tint: string;
  to: string;
};

export const MASCOTS: Mascot[] = [
  { domain: "moi", image: louve, emoji: "🐺", name: "Louve", label: "Moi", tint: "bg-primary/15", to: "/moi" },
  { domain: "sante", image: bichette, emoji: "🦌", name: "Bichette", label: "Santé", tint: "bg-secondary/60", to: "/sante" },
  { domain: "admin", image: renard, emoji: "🦊", name: "Renard", label: "Administratif", tint: "bg-primary/10", to: "/famille/coffre" },
  { domain: "argent", image: abeille, emoji: "🐝", name: "Abeille", label: "Argent", tint: "bg-secondary/50", to: "/budget" },
  { domain: "ecole", image: lapin, emoji: "🐰", name: "Lapin", label: "École", tint: "bg-primary/10", to: "/famille" },
  { domain: "maison", image: chat, emoji: "🐱", name: "Chat", label: "Maison", tint: "bg-secondary/60", to: "/plus/organisation" },
];

export const mascotOf = (domain?: string | null): Mascot | undefined =>
  MASCOTS.find((m) => m.domain === domain);

/** Devine un domaine à partir du texte, sans jamais rien imposer. */
export function guessDomain(text: string): PulseDomain | null {
  const t = text.toLowerCase();
  const rules: [PulseDomain, string[]][] = [
    ["sante", ["médecin", "medecin", "docteur", "ordonnance", "pharmacie", "dentiste", "rdv", "vaccin", "orthophon", "psy"]],
    ["admin", ["caf", "impôt", "impot", "dossier", "papier", "mdph", "courrier", "assurance", "mutuelle", "préfecture"]],
    ["argent", ["facture", "payer", "banque", "budget", "virement", "prélèvement", "prelevement"]],
    ["ecole", ["école", "ecole", "maîtresse", "maitresse", "cantine", "devoir", "collège", "college", "aesh", "professeur"]],
    ["maison", ["ménage", "menage", "courses", "lessive", "cuisine", "ranger", "vaisselle", "maison"]],
    ["moi", ["moi", "respirer", "pause", "journal", "sport", "coiffeur", "amie"]],
  ];
  for (const [domain, words] of rules) if (words.some((w) => t.includes(w))) return domain;
  return null;
}
