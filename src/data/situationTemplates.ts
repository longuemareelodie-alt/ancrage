/**
 * Situations préconfigurées — règles explicites, sans IA.
 * Jamais de conclusion sur l'intention, jamais de « méchant », jamais de diagnostic.
 * « Je ne sais pas » est toujours une réponse complète.
 */
import type { AgeBand } from "@/lib/childAdapt";

export type QuestionKey = "quoi" | "mal" | "ressens" | "envie" | "pourquoi" | "deja" | "securite" | "besoin" | "aide";

export type Question = {
  key: QuestionKey;
  text: Record<AgeBand, string>;
  /** pictogram keys, in priority order (« je ne sais pas » ajouté automatiquement) */
  choices: string[];
  /** réponse libre possible (paroles de l'enfant) */
  free?: boolean;
};

export const QUESTIONS: Record<QuestionKey, Question> = {
  quoi: {
    key: "quoi",
    text: { petit: "Qu'est-ce qui s'est passé ?", enfant: "Qu'est-ce qui s'est passé ?", ado: "Tu peux raconter ce qui s'est passé ?" },
    choices: [], free: true,
  },
  mal: {
    key: "mal",
    text: { petit: "Est-ce que ça t'a fait mal ?", enfant: "Est-ce que ça t'a fait mal ?", ado: "Est-ce que tu as eu mal ?" },
    choices: ["reponses:mal-oui", "reponses:non"],
  },
  ressens: {
    key: "ressens",
    text: { petit: "Comment tu te sens ?", enfant: "Comment tu te sens ?", ado: "Comment as-tu vécu ce qui s'est passé ?" },
    choices: ["emotions:triste", "emotions:colere", "emotions:peur", "emotions:ca-va", "emotions:inquiet", "emotions:frustre", "emotions:depasse"],
  },
  envie: {
    key: "envie",
    text: { petit: "Est-ce que tu avais envie ?", enfant: "Est-ce que tu étais d'accord ?", ado: "Est-ce que tu avais donné ton accord ?" },
    choices: ["reponses:oui", "reponses:non"],
  },
  pourquoi: {
    key: "pourquoi",
    text: { petit: "Tu sais pourquoi ?", enfant: "Tu penses que c'était un accident ou quelque chose qu'il voulait faire ?", ado: "Tu as une idée de pourquoi c'est arrivé ?" },
    choices: ["reponses:accident", "reponses:expres"],
  },
  deja: {
    key: "deja",
    text: { petit: "C'est déjà arrivé ?", enfant: "Est-ce que cela s'est déjà produit ?", ado: "Est-ce que c'est déjà arrivé avant ?" },
    choices: ["reponses:plusieurs-fois", "reponses:non"],
  },
  securite: {
    key: "securite",
    text: { petit: "Tu te sens bien maintenant ?", enfant: "Est-ce que tu te sens en sécurité maintenant ?", ado: "Est-ce que tu te sens en sécurité maintenant ?" },
    choices: ["reponses:securite-oui", "reponses:securite-non"],
  },
  besoin: {
    key: "besoin",
    text: { petit: "Tu as besoin de quoi ?", enfant: "De quoi as-tu besoin maintenant ?", ado: "Qu'est-ce qui t'aiderait maintenant ?" },
    choices: ["besoins:calin", "besoins:calme", "besoins:parler", "besoins:aide", "besoins:tranquille", "besoins:moins-bruit", "besoins:doudou", "besoins:rentrer"],
  },
  aide: {
    key: "aide",
    text: { petit: "On demande à un grand ?", enfant: "Veux-tu demander de l'aide ?", ado: "Tu veux en parler à un adulte de confiance ?" },
    choices: ["reponses:oui", "reponses:non"],
  },
};

export type SituationTemplate = {
  key: string;
  emoji: string;
  title: string;
  sensitive: boolean;
  questions: QuestionKey[];
  /** phrase protectrice affichée au début pour les situations sensibles */
  protective?: string;
  /** explication courte, non culpabilisante */
  explain: string[];
  /** ce que l'enfant peut dire */
  sayIt?: string;
};

const BODY = ["quoi", "mal", "ressens", "envie", "pourquoi", "deja", "securite", "besoin", "aide"] as QuestionKey[];
const FEEL = ["ressens", "besoin", "aide"] as QuestionKey[];
const CONFLICT = ["quoi", "ressens", "pourquoi", "deja", "besoin"] as QuestionKey[];
const PROTECT = "Ce que tu racontes est important. Tu n'as pas à garder pour toi une situation qui te fait peur ou te fait du mal.";

