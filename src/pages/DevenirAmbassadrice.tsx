import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Heart,
  Users,
  HeartHandshake,
  Sparkles,
  Check,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import Footer from "@/components/Footer";

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
  transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] as const },
};

const Eyebrow = ({ children }: { children: React.ReactNode }) => (
  <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-primary-dark/80">
    {children}
  </p>
);

const Section = ({
  children,
  className = "",
  id,
}: {
  children: React.ReactNode;
  className?: string;
  id?: string;
}) => (
  <section id={id} className={`px-6 py-20 md:py-28 ${className}`}>
    <div className="mx-auto w-full max-w-[1180px]">{children}</div>
  </section>
);

const DevenirAmbassadrice = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* HERO */}
      <section className="relative overflow-hidden px-6 pt-28 pb-16 md:pt-40 md:pb-24">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -top-32 left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-primary/20 blur-3xl" />
          <div className="absolute top-32 right-[-10%] h-[380px] w-[380px] rounded-full bg-accent/15 blur-3xl" />
        </div>
        <motion.div {...fadeUp} className="mx-auto max-w-3xl text-center">
          <Eyebrow>Ambassadrices</Eyebrow>
          <h1 className="mt-6 font-serif text-[clamp(2rem,5.5vw,4rem)] leading-[1.05] tracking-[-0.02em] text-night">
            Partager Eclosia peut aussi
            <br />
            <span className="italic text-primary-dark">te remercier.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-[15px] leading-relaxed text-muted-foreground md:text-base">
            Si Eclosia t'aide réellement au quotidien, tu peux choisir d'en
            parler autour de toi. Lorsqu'une autre famille découvre Eclosia
            grâce à toi, tu reçois une commission. Aucune obligation. Aucun
            objectif. Juste le plaisir de partager un outil auquel tu crois.
          </p>
          <div className="mt-10">
            <Link
              to="/auth"
              className="group inline-flex items-center justify-center gap-2 rounded-full bg-night px-7 py-3.5 text-sm font-medium text-night-foreground shadow-[0_10px_40px_-15px_hsl(var(--night)/0.5)] transition-all duration-300 hover:-translate-y-[1px]"
            >
              Découvrir le programme
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
            </Link>
          </div>
        </motion.div>
      </section>

      {/* POUR QUI */}
      <Section id="pour-qui" className="bg-card">
        <motion.div {...fadeUp} className="mx-auto max-w-2xl text-center">
          <Eyebrow>Pour qui ?</Eyebrow>
          <h2 className="mt-4 font-serif text-[clamp(1.75rem,4vw,3rem)] leading-[1.1] tracking-tight text-night">
            Un programme pensé pour
            <br />
            <span className="italic text-primary-dark">
              celles qui veulent partager.
            </span>
          </h2>
        </motion.div>
        <div className="mt-14 grid gap-5 md:grid-cols-3">
          {[
            {
              title: "Tu utilises Eclosia",
              desc: "Tu souhaites simplement partager un outil qui t'aide.",
            },
            {
              title: "Tu accompagnes des familles",
              desc: "Professionnels, créateurs de contenu, associations ou parents.",
            },
            {
              title: "Tu veux recommander une vraie solution",
              desc: "Tu préfères partager un outil utile plutôt qu'un simple produit.",
            },
          ].map((c, i) => (
            <motion.article
              key={c.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.7, delay: i * 0.08 }}
              className="rounded-[1.5rem] border border-border/60 bg-background p-6"
            >
              <h3 className="font-serif text-lg leading-tight text-night">
                {c.title}
              </h3>
              <p className="mt-3 text-[14px] leading-relaxed text-muted-foreground">
                {c.desc}
              </p>
            </motion.article>
          ))}
        </div>
      </Section>

      {/* COMMENT ÇA FONCTIONNE */}
      <Section id="comment">
        <motion.div {...fadeUp} className="mx-auto max-w-2xl text-center">
          <Eyebrow>Comment ça fonctionne</Eyebrow>
          <h2 className="mt-4 font-serif text-[clamp(1.75rem,4vw,3rem)] leading-[1.1] tracking-tight text-night">
            Simple, du début
            <br />
            <span className="italic text-primary-dark">à la fin.</span>
          </h2>
        </motion.div>
        <ol className="mx-auto mt-14 max-w-2xl space-y-4">
          {[
            "Tu rejoins gratuitement le programme.",
            "Tu reçois ton lien personnel.",
            "Tu partages Eclosia librement.",
            "Tu reçois automatiquement tes commissions selon les conditions du programme lorsqu'une personne achète via ton lien.",
          ].map((step, i) => (
            <motion.li
              key={step}
              initial={{ opacity: 0, x: -12 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6, delay: i * 0.08 }}
              className="flex items-start gap-4 rounded-2xl border border-border/60 bg-card px-5 py-4"
            >
              <span className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary/15 font-serif text-sm font-medium text-primary-dark">
                {i + 1}
              </span>
              <p className="text-[15px] leading-relaxed text-foreground/85">
                {step}
              </p>
            </motion.li>
          ))}
        </ol>
      </Section>

      {/* POURQUOI */}
      <Section id="pourquoi" className="bg-card">
        <motion.div {...fadeUp} className="mx-auto max-w-2xl text-center">
          <Eyebrow>Pourquoi devenir ambassadrice</Eyebrow>
          <h2 className="mt-4 font-serif text-[clamp(1.75rem,4vw,3rem)] leading-[1.1] tracking-tight text-night">
            Ce que tu y trouves
            <br />
            <span className="italic text-primary-dark">vraiment.</span>
          </h2>
        </motion.div>
        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: Heart, title: "Tu aides d'autres familles." },
            { icon: Sparkles, title: "Tu es récompensée pour ton partage." },
            { icon: Users, title: "Tu recommandes un outil que tu utilises réellement." },
            { icon: HeartHandshake, title: "Tu participes au développement d'Eclosia." },
          ].map(({ icon: Icon, title }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6, delay: i * 0.05 }}
              className="rounded-2xl border border-border/60 bg-background p-6"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/15">
                <Icon className="h-4 w-4 text-primary-dark" />
              </div>
              <p className="mt-4 text-sm font-medium leading-snug text-night">
                {title}
              </p>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* VALEURS */}
      <Section id="valeurs">
        <motion.div
          {...fadeUp}
          className="mx-auto max-w-3xl overflow-hidden rounded-[2rem] border border-border/60 bg-card p-10 text-center md:p-14"
        >
          <Eyebrow>Nos valeurs</Eyebrow>
          <h2 className="mt-4 font-serif text-[clamp(1.5rem,3.5vw,2.5rem)] leading-tight text-night">
            Une recommandation
            <br />
            <span className="italic text-primary-dark">sincère avant tout.</span>
          </h2>
          <div className="mt-6 space-y-4 text-[15px] leading-relaxed text-foreground/80">
            <p>
              Nous ne croyons pas au marketing agressif. Nous croyons qu'une
              recommandation honnête a bien plus de valeur qu'un discours
              commercial.
            </p>
            <p className="font-medium text-night">
              Si Eclosia ne t'aide pas, ne le recommande pas. Si Eclosia
              t'aide, parle-en naturellement autour de toi.
            </p>
          </div>
        </motion.div>
      </Section>

      {/* FAQ */}
      <Section id="faq" className="bg-card">
        <motion.div {...fadeUp} className="mx-auto max-w-2xl">
          <div className="text-center">
            <Eyebrow>FAQ</Eyebrow>
            <h2 className="mt-4 font-serif text-[clamp(1.75rem,4vw,3rem)] leading-[1.1] tracking-tight text-night">
              Les questions
              <br />
              <span className="italic text-primary-dark">les plus posées.</span>
            </h2>
          </div>
          <Accordion type="single" collapsible className="mt-10 w-full">
            {[
              { q: "Est-ce gratuit ?", a: "Oui." },
              { q: "Suis-je obligée de vendre ?", a: "Non." },
              { q: "Dois-je avoir une communauté ?", a: "Non." },
              {
                q: "Comment sont versées les commissions ?",
                a: "Les commissions sont enregistrées automatiquement et versées selon les conditions du programme.",
              },
              { q: "Puis-je arrêter quand je veux ?", a: "Oui." },
            ].map((item, i) => (
              <AccordionItem key={item.q} value={`item-${i}`}>
                <AccordionTrigger className="text-left text-sm font-semibold md:text-base">
                  {item.q}
                </AccordionTrigger>
                <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                  {item.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </Section>

      {/* CTA FINAL */}
      <section className="bg-night px-6 py-24 text-night-foreground md:py-32">
        <motion.div {...fadeUp} className="mx-auto max-w-2xl text-center">
          <h2 className="font-serif text-[clamp(1.75rem,4vw,3rem)] leading-[1.1] tracking-tight">
            Aide d'autres familles
            <br />
            <span className="italic text-primary/90">à découvrir Eclosia.</span>
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-[15px] leading-relaxed text-night-foreground/75">
            Parce que les meilleures recommandations sont celles qui viennent
            du cœur.
          </p>
          <div className="mt-10">
            <Link
              to="/auth"
              className="group inline-flex items-center justify-center gap-2 rounded-full bg-background px-7 py-3.5 text-sm font-medium text-night transition-all duration-300 hover:-translate-y-[1px]"
            >
              Rejoindre le programme ambassadrice
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
            </Link>
          </div>
          <ul className="mx-auto mt-10 flex max-w-xl flex-wrap items-center justify-center gap-2">
            {["Gratuit", "Sans engagement", "Lien personnel", "Commissions automatiques"].map((b) => (
              <li
                key={b}
                className="inline-flex items-center gap-2 rounded-full border border-night-foreground/20 px-4 py-1.5 text-xs text-night-foreground/85"
              >
                <Check className="h-3.5 w-3.5 text-primary/90" />
                {b}
              </li>
            ))}
          </ul>
        </motion.div>
      </section>

      <Footer />
    </div>
  );
};

export default DevenirAmbassadrice;
