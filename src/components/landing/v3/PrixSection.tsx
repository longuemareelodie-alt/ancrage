import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ShieldCheck } from "lucide-react";
import { Eyebrow, Section, SectionTitle, fadeUp } from "../primitives";
import KlarnaPayButton from "@/components/KlarnaPayButton";
import { formatEurAmount, PREMIUM_PRICE_EUR } from "@/lib/premiumOffer";
import {
  FOUNDING_TIERS,
  FoundingOffer,
  fetchFoundingOffer,
  getFoundingTier,
} from "@/lib/foundingFamilies";
import { track, useSectionView } from "@/lib/landingAnalytics";

const PrixSection = ({
  onCTA,
  loading,
}: {
  onCTA: () => void;
  loading: boolean;
}) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const observe = useSectionView("pricing_view");
  const [offer, setOffer] = useState<FoundingOffer | null>(null);

  useEffect(() => observe(ref.current), [observe]);
  useEffect(() => {
    let alive = true;
    fetchFoundingOffer().then((o) => alive && setOffer(o));
    return () => {
      alive = false;
    };
  }, []);

  const founderEur = offer ? offer.priceCents / 100 : null;
  const saving = founderEur !== null ? PREMIUM_PRICE_EUR - founderEur : null;
  const percent =
    saving && saving > 0 ? Math.round((saving / PREMIUM_PRICE_EUR) * 100) : null;
  const tier = offer ? getFoundingTier(offer.tierKey) : null;

  return (
    <Section id="tarif">
      <div ref={ref}>
        <motion.div {...fadeUp} className="mx-auto max-w-2xl text-center">
          <Eyebrow>Le tarif</Eyebrow>
          <SectionTitle>
            Un paiement unique,
            <br />
            <span className="italic text-primary-dark">un accès à vie.</span>
          </SectionTitle>
        </motion.div>

        <div className="mx-auto mt-9 grid max-w-3xl gap-4 md:grid-cols-2">
          {/* Ancrage : prix public */}
          <motion.div
            {...fadeUp}
            className="rounded-[1.75rem] border border-border/60 bg-card p-6 text-center"
          >
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              Prix public
            </p>
            <p className="mt-3 font-serif text-4xl leading-none text-night">
              {formatEurAmount(PREMIUM_PRICE_EUR)}
            </p>
            <ul className="mt-4 space-y-1.5 text-[13.5px] text-muted-foreground">
              <li>Paiement unique</li>
              <li>Accès à vie</li>
              <li>Aucun abonnement</li>
            </ul>
          </motion.div>

          {/* Tarif fondateur réel */}
          <motion.div
            {...fadeUp}
            className="rounded-[1.75rem] border border-primary/35 bg-card p-6 text-center shadow-[0_24px_70px_-40px_hsl(var(--night)/0.3)]"
          >
            <p className="text-[11px] font-semibold uppercase tracking-wide text-primary-dark">
              🌸 Tarif fondateur
            </p>
            {founderEur === null ? (
              <p className="mt-4 text-[13.5px] text-muted-foreground">
                Chargement du tarif fondateur en cours…
              </p>
            ) : (
              <>
                <div className="mt-3 flex items-end justify-center gap-2">
                  <span className="font-serif text-5xl leading-none text-night">
                    {formatEurAmount(founderEur)}
                  </span>
                  {saving !== null && saving > 0 && (
                    <span className="pb-1 text-sm text-muted-foreground line-through">
                      {formatEurAmount(PREMIUM_PRICE_EUR)}
                    </span>
                  )}
                </div>
                {saving !== null && saving > 0 && (
                  <p className="mt-2 text-[13px] text-primary-dark">
                    {formatEurAmount(saving)} de moins
                    {percent ? ` (environ ${percent} %)` : ""}
                  </p>
                )}
                {tier && (
                  <p className="mt-2 text-[13px] text-muted-foreground">
                    Palier actuel : {tier.emoji} {tier.label}
                  </p>
                )}
              </>
            )}

            <p className="mt-4 text-[13px] leading-relaxed text-muted-foreground">
              Les premières familles bénéficient d'un tarif fondateur évolutif :
              il monte par paliers annoncés à l'avance.
            </p>

            <button
              onClick={() => {
                track("founder_cta_click", { from: "tarif" });
                track("checkout_start", { from: "tarif" });
                onCTA();
              }}
              disabled={loading}
              className="mt-6 inline-flex min-h-[52px] w-full items-center justify-center rounded-full bg-night px-6 text-[15px] font-medium text-night-foreground transition-all duration-300 hover:-translate-y-[1px] disabled:opacity-60"
            >
              🌸 Rejoindre les Familles Fondatrices
            </button>
            <p className="mt-3 flex items-center justify-center gap-1.5 text-[12px] text-muted-foreground">
              <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
              Paiement sécurisé · Accès à vie · Sans abonnement
            </p>
            <KlarnaPayButton className="mt-3 w-full rounded-full border border-primary/30 bg-background px-6 py-3 text-sm font-medium text-primary-dark transition-colors hover:bg-primary/5" />
            <p className="mt-2 text-[12px] text-muted-foreground">
              Paiement en plusieurs fois disponible avec Klarna, lorsque Klarna
              le propose dans ton pays. Les conditions de Klarna s'appliquent.
            </p>
          </motion.div>
        </div>

        {/* Les paliers, en clair */}
        <motion.ul
          {...fadeUp}
          className="mx-auto mt-7 max-w-md space-y-1.5 rounded-[1.5rem] border border-border/60 bg-card px-6 py-5"
        >
          <li className="pb-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            Les paliers du tarif fondateur
          </li>
          {FOUNDING_TIERS.map((t) => (
            <li
              key={t.key}
              className={`flex items-center justify-between text-[13px] ${
                tier && t.key === tier.key
                  ? "font-semibold text-night"
                  : "text-muted-foreground"
              }`}
            >
              <span>
                {t.emoji} {t.seats ? `${t.seats} ${t.label.toLowerCase()}` : t.label}
              </span>
              <span>{formatEurAmount(t.priceCents / 100)}</span>
            </li>
          ))}
        </motion.ul>
      </div>
    </Section>
  );
};

export default PrixSection;
