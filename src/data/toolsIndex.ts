/**
 * Index des outils d'Éclosia pour la recherche universelle.
 * Chaque entrée pointe vers un outil existant : la recherche ne recrée rien.
 */
export type ToolEntry = { label: string; desc: string; to: string; keywords: string };

export const TOOLS: ToolEntry[] = [
  { label: "Aujourd'hui", desc: "Ton état du jour et ta prochaine action", to: "/aujourdhui", keywords: "accueil pulse go moyen sature ko prochaine action priorites" },
  { label: "Vider ma tête", desc: "Tout déposer, Éclosia trie", to: "/pulse/vider-ma-tete", keywords: "charge mentale liste tri dicter" },
  { label: "Mon rythme", desc: "Tes états des derniers jours", to: "/pulse/mon-rythme", keywords: "energie historique etat" },
  { label: "Ma famille", desc: "Les profils de ton foyer", to: "/famille", keywords: "enfants membres profils foyer" },
  { label: "Santé de la famille", desc: "Rendez-vous, traitements, urgences", to: "/sante", keywords: "medical medecin sante" },
  { label: "Rendez-vous médicaux", desc: "Agenda médical avec rappels", to: "/sante/rendez-vous", keywords: "rdv medecin docteur consultation" },
  { label: "Médicaments et traitements", desc: "Suivi et rappels quotidiens", to: "/sante/medicaments", keywords: "medicament traitement pilule rappel" },
  { label: "Fiche d'urgence", desc: "Les infos vitales via un QR code", to: "/sante/fiche-medicale", keywords: "urgence qr code allergies sang" },
  { label: "Profils médicaux", desc: "Un dossier par membre", to: "/sante/profils-familiaux", keywords: "dossier medical allergies diagnostics ordonnances carnet vaccins" },
  { label: "Coffre-fort", desc: "Les documents importants du foyer", to: "/famille/coffre", keywords: "documents papiers administratif scanner" },
  { label: "Autonomie et supports", desc: "Routines, histoires sociales, cartes", to: "/autonomie", keywords: "routine support pictogrammes histoire sociale check-list recompenses" },
  { label: "Créer un support", desc: "Routine, histoire, cartes visuelles", to: "/autonomie/studio", keywords: "studio creer routine histoire sociale" },
  { label: "Calendrier et tâches", desc: "Rendez-vous, rappels, à faire, courses", to: "/organisation", keywords: "agenda calendrier taches courses maison organisation" },
  { label: "Budget", desc: "Mois par mois, factures et dépenses", to: "/budget", keywords: "argent depenses revenus factures mois" },
  { label: "Business", desc: "Contacts, relances, clientes", to: "/business", keywords: "activite travail clientes relances pipeline" },
  { label: "Mes émotions", desc: "Noter comment tu vas", to: "/moi/emotions", keywords: "humeur emotion ressenti" },
  { label: "M'apaiser", desc: "Respiration, ancrage, relaxation", to: "/moi/apaisement", keywords: "calme respiration stress angoisse" },
  { label: "Objectifs", desc: "Ce que tu veux, à ton rythme", to: "/moi/objectifs", keywords: "objectif priorite but" },
  { label: "Mes habitudes", desc: "Une grille de la semaine", to: "/moi/habitudes", keywords: "habitude semaine routine perso" },
  { label: "Mon chemin", desc: "Ta chronologie", to: "/moi/chemin", keywords: "chronologie moments victoires" },
  { label: "Mon portrait", desc: "Qui tu deviens, mois après mois", to: "/portrait-transformation", keywords: "portrait transformation" },
  { label: "Journal", desc: "Écrire librement, 100 % privé", to: "/lies-autrement/journal", keywords: "ecrire journal notes" },
  { label: "Mes petits moments", desc: "Tes badges privés", to: "/moi/badges", keywords: "badges moments" },
  { label: "Livre de reconstruction", desc: "Ton livre personnel en PDF", to: "/livre-reconstruction", keywords: "livre reconstruction pdf" },
  { label: "Frise", desc: "Avant, tempête, aujourd'hui", to: "/frise-evolution", keywords: "frise evolution" },
  { label: "Ressources", desc: "Neuroatypie, LSF, activités, annuaire", to: "/ressources", keywords: "ressources lsf neuroatypie annuaire activites" },
  { label: "Liés autrement", desc: "Les familles qui avancent autrement", to: "/lies-autrement", keywords: "communaute familles" },
  { label: "Échanges", desc: "Parler avec d'autres parents", to: "/lies-autrement/communaute", keywords: "communaute parents forum echanges" },
  { label: "Programme ambassadrice", desc: "Ton impact et tes commissions", to: "/mon-impact", keywords: "ambassadrice parrainage commissions" },
  { label: "Mon profil", desc: "Tes informations", to: "/profil", keywords: "compte profil" },
  { label: "Personnalisation", desc: "Ce qu'Éclosia te propose", to: "/mon-eclosia", keywords: "personnaliser espaces besoins" },
  { label: "Réglages", desc: "Notifications, mode jour et nuit", to: "/parametres", keywords: "parametres reglages notifications theme nuit jour" },
  { label: "Support", desc: "Une question ? On te répond", to: "/parametres#support", keywords: "aide contact support question" },
];

const norm = (s: string) =>
  s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();

/** Outils dont le nom, la description ou les mots-clés contiennent chaque mot tapé. */
export function searchTools(query: string, limit = 6): ToolEntry[] {
  const words = norm(query).split(/\s+/).filter((w) => w.length >= 2);
  if (!words.length) return [];
  return TOOLS.filter((t) => {
    const hay = norm(`${t.label} ${t.desc} ${t.keywords}`);
    return words.every((w) => hay.includes(w));
  }).slice(0, limit);
}
