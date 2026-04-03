import SectionBlock from "@/components/SectionBlock";
import CTAButton from "@/components/CTAButton";
import { motion } from "framer-motion";
import { Check } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* HERO */}
      <SectionBlock variant="blue">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="space-y-6 text-center"
        >
          <h1 className="text-2xl font-bold leading-tight tracking-tight md:text-3xl">
            Tu es sortie de la relation…
            <br />
            <span className="text-primary">mais ton corps est resté en alerte</span>
          </h1>
          <div className="space-y-1 text-muted-foreground">
            <p>Tu sursautes.</p>
            <p>Tu doutes.</p>
            <p>Tu t'épuises.</p>
            <p>Tu réfléchis trop.</p>
          </div>
          <p className="text-sm text-muted-foreground">👉 Même quand tout est "fini"</p>
          <div className="space-y-2 pt-2">
            <p className="font-semibold">Ce n'est pas toi le problème.</p>
            <p className="text-sm text-primary font-medium">👉 Ton système nerveux est resté bloqué.</p>
          </div>
          <div className="pt-4">
            <CTAButton to="/emotions">Commencer maintenant</CTAButton>
          </div>
        </motion.div>
      </SectionBlock>

      {/* IDENTIFICATION */}
      <SectionBlock>
        <h2 className="mb-6 text-xl font-bold">Tu peux te reconnaître si :</h2>
        <ul className="space-y-3 text-muted-foreground">
          {[
            "tu es à fleur de peau",
            "tu es en vigilance constante",
            "tu n'arrives plus à réfléchir clairement",
            "tu doutes de toi",
            "tu te sens épuisée sans raison",
            "tu te sens encore « coincée » intérieurement",
          ].map((item) => (
            <li key={item} className="flex items-start gap-3">
              <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
        <p className="mt-6 text-sm font-semibold text-primary">👉 Tu n'inventes rien.</p>
      </SectionBlock>

      {/* RASSURANCE */}
      <SectionBlock variant="blue">
        <div className="space-y-4 text-center">
          <p className="text-lg">Tu n'as pas besoin de tout comprendre maintenant.</p>
          <p className="text-lg">Tu n'as pas besoin d'aller vite.</p>
          <p className="mt-4 font-semibold text-primary">👉 Tu as besoin de te stabiliser</p>
        </div>
      </SectionBlock>

      {/* COMMENT ÇA MARCHE */}
      <SectionBlock>
        <h2 className="mb-6 text-xl font-bold">Comment ça marche</h2>
        <div className="space-y-4">
          {[
            { num: "1", text: "Tu choisis comment tu te sens" },
            { num: "2", text: "Tu suis une action simple" },
            { num: "3", text: "Ton corps redescend (même un peu)" },
          ].map((step) => (
            <div key={step.num} className="flex items-center gap-4 rounded-xl bg-card p-4 shadow-sm">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                {step.num}
              </span>
              <span>{step.text}</span>
            </div>
          ))}
        </div>
        <div className="mt-6 space-y-1 text-sm text-muted-foreground">
          <p>👉 Pas de théorie</p>
          <p>👉 Pas de pression</p>
          <p>👉 Juste du concret</p>
        </div>
        <div className="mt-6">
          <CTAButton to="/emotions">Accéder à l'outil</CTAButton>
        </div>
      </SectionBlock>

      {/* OFFRE */}
      <SectionBlock variant="blue">
        <h2 className="mb-2 text-xl font-bold">Si tu veux aller plus loin :</h2>
        <p className="mb-6 text-lg font-bold text-primary">ANCRAGE t'aide à :</p>
        <ul className="space-y-3">
          {[
            "calmer ton système nerveux",
            "comprendre ce que tu as vécu",
            "reprendre du pouvoir",
            "te reconstruire progressivement",
          ].map((item) => (
            <li key={item} className="flex items-start gap-3">
              <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
        <div className="mt-4 space-y-1 text-sm text-muted-foreground">
          <p>👉 À ton rythme</p>
          <p>👉 Sans pression</p>
          <p>👉 Sans danger</p>
        </div>
      </SectionBlock>

      {/* BÉNÉFICES */}
      <SectionBlock>
        <h2 className="mb-6 text-xl font-bold">Ce que tu vas retrouver</h2>
        <ul className="space-y-3">
          {[
            "calmer ton corps",
            "arrêter de te sentir perdue",
            "comprendre tes réactions",
            "reprendre des décisions",
            "retrouver de la clarté",
          ].map((item) => (
            <li key={item} className="flex items-center gap-3">
              <Check className="h-5 w-5 shrink-0 text-primary" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </SectionBlock>

      {/* PRIX */}
      <SectionBlock variant="blue">
        <div className="rounded-2xl bg-card p-8 text-center shadow-sm">
          <p className="text-sm font-medium text-muted-foreground">Accéder à</p>
          <p className="mt-1 text-2xl font-bold text-primary">ANCRAGE</p>
          <p className="mt-2 text-3xl font-bold">29€</p>
          <div className="mt-4 space-y-1 text-sm text-muted-foreground">
            <p>Paiement simple</p>
            <p>Accès immédiat</p>
            <p>Utilisable maintenant</p>
          </div>
          <div className="mt-6">
            <CTAButton to="/parcours">Je commence maintenant</CTAButton>
          </div>
        </div>
      </SectionBlock>

      {/* SÉCURITÉ */}
      <SectionBlock>
        <h2 className="mb-6 text-xl font-bold">Tu peux avancer ici sans :</h2>
        <ul className="space-y-3 text-muted-foreground">
          {["te justifier", "te forcer", "te mettre en danger"].map((item) => (
            <li key={item} className="flex items-start gap-3">
              <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-sm font-medium text-primary">👉 Tu avances à ton rythme</p>
        <div className="mt-6">
          <CTAButton to="/emotions">Commencer maintenant</CTAButton>
        </div>
      </SectionBlock>
    </div>
  );
};

export default Index;
