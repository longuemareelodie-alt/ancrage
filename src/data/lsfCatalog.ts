// Catalogue LSF v1 — 4 thèmes, 5–8 fiches chacun.
// Les illustrations sont des placeholders emoji ; les vraies illustrations
// seront ajoutées progressivement dans src/assets/lsf/<key>.png.

export type LsfSign = {
  /** Clé stable utilisée comme identifiant en base (lsf_progress.sign_key) */
  key: string;
  /** Mot ou expression signée */
  label: string;
  /** Description du geste, en 1 phrase */
  gesture: string;
  /** Emoji placeholder en attendant l'illustration */
  emoji: string;
};

export type LsfTheme = {
  slug: string;
  title: string;
  description: string;
  emoji: string;
  signs: LsfSign[];
};

export const LSF_THEMES: LsfTheme[] = [
  {
    slug: "bebe-besoins",
    title: "Bébé & besoins",
    description: "Les premiers signes du quotidien pour comprendre ce dont votre enfant a besoin.",
    emoji: "🍼",
    signs: [
      { key: "bebe-manger", label: "Manger", gesture: "Main plate, doigts joints, qui se porte vers la bouche.", emoji: "🍽️" },
      { key: "bebe-boire", label: "Boire", gesture: "Main en forme de C qui s'incline vers la bouche, comme un verre.", emoji: "🥤" },
      { key: "bebe-dormir", label: "Dormir", gesture: "Main posée à plat contre la joue, tête légèrement inclinée.", emoji: "😴" },
      { key: "bebe-encore", label: "Encore", gesture: "Bouts des doigts joints qui se touchent deux fois.", emoji: "🔁" },
      { key: "bebe-fini", label: "Fini", gesture: "Mains ouvertes, paumes vers le bas, qui s'écartent.", emoji: "✅" },
      { key: "bebe-doudou", label: "Doudou", gesture: "Mains croisées sur la poitrine en câlin doux.", emoji: "🧸" },
      { key: "bebe-couche", label: "Couche", gesture: "Mains en pince qui tapotent légèrement le bas du ventre.", emoji: "👶" },
    ],
  },
  {
    slug: "emotions",
    title: "Émotions",
    description: "Mettre des mots sur ce que ressent l'enfant — et ce que vous ressentez aussi.",
    emoji: "💗",
    signs: [
      { key: "emo-content", label: "Content", gesture: "Main qui remonte le long du torse en remontant le sourire.", emoji: "😊" },
      { key: "emo-triste", label: "Triste", gesture: "Doigts qui descendent doucement le long des joues.", emoji: "😢" },
      { key: "emo-colere", label: "Colère", gesture: "Main en griffe qui se referme devant la poitrine.", emoji: "😠" },
      { key: "emo-peur", label: "Peur", gesture: "Mains ouvertes qui viennent se rapprocher de la poitrine.", emoji: "😨" },
      { key: "emo-calme", label: "Calme", gesture: "Mains à plat qui descendent lentement devant le buste.", emoji: "🌿" },
      { key: "emo-aime", label: "J'aime / amour", gesture: "Mains croisées sur le cœur.", emoji: "❤️" },
    ],
  },
  {
    slug: "routine",
    title: "Routine quotidienne",
    description: "Les signes pour rythmer la journée et anticiper les transitions.",
    emoji: "☀️",
    signs: [
      { key: "rou-bonjour", label: "Bonjour", gesture: "Main ouverte qui part du front vers l'avant.", emoji: "👋" },
      { key: "rou-merci", label: "Merci", gesture: "Bouts des doigts qui partent du menton vers l'avant.", emoji: "🙏" },
      { key: "rou-bain", label: "Bain", gesture: "Mains poings fermés qui frottent le torse.", emoji: "🛁" },
      { key: "rou-jouer", label: "Jouer", gesture: "Mains en Y qui s'agitent doucement.", emoji: "🧩" },
      { key: "rou-livre", label: "Livre", gesture: "Mains à plat, paumes face à face, qui s'ouvrent comme un livre.", emoji: "📖" },
      { key: "rou-dehors", label: "Dehors / promenade", gesture: "Main qui désigne l'extérieur puis fait un mouvement de marche.", emoji: "🚶" },
      { key: "rou-ecole", label: "École", gesture: "Mains à plat qui se tapent doucement comme un cahier qu'on ouvre.", emoji: "🏫" },
    ],
  },
  {
    slug: "famille",
    title: "Famille & entourage",
    description: "Nommer les personnes qui comptent dans la vie de l'enfant.",
    emoji: "👨‍👩‍👧",
    signs: [
      { key: "fam-maman", label: "Maman", gesture: "Bout des doigts qui touchent la joue, légère caresse.", emoji: "👩" },
      { key: "fam-papa", label: "Papa", gesture: "Pouce qui touche le front (variante : la tempe).", emoji: "👨" },
      { key: "fam-frere", label: "Frère", gesture: "Index pointé vers le menton puis qui se joint à l'autre index.", emoji: "🧒" },
      { key: "fam-soeur", label: "Sœur", gesture: "Index qui suit la mâchoire puis se joint à l'autre index.", emoji: "👧" },
      { key: "fam-grand-parent", label: "Grand-parent", gesture: "Main qui descend du menton en mimant une barbe ou des cheveux.", emoji: "👴" },
      { key: "fam-ami", label: "Ami", gesture: "Index crochetés l'un dans l'autre, à hauteur de poitrine.", emoji: "🤝" },
    ],
  },
];

export const ALL_LSF_SIGNS = LSF_THEMES.flatMap((t) => t.signs.map((s) => ({ ...s, themeSlug: t.slug })));

export function getThemeBySlug(slug: string) {
  return LSF_THEMES.find((t) => t.slug === slug) ?? null;
}
