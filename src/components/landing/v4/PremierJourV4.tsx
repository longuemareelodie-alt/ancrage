import { Band, Eyebrow, H2 } from "./kit";

const ITEMS = [
  {
    emoji: "👧",
    q: "Une fiche pour chaque enfant",
    a: "Informations, suivis, professionnels, allergies, documents.",
  },
  { emoji: "📅", q: "Un rendez-vous ?", a: "Éclosia te le rappelle." },
  { emoji: "📄", q: "Un document important ?", a: "Tu le ranges et tu le retrouves." },
  { emoji: "🎙️", q: "Pas envie d'écrire ?", a: "Tu dictes." },
  {
    emoji: "🧠",
    q: "Trop de choses dans ta tête ?",
    a: "« Vider ma tête » les transforme en éléments organisés.",
  },
  { emoji: "🖨️", q: "Besoin d'un support ?", a: "Tu génères ton PDF." },
];

const PremierJourV4 = () => (
  <Band className="bg-card">
    <Eyebrow>Concrètement</Eyebrow>
    <H2>Ce que tu peux faire dès le premier jour.</H2>
    <ul className="mt-5 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
      {ITEMS.map((i) => (
        <li
          key={i.q}
          className="flex items-start gap-3 rounded-xl border border-border/50 bg-background px-3.5 py-3"
        >
          <span className="text-lg leading-none" aria-hidden="true">
            {i.emoji}
          </span>
          <span>
            <span className="block text-[13.5px] font-medium text-night">{i.q}</span>
            <span className="mt-0.5 block text-[13px] leading-snug text-muted-foreground">
              {i.a}
            </span>
          </span>
        </li>
      ))}
    </ul>
  </Band>
);

export default PremierJourV4;
