import { motion } from "framer-motion";
import { Eyebrow, Section, SectionTitle, fadeUp } from "../primitives";

/**
 * Preuve sociale — structure prête, aucun faux témoignage.
 * Quand de vrais témoignages seront recueillis (avec autorisation), il suffit
 * de remplir TEMOIGNAGES : la mise en page s'affiche automatiquement.
 */
export type Temoignage = {
  prenom: string;
  contexte: string;
  probleme: string;
  utilisation: string;
  resultat: string;
  capture?: string;
};

export const TEMOIGNAGES: Temoignage[] = [];

const PreuveSection = () => (
  <Section id="temoignages" className="bg-card">
    <motion.div {...fadeUp} className="mx-auto max-w-2xl text-center">
      <Eyebrow>Les premières familles</Eyebrow>
      <SectionTitle>
        Les premières familles
        <br />
        <span className="italic text-primary-dark">découvrent actuellement Éclosia.</span>
      </SectionTitle>

      {TEMOIGNAGES.length === 0 ? (
        <p className="mt-5 text-[15px] leading-relaxed text-muted-foreground">
          Nous préférons ne rien inventer : aucun témoignage n'est publié pour
          l'instant. Les retours des Familles Fondatrices seront affichés ici,
          avec leur accord. En attendant, la démonstration vidéo te montre
          l'application réelle.
        </p>
      ) : (
        <div className="mt-8 grid gap-4 text-left md:grid-cols-2">
          {TEMOIGNAGES.map((t) => (
            <article
              key={t.prenom + t.contexte}
              className="rounded-[1.5rem] border border-border/60 bg-background p-6"
            >
              <p className="text-sm font-medium text-night">{t.prenom}</p>
              <p className="text-[12.5px] text-muted-foreground">{t.contexte}</p>
              <p className="mt-3 text-[14px] leading-relaxed text-foreground/85">
                {t.probleme}
              </p>
              <p className="mt-2 text-[14px] leading-relaxed text-muted-foreground">
                {t.utilisation}
              </p>
              <p className="mt-2 text-[14px] font-medium leading-relaxed text-night">
                {t.resultat}
              </p>
              {t.capture && (
                <img
                  src={t.capture}
                  alt={`Capture partagée par ${t.prenom}`}
                  loading="lazy"
                  className="mt-4 w-full rounded-2xl border border-border/60"
                />
              )}
            </article>
          ))}
        </div>
      )}
    </motion.div>
  </Section>
);

export default PreuveSection;
