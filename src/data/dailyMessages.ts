// Rotating daily messages — soft, human, emotional support
// Axe narratif : MODE SURVIE → CALME (cf. src/lib/lexicon.ts)
// Vocabulaire : ancrage, sécurité, redescendre, en alerte, calme.
// À éviter : "guérison", "thérapie", "performance".
export const dailyMessages = [
  { emoji: "💛", text: "Aujourd'hui, ton corps a le droit de redescendre" },
  { emoji: "🌿", text: "30 secondes d'ancrage suffisent. Juste 30." },
  { emoji: "🕊️", text: "Tu n'as rien à prouver. Tu peux sortir du mode survie." },
  { emoji: "💨", text: "Expire plus longtemps. Ton système redescend." },
  { emoji: "🌸", text: "Ce que tu ressens a le droit d'exister, ici, en sécurité" },
  { emoji: "🫂", text: "Tu n'es pas seule dans ton mode survie" },
  { emoji: "🌊", text: "L'alerte va passer. Elle passe toujours." },
  { emoji: "💜", text: "Tu peux redevenir la maman ancrée — un ancrage à la fois" },
  { emoji: "☁️", text: "Aujourd'hui, sois douce avec ton système" },
  { emoji: "🌱", text: "Chaque ancrage est un pas hors du mode survie" },
  { emoji: "✨", text: "Tu mérites de te sentir en sécurité dans ton corps" },
  { emoji: "🛡️", text: "Ton corps te protège. Aide-le à redescendre." },
  { emoji: "💧", text: "Même les larmes font baisser l'alerte" },
  { emoji: "🌤️", text: "Le mode survie se desserre. Doucement." },
  { emoji: "🔥", text: "Tu es encore là. Et c'est déjà un ancrage." },
  { emoji: "💛", text: "Aujourd'hui, choisis le calme — 30 secondes" },
  { emoji: "🌿", text: "Ton système nerveux peut se poser maintenant" },
  { emoji: "🕊️", text: "Tu sors du mode survie, même quand tu ne le sens pas" },
  { emoji: "💨", text: "Respire. Tu es en sécurité ici." },
  { emoji: "🌸", text: "Ce matin, écoute ce que ton corps en alerte te dit" },
  { emoji: "🫂", text: "Tu fais de ton mieux. Et c'est suffisant pour t'ancrer." },
  { emoji: "🌊", text: "Laisse ton corps te ramener au calme aujourd'hui" },
  { emoji: "💜", text: "Tu n'as pas à porter le mode survie seule" },
  { emoji: "☁️", text: "Un ancrage à la fois. C'est comme ça qu'on redescend." },
  { emoji: "🌱", text: "Quelque chose de calme pousse en toi" },
  { emoji: "✨", text: "Aujourd'hui, tu peux récupérer ton calme" },
  { emoji: "🛡️", text: "Tu as le droit de poser tes armes et de t'ancrer" },
  { emoji: "💧", text: "Prends soin de toi comme tu le ferais d'une amie en alerte" },
  { emoji: "🌤️", text: "Le calme revient toujours après le mode survie" },
  { emoji: "🔥", text: "Ton ancrage silencieux est immense" },
];

// Get message of the day based on day of year
export const getDailyMessage = () => {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - start.getTime();
  const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));
  return dailyMessages[dayOfYear % dailyMessages.length];
};