export const SITUATIONS: SituationTemplate[] = [
  { key: "pousse", emoji: "👉", title: "Quelqu'un m'a poussé", sensitive: false, questions: BODY,
    explain: ["Pousser quelqu'un sans qu'il soit d'accord n'est pas un comportement respectueux.", "Même si c'était un accident, tu as le droit de dire que tu n'as pas aimé."],
    sayIt: "« Arrête, je n'aime pas qu'on me pousse. »" },
  { key: "frappe", emoji: "✋", title: "Quelqu'un m'a frappé", sensitive: true, questions: BODY, protective: PROTECT,
    explain: ["Personne n'a le droit de te faire mal.", "Tu as bien fait d'en parler."], sayIt: "« Stop. Je vais le dire à un adulte. »" },
  { key: "insulte", emoji: "🗯️", title: "Quelqu'un m'a insulté", sensitive: false, questions: CONFLICT,
    explain: ["Les mots peuvent faire mal aussi.", "Tu as le droit de dire que ça ne te plaît pas."], sayIt: "« Je n'aime pas que tu me parles comme ça. »" },
  { key: "objet-pris", emoji: "🧸", title: "On m'a pris mon objet", sensitive: false, questions: ["quoi", "ressens", "besoin"],
    explain: ["C'est normal d'être fâché quand on te prend quelque chose."], sayIt: "« Je jouais avec. Quand tu as fini, tu peux me le rendre ? »" },
  { key: "pas-jouer", emoji: "🛝", title: "Quelqu'un ne veut pas jouer avec moi", sensitive: false, questions: ["quoi", "ressens", "besoin"],
    explain: ["Ça peut rendre triste. Chacun a le droit de choisir, et toi aussi.", "On peut chercher un autre jeu ou un autre copain."], sayIt: "« Je peux jouer avec vous plus tard ? »" },
  { key: "dispute", emoji: "😡", title: "Je me suis disputé avec quelqu'un", sensitive: false, questions: CONFLICT,
    explain: ["Les disputes arrivent. On peut se calmer puis en reparler."], sayIt: "« J'étais en colère. On peut en reparler ? »" },
  { key: "erreur", emoji: "🍃", title: "J'ai fait une erreur", sensitive: false, questions: ["quoi", "ressens", "besoin"],
    explain: ["Tout le monde fait des erreurs.", "On peut réparer, ou dire pardon si on en a envie."], sayIt: "« Je me suis trompé. Je peux réparer ? »" },
  { key: "colere", emoji: "🌋", title: "Je suis très en colère", sensitive: false, questions: FEEL,
    explain: ["La colère a le droit d'exister.", "On peut respirer, s'éloigner un peu, puis en parler."] },
  { key: "peur", emoji: "😨", title: "J'ai peur", sensitive: false, questions: ["quoi", "ressens", "securite", "besoin", "aide"],
    explain: ["Avoir peur, ça arrive. Tu n'es pas seul.", "Un adulte de confiance peut t'aider."] },
  { key: "triste", emoji: "😢", title: "Je suis triste", sensitive: false, questions: FEEL,
    explain: ["Tu as le droit d'être triste.", "On peut demander un câlin ou un moment calme."] },
  { key: "quoi-dire", emoji: "🤐", title: "Je ne sais pas quoi dire", sensitive: false, questions: ["ressens", "besoin"],
    explain: ["Ce n'est pas grave de ne pas trouver les mots.", "Tu peux montrer une image ou un geste."] },
  { key: "besoin-aide", emoji: "🙋", title: "J'ai besoin d'aide", sensitive: false, questions: ["besoin", "securite", "aide"],
    explain: ["Demander de l'aide, c'est une bonne idée."], sayIt: "« Tu peux m'aider s'il te plaît ? »" },
  { key: "calin-non", emoji: "🙅", title: "Quelqu'un veut me faire un câlin mais je n'en ai pas envie", sensitive: true, questions: ["quoi", "ressens", "envie", "deja", "securite", "aide"], protective: PROTECT,
    explain: ["Ton corps t'appartient. Tu as le droit de dire non à un câlin ou à un bisou, même avec quelqu'un que tu aimes."], sayIt: "« Non merci, je n'ai pas envie. On peut se dire bonjour autrement. »" },
  { key: "secret", emoji: "🤫", title: "Quelqu'un me demande de garder un secret", sensitive: true, questions: ["quoi", "ressens", "envie", "deja", "securite", "aide"], protective: PROTECT,
    explain: ["Une surprise fait plaisir et se révèle bientôt. Un secret qui fait peur ou qui gêne, tu as le droit d'en parler à un adulte de confiance."] },
  { key: "non-pas-respecte", emoji: "🛑", title: "Quelqu'un ne respecte pas mon « non »", sensitive: true, questions: ["quoi", "ressens", "envie", "deja", "securite", "aide"], protective: PROTECT,
    explain: ["Ton « non » compte.", "Si quelqu'un ne l'écoute pas, tu peux t'éloigner et prévenir un adulte de confiance."], sayIt: "« J'ai dit non. Stop. »" },
  { key: "tranquille", emoji: "🌿", title: "Je veux être tranquille", sensitive: false, questions: ["ressens", "besoin"],
    explain: ["Avoir besoin d'un moment seul, c'est normal."], sayIt: "« J'ai besoin d'être un peu tranquille. »" },
  { key: "bruit", emoji: "🎧", title: "Trop de bruit", sensitive: false, questions: ["ressens", "besoin"],
    explain: ["Le bruit peut être très fatigant.", "Un casque ou un endroit plus calme peut aider."], sayIt: "« C'est trop fort pour moi. »" },
  { key: "monde", emoji: "👥", title: "Trop de monde", sensitive: false, questions: ["ressens", "besoin"],
    explain: ["Quand il y a trop de monde, on peut avoir besoin de s'éloigner un peu."], sayIt: "« J'ai besoin d'un endroit plus calme. »" },
  { key: "partir", emoji: "🚶", title: "Je veux partir", sensitive: false, questions: ["quoi", "ressens", "besoin", "aide"],
    explain: ["Tu peux le dire à l'adulte qui est avec toi."], sayIt: "« Je voudrais partir. »" },
  { key: "comprends-pas", emoji: "❓", title: "Je ne comprends pas ce qui se passe", sensitive: false, questions: ["ressens", "besoin", "aide"],
    explain: ["C'est normal de ne pas tout comprendre.", "Tu peux demander qu'on t'explique avec des mots simples ou des images."], sayIt: "« Tu peux m'expliquer ? »" },
];

