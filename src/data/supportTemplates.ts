import { Repeat, ListChecks, CalendarRange, BookHeart, Star, Grid3x3, LucideIcon } from "lucide-react";

export type SupportType =
  | "routine"
  | "checklist"
  | "emploi-du-temps"
  | "histoire"
  | "recompenses"
  | "cartes";

export type SupportItem = { label: string; time?: string; note?: string };

export type SupportContent = { items: SupportItem[] };

export const SUPPORT_TYPES: Record<
  SupportType,
  { label: string; icon: LucideIcon; desc: string; itemLabel: string; withTime: boolean }
> = {
  routine: {
    label: "Routine",
    icon: Repeat,
    desc: "Une suite d'étapes visuelles, du matin au soir.",
    itemLabel: "Étape",
    withTime: true,
  },
  checklist: {
    label: "Check-list",
    icon: ListChecks,
    desc: "À cocher, pour ne rien oublier.",
    itemLabel: "Ligne",
    withTime: false,
  },
  "emploi-du-temps": {
    label: "Emploi du temps",
    icon: CalendarRange,
    desc: "La journée ou la semaine, rendue prévisible.",
    itemLabel: "Moment",
    withTime: true,
  },
  histoire: {
    label: "Histoire sociale",
    icon: BookHeart,
    desc: "Préparer une situation, phrase par phrase.",
    itemLabel: "Phrase",
    withTime: false,
  },
  recompenses: {
    label: "Tableau de récompenses",
    icon: Star,
    desc: "Des étoiles à gagner, un objectif clair.",
    itemLabel: "Objectif",
    withTime: false,
  },
  cartes: {
    label: "Cartes visuelles",
    icon: Grid3x3,
    desc: "Des cartes à découper pour communiquer.",
    itemLabel: "Carte",
    withTime: false,
  },
};

export const SUPPORT_ORDER: SupportType[] = [
  "routine",
  "checklist",
  "emploi-du-temps",
  "histoire",
  "recompenses",
  "cartes",
];

export type SupportTemplate = {
  slug: string;
  type: SupportType;
  title: string;
  description: string;
  items: SupportItem[];
};

/** Modèles prêts à l'emploi : un parent épuisé ne part jamais d'une page blanche. */
export const SUPPORT_TEMPLATES: SupportTemplate[] = [
  {
    slug: "routine-matin",
    type: "routine",
    title: "Routine du matin",
    description: "Se lever sans bataille.",
    items: [
      { label: "Se lever", time: "07:00" },
      { label: "S'habiller" },
      { label: "Petit-déjeuner" },
      { label: "Se laver les dents" },
      { label: "Chaussures et manteau" },
      { label: "Cartable" },
    ],
  },
  {
    slug: "routine-soir",
    type: "routine",
    title: "Routine du soir",
    description: "Descendre en douceur vers le sommeil.",
    items: [
      { label: "Dîner", time: "19:00" },
      { label: "Bain" },
      { label: "Pyjama" },
      { label: "Dents" },
      { label: "Histoire" },
      { label: "Lumière douce" },
    ],
  },
  {
    slug: "checklist-cartable",
    type: "checklist",
    title: "Mon cartable",
    description: "Vérifier seul avant de partir.",
    items: [
      { label: "Cahier de liaison" },
      { label: "Trousse" },
      { label: "Goûter" },
      { label: "Gourde" },
      { label: "Tenue de sport" },
    ],
  },
  {
    slug: "histoire-docteur",
    type: "histoire",
    title: "Je vais chez le docteur",
    description: "Préparer un rendez-vous médical.",
    items: [
      { label: "Aujourd'hui, je vais voir le docteur." },
      { label: "Dans la salle d'attente, j'attends avec papa ou maman." },
      { label: "Le docteur va regarder ma gorge et écouter mon cœur." },
      { label: "Ça ne fait pas mal. Je peux serrer ma main ou mon doudou." },
      { label: "Après, je rentre à la maison. Je suis fier de moi." },
    ],
  },
  {
    slug: "histoire-rentree",
    type: "histoire",
    title: "Le jour de la rentrée",
    description: "Rendre l'inconnu prévisible.",
    items: [
      { label: "Demain, c'est la rentrée." },
      { label: "Je retrouve ma classe et ma maîtresse." },
      { label: "Il y aura peut-être du bruit. Je peux mettre mon casque." },
      { label: "Si je suis inquiet, je peux le dire à un adulte." },
      { label: "Le soir, je rentre à la maison." },
    ],
  },
  {
    slug: "recompenses-semaine",
    type: "recompenses",
    title: "Mes étoiles de la semaine",
    description: "Cinq objectifs, une récompense.",
    items: [
      { label: "Je me lève à l'heure" },
      { label: "Je m'habille seul" },
      { label: "Je range mes affaires" },
      { label: "Je demande de l'aide avec des mots" },
      { label: "Je vais au lit calmement" },
    ],
  },
  {
    slug: "cartes-besoins",
    type: "cartes",
    title: "Cartes « j'ai besoin de »",
    description: "Communiquer sans mots.",
    items: [
      { label: "Pause" },
      { label: "Boire" },
      { label: "Toilettes" },
      { label: "Trop de bruit" },
      { label: "Câlin" },
      { label: "Aide" },
      { label: "Seul" },
      { label: "Manger" },
    ],
  },
  {
    slug: "edt-journee",
    type: "emploi-du-temps",
    title: "Ma journée",
    description: "Repères horaires visuels.",
    items: [
      { label: "Réveil", time: "07:00" },
      { label: "École", time: "08:30" },
      { label: "Déjeuner", time: "12:00" },
      { label: "École", time: "13:30" },
      { label: "Retour maison", time: "16:30" },
      { label: "Temps calme", time: "17:00" },
      { label: "Dîner", time: "19:00" },
      { label: "Coucher", time: "20:30" },
    ],
  },
];
