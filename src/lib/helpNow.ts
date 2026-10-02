/**
 * « Éclosia m'aide maintenant » — moteur de correspondance fiable, sans IA.
 * Lit uniquement les données du compte connecté (passées en contexte) et
 * renvoie UNE première aide, quelques options secondaires, ou UNE question.
 * Extensible : chaque règle est une fonction indépendante, testée dans l'ordre.
 */
import { isSpaceActive, type SpaceId } from "@/lib/spaces";

export type HelpContext = {
  family: { id: string; first_name: string }[];
  contacts: { id: string; first_name: string; last_exchange_date: string | null; next_action: string | null }[];
  supports: { id: string; title: string; support_type: string; profile_id: string | null }[];
  next: { title: string; to: string } | null;
};

export type HelpAction =
  | { kind: "go"; label: string; to: string }
  | { kind: "relance"; label: string; contactId: string }
  | { kind: "note"; label: string }
  | { kind: "task"; label: string }
  | { kind: "need"; label: string };

export type HelpResult =
  | { type: "question"; question: string; choices: { label: string; append: string }[] }
  | {
      type: "answer";
      lead: string;
      situation: string;
      person?: string;
      steps?: string[];
      details?: string[];
      firstAction: string;
      resource?: string;
      primary: HelpAction;
      others: HelpAction[];
      /** espace concerné mais masqué : on le signale, on ne l'active pas */
      hiddenSpace?: { id: SpaceId; label: string };
      caution?: string;
    };

