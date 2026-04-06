// Rotating daily messages — soft, human, emotional support
export const dailyMessages = [
  { emoji: "💛", text: "Aujourd'hui, ton corps a besoin de ralentir" },
  { emoji: "🌿", text: "Prends 30 secondes pour toi. Juste 30." },
  { emoji: "🕊️", text: "Tu n'as rien à prouver aujourd'hui" },
  { emoji: "💨", text: "Expire. Plus longtemps que d'habitude." },
  { emoji: "🌸", text: "Ce que tu ressens a le droit d'exister" },
  { emoji: "🫂", text: "Tu n'es pas seule, même quand tu te sens seule" },
  { emoji: "🌊", text: "La vague va passer. Elle passe toujours." },
  { emoji: "💜", text: "Tu es plus forte que ce que tu crois" },
  { emoji: "☁️", text: "Aujourd'hui, sois douce avec toi" },
  { emoji: "🌱", text: "Chaque petit geste pour toi est une victoire" },
  { emoji: "✨", text: "Tu mérites de te sentir en sécurité" },
  { emoji: "🛡️", text: "Ton corps te protège. Aide-le à se calmer." },
  { emoji: "💧", text: "Même les larmes sont une forme de guérison" },
  { emoji: "🌤️", text: "Le brouillard se lève. Doucement." },
  { emoji: "🔥", text: "Tu es encore là. Et c'est ta force." },
  { emoji: "💛", text: "Aujourd'hui, choisis-toi" },
  { emoji: "🌿", text: "Ton système nerveux peut se poser aujourd'hui" },
  { emoji: "🕊️", text: "Tu avances. Même quand tu ne le sens pas." },
  { emoji: "💨", text: "Respire. Tu es en sécurité ici." },
  { emoji: "🌸", text: "Ce matin, écoute ce que ton corps te dit" },
  { emoji: "🫂", text: "Tu fais de ton mieux. Et c'est suffisant." },
  { emoji: "🌊", text: "Laisse ton corps te guider aujourd'hui" },
  { emoji: "💜", text: "Tu n'as pas à tout porter seule" },
  { emoji: "☁️", text: "Un pas à la fois. C'est comme ça qu'on avance." },
  { emoji: "🌱", text: "Quelque chose de doux pousse en toi" },
  { emoji: "✨", text: "Aujourd'hui est un nouveau départ" },
  { emoji: "🛡️", text: "Tu as le droit de poser tes armes" },
  { emoji: "💧", text: "Prends soin de toi comme tu prendrais soin d'une amie" },
  { emoji: "🌤️", text: "La lumière revient toujours" },
  { emoji: "🔥", text: "Ton courage silencieux est immense" },
];

// Get message of the day based on day of year
export const getDailyMessage = () => {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - start.getTime();
  const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));
  return dailyMessages[dayOfYear % dailyMessages.length];
};
