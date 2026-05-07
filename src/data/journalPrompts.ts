export type JournalPrompt = { key: string; text: string };

export const JOURNAL_PROMPTS: JournalPrompt[] = [
  { key: "ressenti", text: "Aujourd'hui avec mon enfant, j'ai ressenti…" },
  { key: "surprise", text: "Ce qui m'a surprise / surpris aujourd'hui…" },
  { key: "besoin", text: "Ce dont j'ai besoin en ce moment…" },
  { key: "fierte", text: "Une chose dont je suis fier·ère aujourd'hui…" },
  { key: "difficile", text: "Le moment le plus difficile, et comment je l'ai traversé…" },
  { key: "victoire", text: "Une petite victoire, même minuscule…" },
  { key: "pardon", text: "Ce que je veux me pardonner aujourd'hui…" },
  { key: "merci", text: "À qui (ou à quoi) je dis merci ce soir…" },
  { key: "demain", text: "Une chose douce que je veux essayer demain…" },
  { key: "phrase", text: "La phrase que j'aurais voulu entendre aujourd'hui…" },
];
