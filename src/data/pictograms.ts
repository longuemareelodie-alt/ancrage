/**
 * Bibliothèque de pictogrammes Éclosia.
 * Visuels : emojis Unicode (libres d'usage) + libellés écrits pour Éclosia.
 * Chaque entrée garde sa source et sa licence : toute future bibliothèque
 * externe devra déclarer ses droits ici avant d'être ajoutée.
 */
export type PictoCategory = "emotions" | "besoins" | "actions" | "personnes" | "lieux" | "social" | "reponses";

export type Pictogram = {
  key: string;
  emoji: string;
  label: string;
  category: PictoCategory;
  source: string;
  author: string;
  license: string;
  attributionRequired: boolean;
  restrictions?: string;
};

const ECLOSIA = { source: "Éclosia", author: "Éclosia", license: "Emoji Unicode + libellé Éclosia", attributionRequired: false };

const raw: [PictoCategory, string, string, string][] = [
  ["emotions", "content", "🙂", "Content"], ["emotions", "triste", "😢", "Triste"], ["emotions", "colere", "😡", "En colère"],
  ["emotions", "peur", "😨", "J'ai peur"], ["emotions", "inquiet", "😰", "Inquiet"], ["emotions", "frustre", "😖", "Frustré"],
  ["emotions", "fatigue", "😴", "Fatigué"], ["emotions", "depasse", "🤯", "Dépassé"], ["emotions", "neutre", "😐", "Neutre"],
  ["emotions", "rassure", "❤️", "Rassuré"], ["emotions", "ca-va", "🙂", "Ça va"],
  ["besoins", "manger", "🍽️", "Manger"], ["besoins", "boire", "🥤", "Boire"], ["besoins", "toilettes", "🚽", "Toilettes"],
  ["besoins", "dormir", "😴", "Dormir"], ["besoins", "calin", "🤗", "Câlin"], ["besoins", "arreter", "🛑", "Arrêter"],
  ["besoins", "aide", "🙋", "Aide"], ["besoins", "calme", "🤫", "Calme"], ["besoins", "rentrer", "🏠", "Rentrer"],
  ["besoins", "parler", "🗣️", "Parler"], ["besoins", "moins-bruit", "🎧", "Moins de bruit"], ["besoins", "doudou", "🧸", "Objet rassurant"],
  ["besoins", "tranquille", "🌿", "Être tranquille"],
  ["actions", "commencer", "▶️", "Commencer"], ["actions", "attendre", "⏸️", "Attendre"], ["actions", "choisir", "👉", "Choisir"],
  ["actions", "regarder", "👀", "Regarder"], ["actions", "ecouter", "👂", "Écouter"], ["actions", "demander", "🙋", "Demander"],
  ["actions", "ranger", "🧹", "Ranger"], ["actions", "partir", "🚶", "Partir"], ["actions", "revenir", "🏠", "Revenir"],
  ["actions", "se-laver", "🧼", "Se laver"], ["actions", "s-habiller", "👕", "S'habiller"],
  ["personnes", "maman", "👩", "Maman"], ["personnes", "papa", "👨", "Papa"], ["personnes", "soeur", "👧", "Sœur"],
  ["personnes", "frere", "👦", "Frère"], ["personnes", "professeur", "👩‍🏫", "Professeur"], ["personnes", "medecin", "👨‍⚕️", "Médecin"],
  ["personnes", "adulte-confiance", "🧑", "Adulte de confiance"], ["personnes", "quelquun", "👤", "Quelqu'un"],
  ["personnes", "enfant", "🧒", "Un enfant"], ["personnes", "adulte", "🧑‍🦱", "Un adulte"],
  ["lieux", "maison", "🏠", "Maison"], ["lieux", "ecole", "🏫", "École"], ["lieux", "voiture", "🚗", "Voiture"],
  ["lieux", "hopital", "🏥", "Médecin / hôpital"], ["lieux", "parc", "🛝", "Parc"], ["lieux", "magasin", "🛒", "Magasin"],
  ["social", "stop", "🛑", "Stop"], ["social", "partager", "🤝", "Partager"], ["social", "non", "🙅", "Non"],
  ["social", "question", "❓", "Question"], ["social", "demander-aide", "🙋", "Demander de l'aide"], ["social", "reconfort", "❤️", "Réconfort"],
  ["social", "conflit", "😡", "Conflit"],
  ["reponses", "oui", "👍", "Oui"], ["reponses", "non", "👎", "Non"], ["reponses", "je-ne-sais-pas", "🤷", "Je ne sais pas"],
  ["reponses", "pas-repondre", "🤐", "Je ne veux pas répondre"], ["reponses", "mal-oui", "🩹", "Oui, ça fait mal"],
  ["reponses", "securite-oui", "🟢", "Oui, je suis en sécurité"], ["reponses", "securite-non", "🔴", "Non, je ne me sens pas en sécurité"],
  ["reponses", "accident", "🍃", "Un accident"], ["reponses", "expres", "🎯", "Il voulait le faire"],
  ["reponses", "plusieurs-fois", "🔁", "Oui, plusieurs fois"],
  ["reponses", "mal-non", "🙂", "Non"], ["reponses", "aime", "🙂", "J'ai aimé"], ["reponses", "pas-aime", "🙁", "Je n'ai pas aimé"],
  ["actions", "parler-adulte", "❤️", "Parler à un adulte"], ["actions", "dire-stop", "🛑", "Dire STOP"],
  ["actions", "demander-aide", "🙋", "Demander de l'aide"], ["actions", "retrouver-adulte", "🏠", "Aller retrouver un adulte"],
  ["actions", "garder-trace", "📝", "Garder une trace"],
];

export const PICTOGRAMS: Pictogram[] = raw.map(([category, key, emoji, label]) => ({ key: `${category}:${key}`, emoji, label, category, ...ECLOSIA }));

const BY_KEY = new Map(PICTOGRAMS.map((p) => [p.key, p]));
export const picto = (key: string): Pictogram =>
  BY_KEY.get(key) ?? { key, emoji: "❔", label: key, category: "reponses", ...ECLOSIA };

export const CATEGORY_LABEL: Record<PictoCategory, string> = {
  emotions: "Émotions", besoins: "Besoins", actions: "Actions", personnes: "Personnes", lieux: "Lieux", social: "Situations sociales", reponses: "Réponses",
};
