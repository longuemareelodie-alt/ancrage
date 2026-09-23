import { Band, Eyebrow, H2 } from "./kit";

const ESPACES = [
  { emoji: "👨‍👩‍👧", title: "Famille", text: "Profils, enfants, routines, professionnels." },
  { emoji: "🩺", title: "Santé", text: "Rendez-vous, traitements, médicaments, documents." },
  { emoji: "📋", title: "Organisation", text: "Tâches, courses, agenda, budget." },
  { emoji: "🔐", title: "Coffre-fort", text: "Tes documents importants, au même endroit." },
  { emoji: "💗", title: "Toi", text: "Journal, émotions, apaisement, évolution." },
  { emoji: "🧩", title: "Autonomie", text: "Supports, séquentiels, plannings et PDF." },
];

const EspacesV4 = () => (
  <Band id="espaces">
    <Eyebrow>Six espaces</Eyebrow>
    <H2>
      Tout ce que tu portes. <span className="italic">Un seul espace.</span>
    </H2>
    <ul className="mt-4 grid grid-cols-2 gap-2 md:grid-cols-3">
      {ESPACES.map((e) => (
        <li
          key={e.title}
          className="rounded-xl border border-border/60 bg-card px-3.5 py-3"
        >
          <p className="text-[13.5px] font-semibold text-night">
            <span aria-hidden="true">{e.emoji}</span>{" "}
            <span className="uppercase tracking-wide">{e.title}</span>
          </p>
          <p className="mt-0.5 text-[13px] leading-snug text-muted-foreground">
            {e.text}
          </p>
        </li>
      ))}
    </ul>
    <p className="mt-3 text-[12px] text-muted-foreground">
      Éclosia est un outil d'organisation et de soutien : les supports créés ne
      constituent pas une recommandation médicale.
    </p>
  </Band>
);

export default EspacesV4;
