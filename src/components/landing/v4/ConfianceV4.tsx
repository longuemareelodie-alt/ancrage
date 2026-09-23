import { Link } from "react-router-dom";
import { Band } from "./kit";

const POINTS = [
  "Accès contrôlé",
  "Export",
  "Suppression",
  "Partage maîtrisé",
  "Pas de revente de données",
];

const ConfianceV4 = () => (
  <Band className="bg-card">
    <div className="rounded-2xl border border-border/60 bg-background px-4 py-5 md:px-7 md:py-6">
      <p className="font-serif text-[1.15rem] text-night md:text-[1.35rem]">
        🔐 Tes données restent les tiennes.
      </p>
      <ul className="mt-3 flex flex-wrap gap-2">
        {POINTS.map((p) => (
          <li
            key={p}
            className="rounded-full border border-border/60 px-3 py-1 text-[12.5px] text-foreground/80"
          >
            {p}
          </li>
        ))}
      </ul>
      <p className="mt-3 text-[12.5px] leading-relaxed text-muted-foreground">
        Éclosia est un outil d'organisation et de soutien. Il ne remplace pas un
        médecin, un professionnel de santé ou un suivi médical. Aucun système
        n'est infaillible :{" "}
        <Link to="/confidentialite" className="underline hover:text-foreground">
          la politique de confidentialité
        </Link>{" "}
        décrit les mesures réellement en place.
      </p>
    </div>
  </Band>
);

export default ConfianceV4;
