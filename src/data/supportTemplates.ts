import {
  Repeat,
  ListChecks,
  CalendarRange,
  BookHeart,
  Star,
  Grid3x3,
  Puzzle,
  LucideIcon,
} from "lucide-react";

export type SupportType =
  | "routine"
  | "checklist"
  | "emploi-du-temps"
  | "histoire"
  | "recompenses"
  | "cartes"
  | "activite";

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
  activite: {
    label: "Activité",
    icon: Puzzle,
    desc: "Un moment préparé, avec le matériel et les étapes.",
    itemLabel: "Étape",
    withTime: false,
  },
};

export const SUPPORT_ORDER: SupportType[] = [
  "routine",
  "histoire",
  "cartes",
  "checklist",
  "emploi-du-temps",
  "recompenses",
  "activite",
];

/** Catégories transversales : elles servent la recherche et les filtres. */
export type TemplateCategory =
  | "matin"
  | "soir"
  | "hygiene"
  | "ecole"
  | "repas"
  | "devoirs"
  | "sorties"
  | "calme"
  | "emotions"
  | "communication"
  | "sante"
  | "motricite"
  | "sensoriel";

export const CATEGORY_LABELS: Record<TemplateCategory, string> = {
  matin: "Matin",
  soir: "Soir & sommeil",
  hygiene: "Hygiène",
  ecole: "École",
  repas: "Repas",
  devoirs: "Devoirs",
  sorties: "Sorties",
  calme: "Retour au calme",
  emotions: "Émotions",
  communication: "Communication",
  sante: "Santé & soins",
  motricite: "Motricité",
  sensoriel: "Sensoriel",
};

export type SupportTemplate = {
  slug: string;
  type: SupportType;
  title: string;
  description: string;
  category: TemplateCategory;
  ages?: string;
  items: SupportItem[];
};