export const situationByKey = (k?: string | null) => SITUATIONS.find((s) => s.key === k) ?? null;

const norm = (s: string) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

const KEYWORDS: Record<string, string[]> = {
  pousse: ["pousse"], frappe: ["frappe", "tape", "coup"], insulte: ["insult", "gros mot", "traite"],
  "objet-pris": ["pris mon", "pique", "vole mon", "jouet"], "pas-jouer": ["pas jouer", "veut pas jouer", "exclu"],
  dispute: ["disput", "chamaill"], erreur: ["erreur", "trompe", "casse"], colere: ["colere", "enerve", "furieux"],
  peur: ["peur", "effraye"], triste: ["triste", "pleure"], "quoi-dire": ["quoi dire"], "besoin-aide": ["besoin d'aide", "aide moi"],
  "calin-non": ["calin", "bisou"], secret: ["secret", "rien dire", "rien raconter", "pas le dire"],
  "non-pas-respecte": ["respecte pas mon non", "ecoute pas mon non"], tranquille: ["tranquille", "seul"],
  bruit: ["bruit", "trop fort"], monde: ["trop de monde", "foule"], partir: ["partir", "m'en aller"], "comprends-pas": ["comprends pas"],
};

/** Correspondance par mots-clés (fiable, extensible). Les règles sensibles passent en premier. */
export function matchSituation(text: string): SituationTemplate | null {
  const t = norm(text);
  const order = ["secret", "non-pas-respecte", "calin-non", "frappe", ...SITUATIONS.map((s) => s.key)];
  for (const k of order) if (KEYWORDS[k]?.some((w) => t.includes(norm(w)))) return situationByKey(k);
  return null;
}

export const isRepeatedText = (text: string) => /tous les jours|chaque jour|souvent|encore|plusieurs fois|toujours/.test(norm(text));

export type AnswerSource = "enfant" | "parent" | "contexte" | "interpretation";
export const SOURCE_LABEL: Record<AnswerSource, string> = {
  enfant: "Parole rapportée de l'enfant",
  parent: "Observation du parent",
  contexte: "Contexte",
  interpretation: "Interprétation éventuelle",
};

export type Answer = { question_key: QuestionKey; answer_key: string; text?: string; source: AnswerSource };
