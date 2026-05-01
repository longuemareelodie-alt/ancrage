// Micro emotional rewards shown after check-in or exercise
// Axe : MODE SURVIE → CALME. Vocabulaire : ancrage, sécurité, redescendre.
// À éviter : "guérison", "performance".
export const microRewards = [
  { emoji: "🌿", text: "Tu viens de t'ancrer un peu. Et ça compte." },
  { emoji: "💛", text: "Tu viens de t'écouter — et ton système redescend déjà." },
  { emoji: "🕊️", text: "Ton corps te remercie pour cet ancrage." },
  { emoji: "✨", text: "Tu viens de sortir du mode survie, même 30 secondes." },
  { emoji: "💜", text: "Ce geste pour toi, c'est déjà du calme retrouvé." },
  { emoji: "🌱", text: "Tu plantes un ancrage. Il va tenir." },
  { emoji: "🫂", text: "Tu t'es choisie. Tu deviens la maman ancrée." },
  { emoji: "💨", text: "Ton système nerveux vient de redescendre un peu." },
  { emoji: "🌸", text: "Ce que tu viens de faire, c'est un ancrage silencieux." },
  { emoji: "🛡️", text: "Tu crées un espace de sécurité pour toi." },
];

export const getRandomReward = () => {
  return microRewards[Math.floor(Math.random() * microRewards.length)];
};
