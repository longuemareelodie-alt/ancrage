export interface EmotionData {
  id: string;
  label: string;
  emoji: string;
  type: "negative" | "positive";
  response: string;
  reassurance: string;
  action: {
    instruction: string;
    details: string;
    duration: string;
  };
}

export const emotions: EmotionData[] = [
  // NEGATIVE
  {
    id: "anxieuse",
    label: "Anxieuse",
    emoji: "😰",
    type: "negative",
    response: "Ton système nerveux est en alerte. Il essaie de te protéger d'un danger qu'il perçoit, même s'il n'y en a pas.",
    reassurance: "Tu n'es pas en danger. Ton corps réagit, c'est tout.",
    action: {
      instruction: "Respire lentement",
      details: "Inspire 4 secondes · Expire 6 secondes · Répète 5 fois",
      duration: "1 min",
    },
  },
  {
    id: "oppressee",
    label: "Oppressée",
    emoji: "😤",
    type: "negative",
    response: "Ton corps porte une charge qu'il n'arrive plus à contenir. Cette pression dans la poitrine, c'est ton système qui demande de l'espace.",
    reassurance: "Tu as le droit de prendre de la place.",
    action: {
      instruction: "Ouvre grand les bras",
      details: "Étire-toi · Bras ouverts · Respire profondément 5 fois",
      duration: "1 min",
    },
  },
  {
    id: "submergee",
    label: "Submergée",
    emoji: "🌊",
    type: "negative",
    response: "Trop d'informations, trop de charge. Ton cerveau n'arrive plus à trier. C'est une réponse normale de surcharge.",
    reassurance: "Tu n'as pas à tout gérer en même temps.",
    action: {
      instruction: "Pose tes deux pieds au sol",
      details: "Sens le sol sous toi · Nomme 3 choses que tu vois · Respire",
      duration: "1 min",
    },
  },
  {
    id: "epuisee",
    label: "Épuisée",
    emoji: "🔋",
    type: "negative",
    response: "Ton système nerveux a trop donné. Il n'a plus l'énergie de réguler. C'est un signal, pas une faiblesse.",
    reassurance: "Ton corps te demande de t'arrêter. Écoute-le.",
    action: {
      instruction: "Main sur le cœur",
      details: "Pose ta main sur ta poitrine · Sens ta respiration · Reste 1 minute",
      duration: "1 min",
    },
  },
  {
    id: "triste",
    label: "Triste",
    emoji: "😢",
    type: "negative",
    response: "La tristesse est une émotion saine. Elle dit que quelque chose compte pour toi. Ton système a besoin de relâcher.",
    reassurance: "Tu as le droit de ressentir ça.",
    action: {
      instruction: "Enveloppe-toi",
      details: "Croise tes bras sur ta poitrine · Serre doucement · Respire",
      duration: "1 min",
    },
  },
  {
    id: "vide",
    label: "Vide",
    emoji: "😶",
    type: "negative",
    response: "Ton système s'est coupé pour tenir. C'est un mécanisme de protection quand tout est trop intense depuis trop longtemps.",
    reassurance: "Tu n'es pas cassée. Tu es en mode survie.",
    action: {
      instruction: "Touche quelque chose de froid",
      details: "Passe tes mains sous l'eau froide · Sens la température · Reviens à toi",
      duration: "30 sec",
    },
  },
  {
    id: "colere",
    label: "En colère intérieure",
    emoji: "😡",
    type: "negative",
    response: "La colère protège une blessure. Ton système dit : « J'ai été dépassée, et personne n'a vu. »",
    reassurance: "Ta colère est légitime. Elle a le droit d'exister.",
    action: {
      instruction: "Serre et relâche tes poings",
      details: "Serre fort 5 secondes · Relâche · Répète 5 fois",
      duration: "1 min",
    },
  },
  {
    id: "perdue",
    label: "Perdue",
    emoji: "🌫️",
    type: "negative",
    response: "Ton cerveau cherche une direction mais il y a trop de bruit. Ce flou est temporaire.",
    reassurance: "Tu n'as pas besoin de tout comprendre maintenant.",
    action: {
      instruction: "Écris une seule chose",
      details: "Prends ton téléphone · Note une pensée · Juste une",
      duration: "30 sec",
    },
  },
  {
    id: "surmenage",
    label: "Surmenage mental",
    emoji: "💭",
    type: "negative",
    response: "Ton cerveau tourne en boucle. Il cherche une sortie, une solution, un contrôle. C'est de la rumination.",
    reassurance: "Tu ne trouveras pas la réponse en réfléchissant plus.",
    action: {
      instruction: "Écris 3 pensées",
      details: "Note les 3 pensées qui tournent · Pose le téléphone · Respire",
      duration: "1 min",
    },
  },
  {
    id: "survie",
    label: "En mode survie",
    emoji: "⚡",
    type: "negative",
    response: "Ton système nerveux est bloqué en alerte permanente. Tu fonctionnes en pilote automatique depuis trop longtemps.",
    reassurance: "Tu as tenu. Et c'est déjà énorme.",
    action: {
      instruction: "Expire très lentement",
      details: "Inspire 3 sec · Expire 8 sec · Répète 4 fois",
      duration: "1 min",
    },
  },
  // POSITIVE
  {
    id: "calme",
    label: "Plus calme",
    emoji: "🕊️",
    type: "positive",
    response: "Ton système nerveux commence à redescendre. C'est un signe que tu retrouves de la régulation.",
    reassurance: "Ce calme t'appartient. Tu l'as créé.",
    action: {
      instruction: "Savoure ce moment",
      details: "Ferme les yeux · Respire 3 fois · Souris légèrement",
      duration: "30 sec",
    },
  },
  {
    id: "apaisee",
    label: "Apaisée",
    emoji: "☁️",
    type: "positive",
    response: "Ton corps a trouvé un espace de sécurité. L'apaisement, c'est ton système qui dit « je peux me relâcher ».",
    reassurance: "Tu mérites ce répit.",
    action: {
      instruction: "Respire avec gratitude",
      details: "Inspire · Pense à une chose positive aujourd'hui · Expire",
      duration: "30 sec",
    },
  },
  {
    id: "stable",
    label: "Stable",
    emoji: "⚖️",
    type: "positive",
    response: "La stabilité émotionnelle, c'est quand ton système nerveux n'est ni en alerte ni en shutdown. Tu es au centre.",
    reassurance: "C'est exactement là où tu dois être.",
    action: {
      instruction: "Ancre ce ressenti",
      details: "Pose tes pieds au sol · Sens ton corps · Dis « je suis là »",
      duration: "30 sec",
    },
  },
  {
    id: "mieux",
    label: "Légèrement mieux",
    emoji: "🌱",
    type: "positive",
    response: "Même un petit mieux, c'est un signal énorme. Ton système nerveux apprend à revenir au calme.",
    reassurance: "Chaque micro-progrès compte.",
    action: {
      instruction: "Note ce progrès",
      details: "Dis-toi « je vais légèrement mieux » · C'est suffisant",
      duration: "15 sec",
    },
  },
  {
    id: "soulagee",
    label: "Soulagée",
    emoji: "😮‍💨",
    type: "positive",
    response: "Le soulagement arrive quand la pression redescend. Ton corps relâche enfin ce qu'il portait.",
    reassurance: "Tu as traversé quelque chose. Et tu es toujours là.",
    action: {
      instruction: "Souffle longuement",
      details: "Un grand soupir · Laisse tout sortir · Recommence",
      duration: "30 sec",
    },
  },
  {
    id: "fiere",
    label: "Fière de moi",
    emoji: "✨",
    type: "positive",
    response: "La fierté, c'est ton système qui reconnaît que tu as fait quelque chose de difficile. C'est précieux.",
    reassurance: "Tu as le droit d'être fière. Vraiment.",
    action: {
      instruction: "Célèbre en silence",
      details: "Souris · Pose ta main sur ton cœur · Dis « bravo »",
      duration: "15 sec",
    },
  },
  {
    id: "claire",
    label: "Plus claire",
    emoji: "💡",
    type: "positive",
    response: "La clarté mentale revient quand le brouillard émotionnel se lève. Ton cerveau retrouve de l'espace.",
    reassurance: "Tu vois plus clair parce que tu as fait le travail.",
    action: {
      instruction: "Écris une intention",
      details: "Note une chose que tu veux faire aujourd'hui · Juste une",
      duration: "30 sec",
    },
  },
  {
    id: "securite",
    label: "En sécurité",
    emoji: "🛡️",
    type: "positive",
    response: "Se sentir en sécurité, c'est le signal le plus profond de régulation. Ton système dit : « je peux me reposer ».",
    reassurance: "Cet espace est à toi.",
    action: {
      instruction: "Reste ici un instant",
      details: "Ne fais rien · Juste respire · Profite",
      duration: "30 sec",
    },
  },
  {
    id: "connectee",
    label: "Connectée à moi",
    emoji: "💜",
    type: "positive",
    response: "La connexion à soi, c'est quand tu entends tes besoins sans les juger. C'est de la présence.",
    reassurance: "Tu es en train de te retrouver.",
    action: {
      instruction: "Écoute ton corps",
      details: "Scanne de la tête aux pieds · Où sens-tu du bien ?",
      duration: "30 sec",
    },
  },
  {
    id: "presente",
    label: "Présente",
    emoji: "🌸",
    type: "positive",
    response: "Être présente, c'est le contraire de la dissociation. Tu es revenue dans ton corps, dans l'instant.",
    reassurance: "Tu es ici. Et c'est exactement ce qu'il faut.",
    action: {
      instruction: "Regarde autour de toi",
      details: "Nomme 3 choses belles autour de toi · Souris",
      duration: "30 sec",
    },
  },
];
