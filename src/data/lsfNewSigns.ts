// 80 nouveaux signes LSF — 20 par thème.
// Pas d'illustration dédiée : on s'appuie sur l'emoji (rendu via fallback dans la fiche).
// Les `key` sont préfixées `new-` pour ne pas entrer en collision avec lsfCatalog.ts
// et restent stables (utilisées par lsf_progress.sign_key).

export type LsfNewSign = {
  key: string;
  label: string;
  gesture: string;
  emoji: string;
  themeSlug: "bebe-besoins" | "emotions" | "routine" | "famille";
};

export type LsfNewThemeMeta = {
  slug: LsfNewSign["themeSlug"];
  title: string;
  emoji: string;
};

export const LSF_NEW_THEMES: LsfNewThemeMeta[] = [
  { slug: "bebe-besoins", title: "Bébé & besoins", emoji: "🍼" },
  { slug: "emotions", title: "Émotions", emoji: "💗" },
  { slug: "routine", title: "Routine quotidienne", emoji: "☀️" },
  { slug: "famille", title: "Famille & entourage", emoji: "👨‍👩‍👧" },
];

export const LSF_NEW_SIGNS: LsfNewSign[] = [
  // ─── Bébé & besoins (20) ───────────────────────────────────────────────
  { key: "new-bebe-pipi", label: "Pipi", gesture: "Index pointé vers le bas qui s'agite légèrement à hauteur de bassin.", emoji: "🚽", themeSlug: "bebe-besoins" },
  { key: "new-bebe-caca", label: "Caca", gesture: "Pouce qui sort du poing fermé, paume vers le bas, comme une chute.", emoji: "💩", themeSlug: "bebe-besoins" },
  { key: "new-bebe-pot", label: "Pot", gesture: "Mains en C qui dessinent un cercle autour du bassin.", emoji: "🪣", themeSlug: "bebe-besoins" },
  { key: "new-bebe-asseoir", label: "S'asseoir", gesture: "Index et majeur d'une main qui se posent sur l'index tendu de l'autre.", emoji: "🪑", themeSlug: "bebe-besoins" },
  { key: "new-bebe-debout", label: "Debout", gesture: "Index et majeur d'une main qui se redressent sur la paume de l'autre.", emoji: "🧍", themeSlug: "bebe-besoins" },
  { key: "new-bebe-marcher", label: "Marcher", gesture: "Index et majeur qui avancent en alternance sur la paume opposée.", emoji: "🚶", themeSlug: "bebe-besoins" },
  { key: "new-bebe-ramper", label: "Ramper", gesture: "Main à plat qui ondule en avançant lentement devant le buste.", emoji: "🐛", themeSlug: "bebe-besoins" },
  { key: "new-bebe-tomber", label: "Tomber", gesture: "Index et majeur dressés qui basculent et retombent sur la paume.", emoji: "⤵️", themeSlug: "bebe-besoins" },
  { key: "new-bebe-prendre", label: "Prendre", gesture: "Main ouverte qui se referme en pince devant soi.", emoji: "🤲", themeSlug: "bebe-besoins" },
  { key: "new-bebe-donner", label: "Donner", gesture: "Main paume vers le haut qui s'avance vers l'autre personne.", emoji: "🎁", themeSlug: "bebe-besoins" },
  { key: "new-bebe-partager", label: "Partager", gesture: "Main à plat qui balaye horizontalement entre soi et l'autre.", emoji: "🤝", themeSlug: "bebe-besoins" },
  { key: "new-bebe-lait", label: "Lait", gesture: "Poing fermé qui se serre et se relâche, comme une traite.", emoji: "🥛", themeSlug: "bebe-besoins" },
  { key: "new-bebe-eau", label: "Eau", gesture: "Main en W (3 doigts) qui tapote le menton.", emoji: "💧", themeSlug: "bebe-besoins" },
  { key: "new-bebe-pain", label: "Pain", gesture: "Main qui mime de couper une miche posée sur l'avant-bras.", emoji: "🍞", themeSlug: "bebe-besoins" },
  { key: "new-bebe-fruit", label: "Fruit", gesture: "Main en pince qui tourne près de la joue, comme cueillir.", emoji: "🍎", themeSlug: "bebe-besoins" },
  { key: "new-bebe-legume", label: "Légume", gesture: "Main en V qui tapote la joue puis le coin de la bouche.", emoji: "🥕", themeSlug: "bebe-besoins" },
  { key: "new-bebe-fromage", label: "Fromage", gesture: "Paume contre paume, mouvement de presse circulaire.", emoji: "🧀", themeSlug: "bebe-besoins" },
  { key: "new-bebe-yaourt", label: "Yaourt", gesture: "Main qui mime une cuillère qui racle un pot tenu dans l'autre main.", emoji: "🥣", themeSlug: "bebe-besoins" },
  { key: "new-bebe-soupe", label: "Soupe", gesture: "Main qui mime une cuillère portée à la bouche, paume vers le haut.", emoji: "🍲", themeSlug: "bebe-besoins" },
  { key: "new-bebe-gateau", label: "Gâteau", gesture: "Main en C qui se pose deux fois sur la paume opposée.", emoji: "🍰", themeSlug: "bebe-besoins" },

  // ─── Émotions (20) ─────────────────────────────────────────────────────
  { key: "new-emo-anxieux", label: "Anxieux", gesture: "Mains en griffe qui vibrent doucement devant la poitrine.", emoji: "😬", themeSlug: "emotions" },
  { key: "new-emo-serein", label: "Serein", gesture: "Main à plat qui descend très lentement devant le visage, expiration.", emoji: "😌", themeSlug: "emotions" },
  { key: "new-emo-enerve", label: "Énervé", gesture: "Mains poings fermés qui font de petits cercles serrés près du buste.", emoji: "😤", themeSlug: "emotions" },
  { key: "new-emo-motive", label: "Motivé", gesture: "Poing fermé qui monte vivement à hauteur d'épaule.", emoji: "🚀", themeSlug: "emotions" },
  { key: "new-emo-decourage", label: "Découragé", gesture: "Mains à plat qui retombent lentement le long du buste.", emoji: "😔", themeSlug: "emotions" },
  { key: "new-emo-espoir", label: "Espoir", gesture: "Mains croisées sur le cœur puis qui s'ouvrent vers l'avant.", emoji: "🌅", themeSlug: "emotions" },
  { key: "new-emo-gratitude", label: "Gratitude", gesture: "Bouts des doigts qui partent du cœur vers l'avant, paume ouverte.", emoji: "🙏", themeSlug: "emotions" },
  { key: "new-emo-tendresse", label: "Tendresse", gesture: "Dos de la main qui caresse doucement l'autre joue.", emoji: "🥰", themeSlug: "emotions" },
  { key: "new-emo-panique", label: "Panique", gesture: "Mains ouvertes qui s'agitent vivement de chaque côté de la tête.", emoji: "😱", themeSlug: "emotions" },
  { key: "new-emo-irrite", label: "Irrité", gesture: "Index qui gratte rapidement la joue, sourcils froncés.", emoji: "😒", themeSlug: "emotions" },
  { key: "new-emo-apaise", label: "Apaisé", gesture: "Mains à plat qui descendent l'une après l'autre devant le buste.", emoji: "🌿", themeSlug: "emotions" },
  { key: "new-emo-curieux", label: "Curieux", gesture: "Index qui dessine un petit cercle près de l'œil, tête penchée.", emoji: "🧐", themeSlug: "emotions" },
  { key: "new-emo-impatient", label: "Impatient", gesture: "Doigts qui pianotent rapidement sur la paume opposée.", emoji: "⏱️", themeSlug: "emotions" },
  { key: "new-emo-soulage", label: "Soulagé", gesture: "Mains à plat qui descendent en expiration ample devant le torse.", emoji: "😮‍💨", themeSlug: "emotions" },
  { key: "new-emo-emerveille", label: "Émerveillé", gesture: "Mains ouvertes qui s'écartent lentement à hauteur des yeux.", emoji: "✨", themeSlug: "emotions" },
  { key: "new-emo-coupable", label: "Coupable", gesture: "Index qui touche la poitrine puis se baisse doucement.", emoji: "😞", themeSlug: "emotions" },
  { key: "new-emo-tendu", label: "Tendu", gesture: "Mains poings fermés qui se contractent près des épaules.", emoji: "😣", themeSlug: "emotions" },
  { key: "new-emo-detendu", label: "Détendu", gesture: "Mains ouvertes qui retombent mollement le long du buste.", emoji: "😎", themeSlug: "emotions" },
  { key: "new-emo-perdu", label: "Perdu", gesture: "Index qui tourne lentement devant le visage avec regard hésitant.", emoji: "🌫️", themeSlug: "emotions" },
  { key: "new-emo-en-securite", label: "En sécurité", gesture: "Bras croisés qui enveloppent doucement la poitrine.", emoji: "🛡️", themeSlug: "emotions" },

  // ─── Routine quotidienne (20) ──────────────────────────────────────────
  { key: "new-rou-sieste", label: "Sieste", gesture: "Main à plat contre la joue, courte inclinaison de tête.", emoji: "🛏️", themeSlug: "routine" },
  { key: "new-rou-petit-dej", label: "Petit-déjeuner", gesture: "Main qui porte une tasse imaginaire à la bouche, le matin.", emoji: "🥐", themeSlug: "routine" },
  { key: "new-rou-dejeuner", label: "Déjeuner", gesture: "Main en cuillère qui va à la bouche, midi.", emoji: "🍝", themeSlug: "routine" },
  { key: "new-rou-gouter", label: "Goûter", gesture: "Main en pince qui tapote la joue (gourmandise).", emoji: "🍪", themeSlug: "routine" },
  { key: "new-rou-diner", label: "Dîner", gesture: "Main en cuillère qui va à la bouche, geste plus lent (soir).", emoji: "🍽️", themeSlug: "routine" },
  { key: "new-rou-devoirs", label: "Devoirs", gesture: "Main qui mime l'écriture sur la paume opposée.", emoji: "📚", themeSlug: "routine" },
  { key: "new-rou-sport", label: "Sport", gesture: "Poings fermés qui font un petit mouvement de course.", emoji: "🏃", themeSlug: "routine" },
  { key: "new-rou-piscine", label: "Piscine", gesture: "Mains qui miment une brasse devant la poitrine.", emoji: "🏊", themeSlug: "routine" },
  { key: "new-rou-mer", label: "Mer", gesture: "Main à plat qui ondule horizontalement devant soi.", emoji: "🌊", themeSlug: "routine" },
  { key: "new-rou-montagne", label: "Montagne", gesture: "Mains qui dessinent deux pics pointus devant le visage.", emoji: "⛰️", themeSlug: "routine" },
  { key: "new-rou-vacances", label: "Vacances", gesture: "Mains en V près des tempes qui s'éventent vers l'extérieur.", emoji: "🏖️", themeSlug: "routine" },
  { key: "new-rou-anniversaire", label: "Anniversaire", gesture: "Index qui mime de souffler une bougie devant la bouche.", emoji: "🎂", themeSlug: "routine" },
  { key: "new-rou-fete", label: "Fête", gesture: "Mains en F qui s'agitent joyeusement de chaque côté du visage.", emoji: "🎉", themeSlug: "routine" },
  { key: "new-rou-cadeau", label: "Cadeau", gesture: "Mains en pince qui se croisent, comme nouer un ruban.", emoji: "🎁", themeSlug: "routine" },
  { key: "new-rou-photo", label: "Photo", gesture: "Mains qui miment un viseur d'appareil devant l'œil.", emoji: "📷", themeSlug: "routine" },
  { key: "new-rou-telephone", label: "Téléphone", gesture: "Pouce et auriculaire écartés, portés à l'oreille.", emoji: "📞", themeSlug: "routine" },
  { key: "new-rou-tablette", label: "Tablette", gesture: "Main à plat horizontale, l'autre index qui tapote dessus.", emoji: "📱", themeSlug: "routine" },
  { key: "new-rou-velo", label: "Vélo", gesture: "Poings fermés qui pédalent en cercle devant le buste.", emoji: "🚲", themeSlug: "routine" },
  { key: "new-rou-bus", label: "Bus", gesture: "Mains qui tiennent un grand volant et tournent largement.", emoji: "🚌", themeSlug: "routine" },
  { key: "new-rou-medecin", label: "Aller chez le médecin", gesture: "Index et majeur qui tapotent l'intérieur du poignet, geste répété.", emoji: "🩺", themeSlug: "routine" },

  // ─── Famille & entourage (20) ──────────────────────────────────────────
  { key: "new-fam-beau-pere", label: "Beau-père", gesture: "Pouce au front (papa) puis index qui glisse vers l'extérieur.", emoji: "👨", themeSlug: "famille" },
  { key: "new-fam-belle-mere", label: "Belle-mère", gesture: "Doigts à la joue (maman) puis index qui glisse vers l'extérieur.", emoji: "👩", themeSlug: "famille" },
  { key: "new-fam-demi-frere", label: "Demi-frère", gesture: "Signe « frère » suivi d'un mouvement de coupe verticale.", emoji: "🧒", themeSlug: "famille" },
  { key: "new-fam-demi-soeur", label: "Demi-sœur", gesture: "Signe « sœur » suivi d'un mouvement de coupe verticale.", emoji: "👧", themeSlug: "famille" },
  { key: "new-fam-parrain", label: "Parrain", gesture: "Pouce au front, puis main qui se pose sur l'épaule.", emoji: "🎩", themeSlug: "famille" },
  { key: "new-fam-marraine", label: "Marraine", gesture: "Doigts à la joue, puis main qui se pose sur l'épaule.", emoji: "👒", themeSlug: "famille" },
  { key: "new-fam-jumeau", label: "Jumeau", gesture: "Index et majeur en V qui tapotent deux fois la joue.", emoji: "👯", themeSlug: "famille" },
  { key: "new-fam-jumelle", label: "Jumelle", gesture: "Index et majeur en V qui tapotent deux fois la joue, côté féminin.", emoji: "👯‍♀️", themeSlug: "famille" },
  { key: "new-fam-neveu", label: "Neveu", gesture: "Main en N qui s'éloigne de la tempe vers l'avant.", emoji: "🧑", themeSlug: "famille" },
  { key: "new-fam-niece", label: "Nièce", gesture: "Main en N qui s'éloigne de la joue vers l'avant.", emoji: "👧", themeSlug: "famille" },
  { key: "new-fam-arriere-grand", label: "Arrière-grand-parent", gesture: "Signe « grand-parent » suivi d'un recul de la main vers l'arrière.", emoji: "👵", themeSlug: "famille" },
  { key: "new-fam-conjoint", label: "Conjoint·e", gesture: "Index crochetés qui s'enlacent fermement devant la poitrine.", emoji: "💑", themeSlug: "famille" },
  { key: "new-fam-classe", label: "Classe (camarades)", gesture: "Mains en C qui dessinent un cercle large devant le buste.", emoji: "🏫", themeSlug: "famille" },
  { key: "new-fam-equipe-sport", label: "Équipe de sport", gesture: "Mains en E qui se rejoignent, suivies d'un poing levé.", emoji: "⚽", themeSlug: "famille" },
  { key: "new-fam-entraineur", label: "Entraîneur", gesture: "Main à plat qui frappe doucement la paume opposée, geste de coach.", emoji: "🏅", themeSlug: "famille" },
  { key: "new-fam-animateur", label: "Animateur", gesture: "Mains ouvertes qui s'agitent joyeusement de chaque côté.", emoji: "🎈", themeSlug: "famille" },
  { key: "new-fam-baby-sitter", label: "Baby-sitter", gesture: "Bras en berceau qui se balancent, suivis d'un signe « payer ».", emoji: "🤱", themeSlug: "famille" },
  { key: "new-fam-professeur", label: "Professeur", gesture: "Main à plat qui sort du front vers l'avant, comme transmettre.", emoji: "👨‍🏫", themeSlug: "famille" },
  { key: "new-fam-medecin-fam", label: "Médecin de famille", gesture: "Index et majeur sur le poignet, suivis du signe « famille ».", emoji: "🩺", themeSlug: "famille" },
  { key: "new-fam-psychologue", label: "Psychologue", gesture: "Main en P qui tapote doucement la tempe.", emoji: "🧠", themeSlug: "famille" },
];

export function filterNewSigns(theme: string | "all", query: string): LsfNewSign[] {
  const q = query.trim().toLowerCase();
  return LSF_NEW_SIGNS.filter((s) => {
    if (theme !== "all" && s.themeSlug !== theme) return false;
    if (!q) return true;
    return s.label.toLowerCase().includes(q) || s.gesture.toLowerCase().includes(q);
  });
}
