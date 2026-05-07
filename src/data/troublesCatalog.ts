// Catalogue des troubles couverts dans "Liés autrement > Ressources".
// Contenu volontairement sobre et factuel, ressources françaises officielles.

export type TroubleResource = {
  label: string;
  description?: string;
  url?: string;
  phone?: string;
};

export type Trouble = {
  key: string;
  title: string;
  short: string;
  summary: string;
  resources: TroubleResource[];
};

export const TROUBLES: Trouble[] = [
  {
    key: "tsa",
    title: "TSA — Trouble du Spectre de l'Autisme",
    short: "Particularités sensorielles, sociales et de communication.",
    summary:
      "Le TSA regroupe des particularités neurodéveloppementales qui touchent la communication, les interactions sociales et le rapport sensoriel au monde. Chaque enfant a un profil unique, parfois associé à de grandes forces (mémoire, intérêts profonds, logique).",
    resources: [
      { label: "Autisme France", description: "Association nationale, antennes locales.", url: "https://www.autisme-france.fr" },
      { label: "GNCRA — réseau des CRA", description: "Centres Ressources Autisme régionaux.", url: "https://gncra.fr" },
      { label: "Autisme Info Service", description: "Ligne nationale d'information.", phone: "0800 71 40 40", url: "https://www.autismeinfoservice.fr" },
    ],
  },
  {
    key: "tdah",
    title: "TDAH — Trouble Déficit de l'Attention avec ou sans Hyperactivité",
    short: "Difficultés d'attention, d'impulsivité, parfois agitation motrice.",
    summary:
      "Le TDAH est un trouble neurodéveloppemental qui affecte la capacité à maintenir l'attention, à inhiber les impulsions et à réguler son énergie. Il peut s'accompagner de grandes capacités créatives et d'une intensité émotionnelle marquée.",
    resources: [
      { label: "HyperSupers TDAH France", url: "https://www.tdah-france.fr" },
      { label: "Tylô TDAH", description: "Ressources pour parents et enseignants.", url: "https://www.tdah-tylo.fr" },
    ],
  },
  {
    key: "dys",
    title: "DYS — Dyslexie, dyspraxie, dysphasie, dyscalculie…",
    short: "Troubles spécifiques des apprentissages.",
    summary:
      "Les troubles « DYS » désignent des difficultés durables et spécifiques d'un apprentissage (lecture, coordination, langage oral, calcul, écriture…). Un diagnostic précis et des aménagements scolaires changent profondément le parcours.",
    resources: [
      { label: "Fédération Française des DYS", url: "https://www.ffdys.com" },
      { label: "ANAPEDYS", description: "Association nationale des associations DYS.", url: "https://www.anapedys.org" },
    ],
  },
  {
    key: "tdi",
    title: "TDI — Trouble du Développement Intellectuel",
    short: "Anciennement « déficience intellectuelle ».",
    summary:
      "Le TDI désigne un fonctionnement intellectuel global plus lent, qui demande un accompagnement adapté pour les apprentissages, l'autonomie et la vie sociale. Les profils sont très variés et évoluent avec l'environnement et les soutiens.",
    resources: [
      { label: "Unapei", description: "Mouvement parental autour du handicap intellectuel.", url: "https://www.unapei.org" },
      { label: "Trisomie 21 France", url: "https://www.trisomie21-france.org" },
    ],
  },
  {
    key: "tsl",
    title: "TSL — Trouble du Spectre du Langage / TDL",
    short: "Difficultés durables du langage oral.",
    summary:
      "Le TDL (Trouble Développemental du Langage) affecte la compréhension ou l'expression orale. Il n'est pas lié à l'intelligence et nécessite un accompagnement orthophonique régulier ainsi que des aménagements scolaires.",
    resources: [
      { label: "AAD France — Association Avenir Dysphasie", url: "https://www.dysphasie.org" },
      { label: "FNO — Fédération Nationale des Orthophonistes", url: "https://www.fno.fr" },
    ],
  },
  {
    key: "troubles-sensoriels",
    title: "Troubles sensoriels (TIS / TTS)",
    short: "Hyper- ou hypo-réactivité aux stimuli sensoriels.",
    summary:
      "Certains enfants perçoivent les sons, lumières, textures, odeurs ou contacts avec une intensité différente. Cela peut provoquer des évitements, des recherches sensorielles, ou des crises lorsque l'environnement devient trop stimulant.",
    resources: [
      { label: "ANFE — ergothérapeutes", url: "https://anfe.fr" },
      { label: "Réseau Lucioles", description: "Ressources handicap sévère et sensoriel.", url: "https://www.reseau-lucioles.org" },
    ],
  },
  {
    key: "troubles-emotionnels",
    title: "Troubles émotionnels et comportementaux",
    short: "Régulation difficile des émotions, opposition, anxiété.",
    summary:
      "Ces troubles regroupent des difficultés persistantes à gérer les émotions intenses, à supporter la frustration, ou à entrer en relation. Ils méritent un regard bienveillant et un accompagnement professionnel (pédopsychiatre, psychologue, CMP).",
    resources: [
      { label: "Fil Santé Jeunes", phone: "0 800 235 236", url: "https://www.filsantejeunes.com" },
      { label: "Annuaire des CMP", url: "https://annuaire.action-sociale.org/?cat=centre-medico-psychologique-c-m-p--209.html" },
    ],
  },
  {
    key: "epilepsie",
    title: "Épilepsie",
    short: "Crises neurologiques répétées, formes très variées.",
    summary:
      "L'épilepsie regroupe différentes formes de crises (absences, tonico-cloniques, partielles…). Le diagnostic et le suivi neurologique sont essentiels. Beaucoup d'enfants vivent une scolarité ordinaire avec un PAI adapté.",
    resources: [
      { label: "Épilepsie-France", url: "https://www.epilepsie-france.com" },
      { label: "Fondation Française pour la Recherche sur l'Épilepsie", url: "https://www.fondation-epilepsie.fr" },
    ],
  },
  {
    key: "handicap-moteur",
    title: "Handicap moteur",
    short: "Limitations motrices, équipements, accessibilité.",
    summary:
      "Le handicap moteur recouvre des situations très diverses : paralysie cérébrale, myopathies, suites d'accident… L'accompagnement combine soins, équipements, accessibilité du domicile et de l'école, et soutien psychologique pour la famille.",
    resources: [
      { label: "APF France handicap", url: "https://www.apf-francehandicap.org" },
      { label: "AFM-Téléthon", url: "https://www.afm-telethon.fr" },
    ],
  },
  {
    key: "surdite",
    title: "Surdité / malentendance",
    short: "De la surdité légère à la surdité profonde.",
    summary:
      "La surdité demande un repérage précoce et un choix éclairé entre approches (LSF, LfPC, oralisme, bilingue). Chaque enfant et chaque famille construit son propre chemin de communication.",
    resources: [
      { label: "FNSF — Fédération Nationale des Sourds de France", url: "https://www.fnsf.org" },
      { label: "ANPEDA", description: "Parents d'enfants déficients auditifs.", url: "https://www.anpeda.fr" },
    ],
  },
  {
    key: "troubles-rares",
    title: "Troubles rares ou non diagnostiqués",
    short: "Quand le diagnostic met du temps à venir.",
    summary:
      "De nombreux enfants présentent un tableau qui ne « rentre dans aucune case ». Cette errance diagnostique est éprouvante. Des centres de référence et des associations existent pour accompagner les familles dans cette période.",
    resources: [
      { label: "Alliance Maladies Rares", url: "https://www.alliance-maladies-rares.org" },
      { label: "Orphanet", description: "Portail des maladies rares et médicaments orphelins.", url: "https://www.orpha.net" },
      { label: "Maladies Rares Info Services", phone: "01 56 53 81 36", url: "https://www.maladiesraresinfo.org" },
    ],
  },
];
