// Emotional streak progression labels
export const getStreakLabel = (streak: number): { label: string; emoji: string } => {
  if (streak <= 0) return { label: "", emoji: "" };
  if (streak === 1) return { label: "Tu commences", emoji: "🌱" };
  if (streak === 2) return { label: "Tu tiens", emoji: "💪" };
  if (streak === 3) return { label: "Tu t'engages", emoji: "🔥" };
  if (streak === 4) return { label: "Tu construis", emoji: "🧱" };
  if (streak === 5) return { label: "Tu changes", emoji: "✨" };
  if (streak <= 7) return { label: "Tu crées un espace de sécurité", emoji: "🛡️" };
  if (streak <= 10) return { label: "Ton corps apprend", emoji: "🌊" };
  if (streak <= 14) return { label: "Ton système se reprogramme", emoji: "⚡" };
  if (streak <= 21) return { label: "Tu te transformes", emoji: "🦋" };
  if (streak <= 30) return { label: "Tu es une autre personne", emoji: "👑" };
  return { label: "Tu es inarrêtable", emoji: "💎" };
};
