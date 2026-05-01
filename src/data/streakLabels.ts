// Emotional streak progression labels
// Axe : MODE SURVIE → CALME. Vocabulaire : ancrage, sécurité, calme, ancrée.
export const getStreakLabel = (streak: number): { label: string; emoji: string } => {
  if (streak <= 0) return { label: "", emoji: "" };
  if (streak === 1) return { label: "Tu sors du mode survie", emoji: "🌱" };
  if (streak === 2) return { label: "Tu tiens ton ancrage", emoji: "💪" };
  if (streak === 3) return { label: "Tu t'ancres chaque jour", emoji: "🔥" };
  if (streak === 4) return { label: "Tu construis ta sécurité", emoji: "🧱" };
  if (streak === 5) return { label: "Tu retrouves ton calme", emoji: "✨" };
  if (streak <= 7) return { label: "Tu crées un espace de sécurité", emoji: "🛡️" };
  if (streak <= 10) return { label: "Ton corps apprend à redescendre", emoji: "🌊" };
  if (streak <= 14) return { label: "Ton système se réancre", emoji: "⚡" };
  if (streak <= 21) return { label: "Tu deviens la maman ancrée", emoji: "🦋" };
  if (streak <= 30) return { label: "Tu es la maman ancrée", emoji: "👑" };
  return { label: "Ton ancrage est inébranlable", emoji: "💎" };
};
