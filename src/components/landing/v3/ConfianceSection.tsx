import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Eyebrow, Section, SectionTitle, fadeUp } from "../primitives";

const POINTS = [
  {
    emoji: "🔐",
    titre: "Données personnelles protégées",
    desc: "Chaque espace est rattaché à ton compte : seules les personnes que tu autorises peuvent voir ce que tu partages.",
  },
  {
    emoji: "🔒",
    titre: "Connexions sécurisées",
    desc: "Les échanges entre ton téléphone et Éclosia passent par une connexion chiffrée (HTTPS).",
  },
  {
    emoji: "🗂️",
    titre: "Contrôle de tes données",
    desc: "Tu ajoutes, modifies et supprimes tes informations quand tu veux, y compris tes documents.",
  },
  {
    emoji: "🗑️",
    titre: "Suppression du compte",
    desc: "Tu peux demander la suppression de ton compte et des données associées depuis ton profil.",
  },
  {
    emoji: "🚫",
    titre: "Pas de vente de données",
    desc: "Tes informations ne sont pas vendues à des fins commerciales ni utilisées pour de la publicité.",
  },
  {
    emoji: "💳",
    titre: "Paiement traité par Mollie",
    desc: "Éclosia ne stocke aucune donnée bancaire : le paiement est traité par notre prestataire Mollie.",
  },
];

const ConfianceSection = () => (
  <Section id="confiance">
    <motion.div {...fadeUp} className="mx-auto max-w-2xl text-center">
      <Eyebrow>Confiance et données</Eyebrow>
      <SectionTitle>
        Ce que tu confies à Éclosia
        <br />
        <span className="italic text-primary-dark">reste à toi.</span>
      </SectionTitle>
      <p className="mt-4 text-[15px] leading-relaxed text-muted-foreground">
        Éclosia peut contenir des informations sensibles sur ta famille. Voici,
        concrètement, ce qui est mis en place.
      </p>
    </motion.div>

    <div className="mt-9 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {POINTS.map(({ emoji, titre, desc }, i) => (
        <motion.div
          key={titre}
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.5, delay: i * 0.05 }}
          className="rounded-2xl border border-border/60 bg-card p-5"
        >
          <span className="text-lg" aria-hidden="true">
            {emoji}
          </span>
          <p className="mt-2 text-sm font-medium leading-snug text-night">{titre}</p>
          <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">
            {desc}
          </p>
        </motion.div>
      ))}
    </div>

    <motion.p {...fadeUp} className="mt-7 text-center text-[13px] text-muted-foreground">
      Aucun système n'est infaillible : nous décrivons ici les mesures réellement
      en place.{" "}
      <Link to="/confidentialite" className="underline underline-offset-4 hover:text-night">
        Lire la politique de confidentialité
      </Link>
      .
    </motion.p>
  </Section>
);

export default ConfianceSection;
