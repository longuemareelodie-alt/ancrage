// Micro emotional rewards shown after check-in or exercise
export const microRewards = [
  { emoji: "🌿", text: "Tu viens de t'apaiser un peu. Et ça compte." },
  { emoji: "💛", text: "Tu viens de t'écouter. Et ça change déjà quelque chose." },
  { emoji: "🕊️", text: "Ton corps te remercie pour ce moment." },
  { emoji: "✨", text: "Tu viens de faire quelque chose que la plupart ne font jamais." },
  { emoji: "💜", text: "Ce geste pour toi, c'est déjà de la guérison." },
  { emoji: "🌱", text: "Tu plantes une graine. Elle va pousser." },
  { emoji: "🫂", text: "Tu t'es choisie. Et c'est magnifique." },
  { emoji: "💨", text: "Ton système nerveux vient de redescendre un peu." },
  { emoji: "🌸", text: "Ce que tu viens de faire, c'est du courage silencieux." },
  { emoji: "🛡️", text: "Tu crées un espace de sécurité pour toi." },
];

export const getRandomReward = () => {
  return microRewards[Math.floor(Math.random() * microRewards.length)];
};