/** Modèles prêts à l'emploi : un parent épuisé ne part jamais d'une page blanche. */
export const SUPPORT_TEMPLATES: SupportTemplate[] = [
  // ---------- Routines ----------
  {
    slug: "routine-matin",
    type: "routine",
    title: "Routine du matin",
    description: "Se lever sans bataille.",
    category: "matin",
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
    category: "soir",
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
    slug: "routine-hygiene",
    type: "routine",
    title: "Je me lave",
    description: "La douche, étape par étape.",
    category: "hygiene",
    items: [
      { label: "Je prépare ma serviette" },
      { label: "Je me déshabille" },
      { label: "Je mouille mon corps" },
      { label: "Je mets du savon" },
      { label: "Je rince" },
      { label: "Je m'essuie" },
      { label: "Je m'habille" },
    ],
  },
  {
    slug: "routine-dents",
    type: "routine",
    title: "Je me brosse les dents",
    description: "Trois minutes, cinq gestes.",
    category: "hygiene",
    items: [
      { label: "Je mouille la brosse" },
      { label: "Un petit pois de dentifrice" },
      { label: "Je brosse en haut" },
      { label: "Je brosse en bas" },
      { label: "Je rince et je souris" },
    ],
  },
  {
    slug: "routine-devoirs",
    type: "routine",
    title: "Le temps des devoirs",
    description: "Un cadre clair, des pauses prévues.",
    category: "devoirs",
    items: [
      { label: "Je bois un verre d'eau" },
      { label: "Je prépare ma table" },
      { label: "Je regarde ce qu'il y a à faire" },
      { label: "Je fais le plus court d'abord" },
      { label: "Pause de 5 minutes" },
      { label: "Je termine" },
      { label: "Je range mon cartable" },
    ],
  },
  {
    slug: "routine-repas",
    type: "routine",
    title: "Passer à table",
    description: "Anticiper la transition du repas.",
    category: "repas",
    items: [
      { label: "Je range mon jeu" },
      { label: "Je me lave les mains" },
      { label: "Je mets ma place" },
      { label: "Je m'assois" },
      { label: "Je goûte" },
      { label: "Je débarrasse mon assiette" },
    ],
  },
  {
    slug: "routine-sortie",
    type: "routine",
    title: "On sort de la maison",
    description: "Partir sans course-poursuite.",
    category: "sorties",
    items: [
      { label: "Je préviens : on part dans 5 minutes" },
      { label: "Toilettes" },
      { label: "Chaussures" },
      { label: "Manteau" },
      { label: "Mon objet doudou" },
      { label: "On y va" },
    ],
  },
  {
    slug: "routine-calme",
    type: "routine",
    title: "Retour au calme",
    description: "Après une crise, revenir à soi.",
    category: "calme",
    items: [
      { label: "Je vais dans mon coin doux" },
      { label: "Lumière basse, moins de bruit" },
      { label: "Je serre mon coussin" },
      { label: "Je souffle trois fois lentement" },
      { label: "Je bois un peu d'eau" },
      { label: "Je dis ce dont j'ai besoin" },
    ],
  },
  {
    slug: "routine-ecole-retour",
    type: "routine",
    title: "En rentrant de l'école",
    description: "Décompresser avant tout le reste.",
    category: "ecole",
    items: [
      { label: "Je pose mon cartable" },
      { label: "Je me change" },
      { label: "Goûter" },
      { label: "20 minutes rien qu'à moi" },
      { label: "Devoirs" },
    ],
  },

  // ---------- Histoires sociales ----------
  {
    slug: "histoire-docteur",
    type: "histoire",
    title: "Je vais chez le docteur",
    description: "Préparer un rendez-vous médical.",
    category: "sante",
    items: [
      { label: "Aujourd'hui, je vais voir le docteur." },
      { label: "Dans la salle d'attente, j'attends avec papa ou maman." },
      { label: "Le docteur va regarder ma gorge et écouter mon cœur." },
      { label: "Ça ne fait pas mal. Je peux serrer ma main ou mon doudou." },
      { label: "Après, je rentre à la maison. Je suis fier de moi." },
    ],
  },
  {
    slug: "histoire-dentiste",
    type: "histoire",
    title: "Je vais chez le dentiste",
    description: "Un fauteuil, une lumière, c'est tout.",
    category: "sante",
    items: [
      { label: "Je vais voir le dentiste." },
      { label: "Je m'assois sur un grand fauteuil qui bouge." },
      { label: "Une lumière s'allume pour voir mes dents." },
      { label: "Le dentiste compte mes dents avec un petit miroir." },
      { label: "Je peux lever la main si je veux une pause." },
      { label: "C'est fini. Mes dents sont propres." },
    ],
  },
  {
    slug: "histoire-coiffeur",
    type: "histoire",
    title: "Je vais chez le coiffeur",
    description: "Le bruit, la cape, les ciseaux.",
    category: "sensoriel",
    items: [
      { label: "Je vais chez le coiffeur." },
      { label: "Je mets une cape sur mes épaules." },
      { label: "Les ciseaux font un petit bruit. Ça ne fait pas mal." },
      { label: "Je peux garder mon casque anti-bruit." },
      { label: "Quand c'est fini, je me regarde dans le miroir." },
    ],
  },
  {
    slug: "histoire-dormir-seul",
    type: "histoire",
    title: "Je dors dans mon lit",
    description: "Rassurer la nuit.",
    category: "soir",
    items: [
      { label: "Ce soir, je dors dans mon lit." },
      { label: "Papa ou maman est juste à côté, dans la maison." },
      { label: "J'ai ma veilleuse et mon doudou." },
      { label: "Si j'ai peur, je peux serrer mon doudou et souffler." },
      { label: "Le matin, on se retrouve." },
    ],
  },
  {
    slug: "histoire-attendre",
    type: "histoire",
    title: "J'attends mon tour",
    description: "Apprendre l'attente sans angoisse.",
    category: "emotions",
    items: [
      { label: "Parfois, je dois attendre." },
      { label: "Attendre, c'est difficile. C'est normal." },
      { label: "Je peux compter, regarder le sablier ou tenir un objet." },
      { label: "Quand c'est mon tour, on me le dit." },
      { label: "J'ai réussi à attendre. Je suis fier." },
    ],
  },
  {
    slug: "histoire-partager",
    type: "histoire",
    title: "Je partage un jeu",
    description: "Jouer à deux, chacun son tour.",
    category: "emotions",
    items: [
      { label: "J'aime beaucoup mon jeu." },
      { label: "Parfois, un autre enfant veut jouer aussi." },
      { label: "On peut jouer chacun son tour." },
      { label: "Partager ne veut pas dire perdre mon jeu." },
      { label: "Après, mon jeu revient." },
    ],
  },
  {
    slug: "histoire-rentree",
    type: "histoire",
    title: "Le jour de la rentrée",
    description: "Rendre l'inconnu prévisible.",
    category: "ecole",
    items: [
      { label: "Demain, c'est la rentrée." },
      { label: "Je retrouve ma classe et ma maîtresse." },
      { label: "Il y aura peut-être du bruit. Je peux mettre mon casque." },
      { label: "Si je suis inquiet, je peux le dire à un adulte." },
      { label: "Le soir, je rentre à la maison." },
    ],
  },
  {
    slug: "histoire-cantine",
    type: "histoire",
    title: "Je mange à la cantine",
    description: "Bruit, file d'attente, plateau.",
    category: "repas",
    items: [
      { label: "À midi, je vais à la cantine." },
      { label: "Je prends un plateau et je fais la file." },
      { label: "Il y a du bruit. Je peux me boucher les oreilles." },
      { label: "Je goûte ce que je veux, je n'ai pas à tout manger." },
      { label: "Après, je vais jouer dehors." },
    ],
  },
  {
    slug: "histoire-transports",
    type: "histoire",
    title: "Je prends le bus",
    description: "Les transports, étape par étape.",
    category: "sorties",
    items: [
      { label: "On attend le bus à l'arrêt." },
      { label: "Le bus arrive, les portes s'ouvrent." },
      { label: "Je m'assois ou je tiens la barre." },
      { label: "Ça bouge un peu, c'est normal." },
      { label: "On descend au bon arrêt." },
    ],
  },
  {
    slug: "histoire-emotions",
    type: "histoire",
    title: "Quand la colère monte",
    description: "Nommer, puis apaiser.",
    category: "emotions",
    items: [
      { label: "Parfois, je sens la colère monter dans mon corps." },
      { label: "Mon ventre serre, mes mains se ferment." },
      { label: "La colère n'est pas interdite." },
      { label: "Je peux dire : « j'ai besoin d'une pause »." },
      { label: "Je souffle. La colère redescend." },
    ],
  },
  {
    slug: "histoire-mordre",
    type: "histoire",
    title: "Mes dents ne mordent pas",
    description: "Remplacer le geste par un autre.",
    category: "emotions",
    items: [
      { label: "Quand je suis très en colère, j'ai envie de mordre." },
      { label: "Mordre fait mal aux autres." },
      { label: "À la place, je peux serrer mon poing ou mon coussin." },
      { label: "Je peux mordre mon objet à mâcher." },
      { label: "Je demande de l'aide à un adulte." },
    ],
  },

  // ---------- Cartes ----------
  {
    slug: "cartes-besoins",
    type: "cartes",
    title: "Cartes « j'ai besoin de »",
    description: "Communiquer sans mots.",
    category: "communication",
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
    slug: "cartes-quotidien",
    type: "cartes",
    title: "Cartes du quotidien",
    description: "Les gestes de la journée.",
    category: "communication",
    items: [
      { label: "Manger" },
      { label: "Boire" },
      { label: "Douche" },
      { label: "Dormir" },
      { label: "Chaussures" },
      { label: "Manteau" },
      { label: "Dents" },
      { label: "École" },
    ],
  },
  {
    slug: "cartes-emotions",
    type: "cartes",
    title: "Cartes émotions",
    description: "Montrer ce que je ressens.",
    category: "emotions",
    items: [
      { label: "Content" },
      { label: "Triste" },
      { label: "En colère" },
      { label: "Fatigué" },
      { label: "Inquiet" },
      { label: "Calme" },
    ],
  },
  {
    slug: "cartes-regulation",
    type: "cartes",
    title: "Cartes stop & calme",
    description: "Poser une limite en douceur.",
    category: "calme",
    items: [
      { label: "Stop" },
      { label: "Attendre" },
      { label: "Doucement" },
      { label: "Calme" },
      { label: "Bravo" },
      { label: "Encore" },
    ],
  },

  // ---------- Check-lists ----------
  {
    slug: "checklist-cartable",
    type: "checklist",
    title: "Mon cartable",
    description: "Vérifier seul avant de partir.",
    category: "ecole",
    items: [
      { label: "Cahier de liaison" },
      { label: "Trousse" },
      { label: "Goûter" },
      { label: "Gourde" },
      { label: "Tenue de sport" },
    ],
  },
  {
    slug: "checklist-sac-sortie",
    type: "checklist",
    title: "Le sac de sortie",
    description: "Ne rien oublier en partant.",
    category: "sorties",
    items: [
      { label: "Eau" },
      { label: "Goûter" },
      { label: "Casque anti-bruit" },
      { label: "Doudou / objet rassurant" },
      { label: "Change" },
      { label: "Cartes de communication" },
    ],
  },
  {
    slug: "checklist-devoirs",
    type: "checklist",
    title: "Mes devoirs sont finis",
    description: "Fermer la boucle sans y revenir.",
    category: "devoirs",
    items: [
      { label: "J'ai lu la consigne" },
      { label: "J'ai fait les exercices" },
      { label: "J'ai relu" },
      { label: "J'ai signé le cahier" },
      { label: "J'ai rangé mon cartable" },
    ],
  },
  {
    slug: "checklist-chambre",
    type: "checklist",
    title: "Je range ma chambre",
    description: "Découper une tâche trop grande.",
    category: "soir",
    items: [
      { label: "Les livres sur l'étagère" },
      { label: "Les jouets dans la caisse" },
      { label: "Les habits dans le panier" },
      { label: "Le lit remonté" },
      { label: "Le sol dégagé" },
    ],
  },

  // ---------- Emplois du temps ----------
  {
    slug: "edt-journee",
    type: "emploi-du-temps",
    title: "Ma journée",
    description: "Repères horaires visuels.",
    category: "ecole",
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
  {
    slug: "edt-semaine",
    type: "emploi-du-temps",
    title: "Ma semaine",
    description: "Savoir ce qui arrive demain.",
    category: "ecole",
    items: [
      { label: "Lundi — école" },
      { label: "Mardi — école + orthophonie" },
      { label: "Mercredi — maison" },
      { label: "Jeudi — école" },
      { label: "Vendredi — école" },
      { label: "Samedi — sortie" },
      { label: "Dimanche — maison" },
    ],
  },
  {
    slug: "edt-weekend",
    type: "emploi-du-temps",
    title: "Mon week-end",
    description: "Les jours sans école, quand même prévisibles.",
    category: "sorties",
    items: [
      { label: "Matin tranquille", time: "09:00" },
      { label: "Activité dehors", time: "10:30" },
      { label: "Déjeuner", time: "12:30" },
      { label: "Temps calme", time: "14:00" },
      { label: "Jeu libre", time: "16:00" },
      { label: "Dîner", time: "19:00" },
    ],
  },
  {
    slug: "edt-matin",
    type: "emploi-du-temps",
    title: "Mon matin en images",
    description: "Le matin, minute par minute.",
    category: "matin",
    items: [
      { label: "Réveil", time: "07:00" },
      { label: "Habillage", time: "07:15" },
      { label: "Petit-déjeuner", time: "07:30" },
      { label: "Dents", time: "07:50" },
      { label: "Départ", time: "08:10" },
    ],
  },

  // ---------- Récompenses ----------
  {
    slug: "recompenses-semaine",
    type: "recompenses",
    title: "Mes étoiles de la semaine",
    description: "Cinq objectifs, une récompense.",
    category: "matin",
    items: [
      { label: "Je me lève à l'heure" },
      { label: "Je m'habille seul" },
      { label: "Je range mes affaires" },
      { label: "Je demande de l'aide avec des mots" },
      { label: "Je vais au lit calmement" },
    ],
  },
  {
    slug: "recompenses-soleils",
    type: "recompenses",
    title: "Mes soleils du soir",
    description: "Valoriser la fin de journée.",
    category: "soir",
    items: [
      { label: "Je passe à table sans crise" },
      { label: "Je prends ma douche" },
      { label: "Je mets mon pyjama seul" },
      { label: "Je reste dans mon lit" },
    ],
  },
  {
    slug: "recompenses-devoirs",
    type: "recompenses",
    title: "Mes fleurs de devoirs",
    description: "Un point par séance terminée.",
    category: "devoirs",
    items: [
      { label: "Je commence sans discuter" },
      { label: "Je demande de l'aide calmement" },
      { label: "Je fais une pause quand je le sens" },
      { label: "Je termine ce qui était prévu" },
    ],
  },
  {
    slug: "recompenses-calme",
    type: "recompenses",
    title: "Mes victoires de calme",
    description: "Valoriser la régulation, pas l'obéissance.",
    category: "calme",
    items: [
      { label: "J'ai dit ce que je ressentais" },
      { label: "J'ai demandé une pause" },
      { label: "J'ai soufflé avant de crier" },
      { label: "Je suis allé dans mon coin doux" },
    ],
  },

  // ---------- Activités ----------
  {
    slug: "activite-pate-a-modeler",
    type: "activite",
    title: "Pâte à modeler apaisante",
    description: "Sensoriel · 15 min · pâte à modeler",
    category: "sensoriel",
    ages: "3-8 ans",
    items: [
      { label: "Matériel : pâte à modeler, un rouleau" },
      { label: "Objectif : relâcher les tensions par les mains" },
      { label: "On malaxe lentement, sans consigne" },
      { label: "On roule un long boudin" },
      { label: "On écrase avec la paume" },
      { label: "On range ensemble" },
    ],
  },
  {
    slug: "activite-parcours-moteur",
    type: "activite",
    title: "Parcours dans le salon",
    description: "Motricité · 20 min · coussins",
    category: "motricite",
    ages: "3-10 ans",
    items: [
      { label: "Matériel : coussins, ruban adhésif, chaise" },
      { label: "Objectif : dépenser l'énergie avant le calme" },
      { label: "Sauter de coussin en coussin" },
      { label: "Passer sous la chaise" },
      { label: "Marcher sur la ligne d'adhésif" },
      { label: "Finir allongé, on souffle" },
    ],
  },
  {
    slug: "activite-souffle-bougie",
    type: "activite",
    title: "La bougie imaginaire",
    description: "Retour au calme · 5 min · sans matériel",
    category: "calme",
    ages: "3 ans et +",
    items: [
      { label: "Matériel : aucun" },
      { label: "Objectif : ralentir la respiration" },
      { label: "On lève un doigt : c'est la bougie" },
      { label: "On inspire par le nez" },
      { label: "On souffle doucement pour ne pas l'éteindre" },
      { label: "On recommence cinq fois" },
    ],
  },
  {
    slug: "activite-boite-sensorielle",
    type: "activite",
    title: "Boîte à toucher",
    description: "Sensoriel · 15 min · boîte + objets",
    category: "sensoriel",
    ages: "4-10 ans",
    items: [
      { label: "Matériel : une boîte, des objets de textures variées" },
      { label: "Objectif : mettre des mots sur les sensations" },
      { label: "On met la main sans regarder" },
      { label: "On décrit : doux, piquant, froid" },
      { label: "On devine l'objet" },
      { label: "On échange les rôles" },
    ],
  },
  {
    slug: "activite-memory-emotions",
    type: "activite",
    title: "Memory des émotions",
    description: "Émotions · 20 min · cartes émotions",
    category: "emotions",
    ages: "4-10 ans",
    items: [
      { label: "Matériel : les cartes émotions imprimées en double" },
      { label: "Objectif : reconnaître et nommer les émotions" },
      { label: "On mélange les cartes face cachée" },
      { label: "Chacun retourne deux cartes" },
      { label: "Quand la paire est trouvée, on raconte une fois où on l'a ressentie" },
    ],
  },
  {
    slug: "activite-lsf-quotidien",
    type: "activite",
    title: "Cinq signes du quotidien",
    description: "Communication · 10 min · sans matériel",
    category: "communication",
    ages: "2 ans et +",
    items: [
      { label: "Matériel : aucun" },
      { label: "Objectif : offrir un autre canal que la parole" },
      { label: "Apprendre : manger" },
      { label: "Apprendre : boire" },
      { label: "Apprendre : encore" },
      { label: "Apprendre : fini" },
      { label: "Apprendre : aide" },
    ],
  },
  {
    slug: "activite-concentration-5",
    type: "activite",
    title: "Cinq choses autour de moi",
    description: "Concentration · 5 min · sans matériel",
    category: "calme",
    ages: "5 ans et +",
    items: [
      { label: "Matériel : aucun" },
      { label: "Objectif : revenir dans l'instant" },
      { label: "Je vois cinq choses" },
      { label: "J'entends quatre sons" },
      { label: "Je touche trois matières" },
      { label: "Je sens deux odeurs" },
      { label: "Je respire une fois profondément" },
    ],
  },
  {
    slug: "activite-sans-ecran",
    type: "activite",
    title: "Chasse au trésor maison",
    description: "Sans écran · 30 min · papier",
    category: "motricite",
    ages: "4-11 ans",
    items: [
      { label: "Matériel : papier, crayon" },
      { label: "Objectif : jouer ensemble sans écran" },
      { label: "On dessine six indices simples" },
      { label: "On cache un petit trésor" },
      { label: "L'enfant cherche indice par indice" },
      { label: "On célèbre la trouvaille" },
    ],
  },
];

/**
 * Situations fréquentes proposées en Mode Crise :
 * le parent stressé choisit, il n'écrit pas.
 */
export type CrisisSituation = { key: string; label: string; prompt: string };

export const CRISIS_SITUATIONS: CrisisSituation[] = [
  {
    key: "sensorielle",
    label: "Crise sensorielle (bruit, lumière, foule)",
    prompt: "Mon enfant est en crise sensorielle : trop de bruit, trop de monde, il ne supporte plus.",
  },
  {
    key: "refus-partir",
    label: "Refus de partir / de s'arrêter",
    prompt: "Mon enfant refuse de partir, il ne veut pas arrêter ce qu'il fait.",
  },
  {
    key: "colere",
    label: "Colère, cris, opposition",
    prompt: "Mon enfant est en colère, il crie et refuse tout ce que je propose.",
  },
  {
    key: "angoisse",
    label: "Angoisse, peur, panique",
    prompt: "Mon enfant est très angoissé, il a peur et n'arrive pas à se calmer.",
  },
  {
    key: "habillage",
    label: "Difficulté à s'habiller",
    prompt: "L'habillage est très difficile, mon enfant refuse de mettre ses vêtements.",
  },
  {
    key: "coucher",
    label: "Coucher impossible",
    prompt: "Le coucher se termine en crise, mon enfant ne veut pas rester dans son lit.",
  },
  {
    key: "devoirs",
    label: "Devoirs qui explosent",
    prompt: "Les devoirs se terminent toujours en cris et en larmes.",
  },
  {
    key: "repas",
    label: "Repas très difficile",
    prompt: "Le repas est très difficile, mon enfant refuse de venir à table et de manger.",
  },
];

/** Gestes immédiats, non médicaux : juste ce qui aide à traverser la minute. */
export const CRISIS_FIRST_STEPS: Record<string, string[]> = {
  sensorielle: [
    "Baisse le bruit et la lumière, ou sors de la pièce.",
    "Propose le casque, la capuche, une couverture.",
    "Parle moins, plus bas, plus lentement.",
  ],
  "refus-partir": [
    "Annonce la fin avec un repère visible (sablier, minuteur).",
    "Propose deux choix seulement.",
    "Nomme ce qui vient après : « ensuite, on… ».",
  ],
  colere: [
    "Mets-toi à sa hauteur, sans le toucher tout de suite.",
    "Nomme l'émotion : « tu es très en colère ».",
    "Attends. La colère redescend toujours.",
  ],
  angoisse: [
    "Rappelle-lui que tu restes là.",
    "Respire lentement à côté de lui, il copiera.",
    "Donne un repère concret : « après, on rentre à la maison ».",
  ],
  habillage: [
    "Réduis à un vêtement à la fois.",
    "Vérifie les étiquettes, coutures, matières.",
    "Propose de le faire dans l'ordre de sa routine imprimée.",
  ],
  coucher: [
    "Baisse la lumière dès maintenant.",
    "Reprends la routine du soir, dans le même ordre.",
    "Reste près de la porte plutôt que de partir d'un coup.",
  ],
  devoirs: [
    "Arrête cinq minutes. Vraiment.",
    "Coupe la tâche en une seule ligne à faire.",
    "Reprends avec la check-list, pas avec le cahier entier.",
  ],
  repas: [
    "N'insiste pas sur la quantité.",
    "Annonce le repas avec la carte ou la routine.",
    "Autorise un aliment sûr dans l'assiette.",
  ],
};

/** Fallback local : si l'IA n'est pas disponible, on propose quand même des modèles pertinents. */
export const CRISIS_TEMPLATE_MAP: Record<string, string[]> = {
  sensorielle: ["routine-calme", "cartes-besoins", "activite-souffle-bougie"],
  "refus-partir": ["routine-sortie", "cartes-regulation", "edt-journee"],
  colere: ["histoire-emotions", "routine-calme", "recompenses-calme"],
  angoisse: ["histoire-attendre", "activite-concentration-5", "cartes-emotions"],
  habillage: ["routine-matin", "checklist-cartable", "recompenses-semaine"],
  coucher: ["routine-soir", "histoire-dormir-seul", "recompenses-soleils"],
  devoirs: ["routine-devoirs", "checklist-devoirs", "recompenses-devoirs"],
  repas: ["routine-repas", "histoire-cantine", "cartes-quotidien"],
};

export const templateBySlug = (slug: string) =>
  SUPPORT_TEMPLATES.find((t) => t.slug === slug);