const norm = (v: string) =>
  v.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[’']/g, " ");
const has = (t: string, words: string[]) => words.some((w) => new RegExp(`\\b${w}`).test(t));
const nameIn = (t: string, name: string) =>
  !!name && new RegExp(`\\b${norm(name).replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`).test(t);
const fmt = (d: string | null) =>
  d ? new Date(d + "T12:00:00").toLocaleDateString("fr-FR", { day: "numeric", month: "long" }) : null;

const W = {
  business: ["relanc", "activite", "client", "prospect", "business", "devis", "commande", "vente", "partenaire"],
  overwhelm: ["trop de choses", "tete pleine", "perdue?", "sais pas par quoi", "sais plus quoi", "quoi faire aujourd", "deborde", "submerge", "par ou commencer"],
  dump: ["trop de choses en tete", "tete pleine", "plein la tete"],
  transition: ["refuse", "habiller", "chaussure", "partir", "depart", "crise", "colere", "hurle", "pleure", "bloque", "transition", "veut pas", "s oppose", "dents", "bain", "coucher", "ecran"],
  sante: ["medecin", "docteur", "pediatre", "dentiste", "ordonnance", "vaccin", "pharmacie", "traitement", "medicament", "orthophon", "psy", "kine", "hopital", "sante", "fievre", "malade"],
  admin: ["papier", "caf", "impot", "dossier", "formulaire", "attestation", "mdph", "assurance", "mutuelle", "administratif", "facture", "banque"],
  maison: ["courses", "menage", "lessive", "linge", "repas", "maison", "cuisine", "rangement", "ranger"],
  ecole: ["ecole", "maitresse", "devoirs", "cantine", "classe", "college"],
  call: ["appeler", "rappeler", "telephoner", "prendre rendez", "rdv", "rendez-vous", "rendez vous"],
  moi: ["fatigue", "epuise", "souffler", "pour moi", "me poser", "angoisse", "stress"],
};

const SPACE_LABEL: Record<SpaceId, string> = {
  moi: "Moi", famille: "Famille", sante: "Santé", organisation: "Organisation", autonomie: "Autonomie", business: "Business",
};
const hiddenIf = (id: SpaceId) => (isSpaceActive(id) ? undefined : { id, label: SPACE_LABEL[id] });

const FALLBACK_OTHERS: HelpAction[] = [
  { kind: "note", label: "Créer une note" },
  { kind: "task", label: "Créer une tâche" },
  { kind: "need", label: "Ajouter cette situation à mes besoins" },
];

export function helpNow(input: string, ctx: HelpContext): HelpResult {
  const t = norm(input.trim());
  const person = ctx.family.find((p) => nameIn(t, p.first_name));
  const childWords = /\b(mon fils|ma fille|mon enfant|mes enfants|le petit|la petite|mon bebe)\b/.test(t);
  const personLabel = person?.first_name ?? (childWords ? "ton enfant" : undefined);

  // 1 — Business : un contact existant est reconnu.
  const contact = ctx.contacts.find((c) => nameIn(t, c.first_name));
  if (contact && (has(t, W.business) || !person)) {
    const last = fmt(contact.last_exchange_date);
    return {
      type: "answer",
      lead: `${contact.first_name} est dans tes contacts Business.`,
      situation: "Relance Business",
      person: contact.first_name,
      details: [
        last ? `Dernier échange : ${last}` : "Pas encore d'échange noté",
        contact.next_action ? `Prochaine action : ${contact.next_action}` : "",
      ].filter(Boolean),
      firstAction: `Relancer ${contact.first_name}`,
      resource: "Fiche contact Business",
      primary: { kind: "relance", label: `Relancer ${contact.first_name}`, contactId: contact.id },
      others: [{ kind: "go", label: "Ouvrir Business", to: "/business/contacts" }],
      hiddenSpace: hiddenIf("business"),
    };
  }

  // 2 — « Je ne sais plus quoi faire » / trop de choses en tête.
  if (has(t, W.overwhelm)) {
    if (has(t, W.dump) || !ctx.next) {
      return {
        type: "answer",
        lead: "On fait simple aujourd'hui. ❤️",
        situation: "Tête trop pleine",
        firstAction: "Tout sortir de ta tête, sans trier",
        resource: "Vider ma tête",
        primary: { kind: "go", label: "Vider ma tête", to: "/pulse/vider-ma-tete" },
        others: [
          ...(ctx.next ? [{ kind: "go" as const, label: `Ta prochaine action : ${ctx.next.title}`, to: ctx.next.to }] : []),
          { kind: "go", label: "M'apaiser d'abord", to: "/moi/apaisement" },
        ],
      };
    }
    return {
      type: "answer",
      lead: "On fait simple aujourd'hui. ❤️",
      situation: "Besoin d'une seule priorité",
      firstAction: `Ta prochaine action : ${ctx.next.title}`,
      primary: { kind: "go", label: "Commencer", to: ctx.next.to },
      others: [
        { kind: "go", label: "Vider ma tête", to: "/pulse/vider-ma-tete" },
        { kind: "go", label: "M'apaiser d'abord", to: "/moi/apaisement" },
      ],
    };
  }

  // 3 — Transition difficile avec un enfant.
  if (has(t, W.transition) && (personLabel || has(t, ["refuse", "veut pas", "crise", "habiller", "chaussure"]))) {
    const words = t.split(/\W+/).filter((w) => w.length > 3);
    const pool = ctx.supports.filter((s) => !person || !s.profile_id || s.profile_id === person.id);
    const support =
      pool.find((s) => words.some((w) => norm(s.title).includes(w))) ??
      pool.find((s) => ["routine", "checklist", "cartes"].includes(s.support_type) && has(t, ["partir", "habiller", "chaussure", "matin"]) && /matin|depart|habill|chaussure|sortie/.test(norm(s.title)));
    return {
      type: "answer",
      lead: "Je pense que tu es face à une transition difficile.",
      situation: "Transition difficile",
      person: personLabel,
      steps: ["Une consigne courte", "Deux choix maximum", "Le support visuel adapté si tu en as un"],
      firstAction: "Pour cette situation, commence par :",
      resource: support ? support.title : undefined,
      primary: support
        ? { kind: "go", label: "Ouvrir le support", to: `/autonomie/support/${support.id}` }
        : { kind: "go", label: "Créer un support adapté", to: "/autonomie/assistant" },
      others: [
        { kind: "go", label: "Mes supports", to: "/autonomie/mes-supports" },
        { kind: "go", label: "M'apaiser, moi", to: "/moi/apaisement" },
      ],
      hiddenSpace: hiddenIf("autonomie"),
      ...(support ? {} : { details: ["Je n'ai pas encore de support spécifique pour cette situation."] }),
    };
  }

  // 4 — Santé : prudence, on oriente vers l'existant ou un professionnel.
  if (has(t, W.sante)) {
    return {
      type: "answer",
      lead: "Je pense que ceci peut t'aider.",
      situation: "Rendez-vous / Santé",
      person: personLabel,
      firstAction: has(t, W.call) ? "Noter le rendez-vous ou le rappel" : "Retrouver les informations de santé",
      resource: person ? `Fiche de ${person.first_name}` : "Espace santé",
      primary: has(t, W.call)
        ? { kind: "go", label: "Ajouter le rendez-vous", to: "/organisation" }
        : { kind: "go", label: "Ouvrir", to: person ? `/famille/${person.id}` : "/sante" },
      others: [
        { kind: "go", label: "Espace santé", to: "/sante" },
        { kind: "task", label: "En faire une tâche" },
      ],
      hiddenSpace: hiddenIf("sante"),
      caution: "Éclosia ne remplace pas un avis médical. En cas d'urgence, appelle le 15.",
    };
  }

  // 5 — Appel sans contexte : UNE question.
  if (has(t, W.call) && !has(t, W.admin) && !has(t, W.ecole)) {
    return {
      type: "question",
      question: "Tu veux parler d'un rendez-vous médical, administratif ou autre ?",
      choices: [
        { label: "Médical", append: " medecin" },
        { label: "Administratif", append: " administratif" },
        { label: "Autre", append: " __autre" },
      ],
    };
  }

  if (has(t, W.business)) {
    return {
      type: "answer",
      lead: "Je pense que ceci peut t'aider.",
      situation: "Ton activité",
      firstAction: "Retrouver tes contacts et relances",
      primary: { kind: "go", label: "Ouvrir Business", to: "/business" },
      others: [{ kind: "task", label: "En faire une tâche" }],
      hiddenSpace: hiddenIf("business"),
    };
  }

  if (has(t, W.admin)) {
    return {
      type: "answer",
      lead: "Je pense que ceci peut t'aider.",
      situation: "Papiers / administratif",
      person: personLabel,
      firstAction: "Retrouver ou déposer le document",
      resource: "Coffre-fort",
      primary: { kind: "go", label: "Ouvrir", to: "/famille/coffre" },
      others: [{ kind: "task", label: "En faire une tâche" }, { kind: "go", label: "Budget", to: "/budget" }],
    };
  }

  if (has(t, W.maison) || has(t, W.ecole)) {
    return {
      type: "answer",
      lead: "Je pense que ceci peut t'aider.",
      situation: has(t, W.ecole) ? "École" : "Maison",
      person: personLabel,
      firstAction: "Le poser dans ton organisation",
      primary: { kind: "task", label: "En faire une tâche" },
      others: [{ kind: "go", label: "Calendrier & tâches", to: "/organisation" }],
      hiddenSpace: hiddenIf("organisation"),
    };
  }

  if (has(t, W.moi)) {
    return {
      type: "answer",
      lead: "Je pense que ceci peut t'aider.",
      situation: "Prendre soin de toi",
      firstAction: "Un moment pour souffler",
      primary: { kind: "go", label: "M'apaiser", to: "/moi/apaisement" },
      others: [{ kind: "go", label: "Noter une émotion", to: "/moi/emotions" }],
    };
  }

  // Rien de fiable : on le dit, sans inventer.
  return {
    type: "answer",
    lead: "Je n'ai pas encore de support spécifique pour cette situation.",
    situation: "À garder",
    person: personLabel,
    firstAction: "Le mettre de côté pour ne pas l'oublier",
    primary: FALLBACK_OTHERS[0],
    others: FALLBACK_OTHERS.slice(1),
  };
}
