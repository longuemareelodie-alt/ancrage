import { motion } from "framer-motion";
import { Check, CreditCard, ShieldCheck } from "lucide-react";
import { Eyebrow, Section, SectionTitle, fadeUp, NightCTA } from "./primitives";
import FoundingFamiliesBanner from "@/components/FoundingFamiliesBanner";
import KlarnaPayButton from "@/components/KlarnaPayButton";

const AVANTAGES = [
  "Accès à vie",
  "Toutes les mises à jour incluses",
  "Badge exclusif à vie",
  "Accès anticipé à certaines nouveautés",
  "Tes idées peuvent être étudiées lorsqu'elles correspondent à la vision du produit et aident le plus grand nombre",
];

const BADGES = [
  { emoji: "🌸", label: "Famille Fondatrice" },
  { emoji: "🌱", label: "Famille Pionnière" },
  { emoji: "✨", label: "Première Génération" },
];

const PAIEMENTS = [
  { emoji: "💳", label: "Carte bancaire" },
  { emoji: "🍎", label: "Apple Pay" },
  { emoji: "🤖", label: "Google Pay" },
  { emoji: "💜", label: "Klarna" },
];

const TarifFondateurSection = ({
  onCTA,
  loading,
}: {
  onCTA: () => void;
  loading: boolean;
}) => (
  <Section id="tarif-fondateur" className="bg-card">
    <motion.div {...fadeUp} className="mx-auto max-w-2xl text-center">
      <Eyebrow>Tarif fondateur</Eyebrow>
      <SectionTitle>
        🌸 Rejoignez les
        <br />
        <span className="italic text-primary-dark">Familles Fondatrices.</span>
      </SectionTitle>
      <p className="mt-6 text-[15px] leading-relaxed text-muted-foreground">
        Les premières familles qui rejoignent Éclosia participent à son
        lancement. Pour les remercier de leur confiance, un tarif fondateur
        évolutif leur est proposé.
      </p>
    </motion.div>

    <div className="mt-14 grid items-start gap-8 md:grid-cols-2 md:gap-12">
      <FoundingFamiliesBanner className="w-full" />

      <motion.div {...fadeUp} className="rounded-[28px] border border-border/70 bg-background px-6 py-7">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          Ce que ça inclut
        </p>
        <ul className="mt-5 space-y-3">
          {AVANTAGES.map((a) => (
            <li key={a} className="flex items-start gap-3">
              <span className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-primary/15">
                <Check className="h-3.5 w-3.5 text-primary-dark" aria-hidden="true" />
              </span>
              <span className="text-[14px] leading-relaxed text-foreground/85">
                {a}
              </span>
            </li>
          ))}
        </ul>

        <div className="mt-7 border-t border-border/60 pt-6">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            Les badges
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {BADGES.map((b) => (
              <span
                key={b.label}
                className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-card px-3 py-1.5 text-[12.5px] text-foreground/85"
              >
                <span aria-hidden="true">{b.emoji}</span>
                {b.label}
              </span>
            ))}
          </div>
          <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
            Le badge est attribué automatiquement après l'achat, et reste à vie.
          </p>
        </div>

        <div className="mt-8 flex flex-col items-stretch gap-3">
          <NightCTA onClick={onCTA} disabled={loading} className="w-full">
            🌸 Rejoindre les Familles Fondatrices
          </NightCTA>
          <KlarnaPayButton className="w-full rounded-full border border-primary/30 bg-card px-6 py-3 text-sm font-medium text-primary-dark transition-colors hover:bg-primary/5" />
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-2">
          {PAIEMENTS.map((p) => (
            <span
              key={p.label}
              className="inline-flex items-center gap-1.5 rounded-full border border-border/50 bg-card px-3 py-1.5 text-[12px] text-muted-foreground"
            >
              <span aria-hidden="true">{p.emoji}</span>
              {p.label}
            </span>
          ))}
        </div>
        <p className="mt-3 flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
          Paiement sécurisé
          <CreditCard className="ml-1 h-3.5 w-3.5" aria-hidden="true" />
        </p>
      </motion.div>
    </div>
  </Section>
);

export default TarifFondateurSection;
