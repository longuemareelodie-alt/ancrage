import SectionBlock from "@/components/SectionBlock";
import CTAButton from "@/components/CTAButton";
import EmergencySection from "@/components/EmergencySection";
import { motion } from "framer-motion";
import { Check, User, Lock } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const MOLLIE_LINK = "#"; // TODO: remplacer par le lien Mollie

const Index = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <div className="flex items-center justify-end px-4 py-3">
        <Link
          to={user ? "/profil" : "/auth"}
          className="flex items-center gap-1.5 rounded-full bg-card px-3 py-1.5 text-xs font-medium shadow-sm transition-colors hover:bg-secondary"
        >
          <User className="h-3.5 w-3.5" />
          {user ? "Mon espace" : "Connexion"}
        </Link>
      </div>

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
            <span className="text-primary">mais ton corps est encore bloqué dedans</span>
          </h1>
          <div className="space-y-1 text-muted-foreground">
            <p>Tu sursautes.</p>
            <p>Tu réfléchis trop.</p>
            <p>Tu t'épuises sans comprendre.</p>
          </div>
          <p className="text-sm text-muted-foreground">👉 Même quand "tout est fini"</p>
          <div className="space-y-2 pt-2">
            <p className="font-semibold">Ce n'est pas toi.</p>
            <p className="text-sm text-primary font-medium">
              👉 Ton système nerveux est resté en mode survie.
            </p>
            <p className="text-sm text-muted-foreground">
              Et tant qu'il ne redescend pas… tu restes coincée.
            </p>
          </div>
          <p className="text-xs text-muted-foreground">👇 Commence maintenant à en sortir</p>
          <div className="pt-2">
            <CTAButton to="/emotions">Je veux sortir de cet état</CTAButton>
          </div>
        </motion.div>
      </SectionBlock>

      {/* IDENTIFICATION */}
      <SectionBlock>
        <h2 className="mb-4 text-xl font-bold">Si tu te reconnais…</h2>
        <p className="mb-6 text-sm text-muted-foreground">
          c'est que ton corps n'a jamais vraiment quitté la relation.
        </p>
        <ul className="space-y-3 text-muted-foreground">
          {[
            "tu es à fleur de peau",
            "tu es en vigilance constante",
            "tu n'arrives plus à réfléchir clairement",
            "tu doutes de toi",
            "tu es épuisée sans raison",
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

      {/* MÉCANISME */}
      <SectionBlock variant="blue">
        <div className="space-y-4 text-center">
          <p className="text-lg font-bold">Tu n'as pas un problème de volonté</p>
          <div className="space-y-2 text-muted-foreground">
            <p>Tu es en état d'alerte</p>
            <p>Ton cerveau cherche à te protéger</p>
            <p>Mais il ne sait pas que c'est terminé</p>
          </div>
          <p className="mt-2 font-semibold text-primary">
            👉 Ton corps rejoue encore le danger
          </p>
        </div>
      </SectionBlock>

      {/* COMMENT ÇA MARCHE */}
      <SectionBlock>
        <h2 className="mb-2 text-xl font-bold">Comment ça marche</h2>
        <p className="mb-6 text-sm text-muted-foreground">
          Tu ne vas pas réfléchir. Tu vas agir directement sur ton corps.
        </p>
        <div className="space-y-4">
          {[
            { num: "1", text: "Tu identifies ton état" },
            { num: "2", text: "Tu fais une action simple" },
            { num: "3", text: "Ton système redescend" },
          ].map((step) => (
            <div key={step.num} className="flex items-center gap-4 rounded-xl bg-card p-4 shadow-sm">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                {step.num}
              </span>
              <span>{step.text}</span>
            </div>
          ))}
        </div>
        <p className="mt-4 text-sm text-muted-foreground">👉 Même légèrement</p>
        <p className="mt-1 text-sm font-semibold text-primary">
          Et c'est là que tout commence à changer
        </p>
        <div className="mt-6">
          <CTAButton to="/emotions">Accéder à l'outil</CTAButton>
        </div>
      </SectionBlock>

      {/* PROJECTION */}
      <SectionBlock variant="blue">
        <h2 className="mb-6 text-xl font-bold">Ce que tu vas retrouver</h2>
        <ul className="space-y-3">
          {[
            "un corps plus calme",
            "moins de pensées qui tournent",
            "des décisions plus claires",
            "moins de peur",
            "plus de contrôle",
          ].map((item) => (
            <li key={item} className="flex items-center gap-3">
              <Check className="h-5 w-5 shrink-0 text-primary" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
        <p className="mt-6 text-sm font-semibold text-primary">👉 Tu redeviens toi</p>
      </SectionBlock>

      {/* DÉCLENCHEUR */}
      <SectionBlock>
        <div className="space-y-4 text-center">
          <p className="text-lg font-bold">Si tu ne fais rien :</p>
          <ul className="space-y-2 text-muted-foreground text-left">
            {[
              "ton corps restera en alerte",
              "tu continueras à douter",
              "tu resteras épuisée",
              "tu risques de retomber dans les mêmes schémas",
            ].map((item) => (
              <li key={item} className="flex items-start gap-3">
                <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-destructive" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <p className="text-sm text-muted-foreground">
            👉 Ce n'est pas une question de volonté
          </p>
          <p className="font-semibold text-primary">
            Ton système nerveux a besoin d'un cadre
          </p>
        </div>
      </SectionBlock>

      {/* PREUVE */}
      <SectionBlock variant="blue">
        <div className="space-y-4 text-center">
          <p className="text-lg text-muted-foreground">
            Beaucoup de femmes vivent cet état sans le comprendre
          </p>
          <p className="font-semibold text-primary">
            Aujourd'hui, tu mets enfin des mots dessus
          </p>
        </div>
      </SectionBlock>

      {/* PRIX + CTA */}
      <SectionBlock>
        <div className="rounded-2xl bg-card p-8 text-center shadow-sm">
          <p className="text-sm font-medium text-muted-foreground">Accéder à</p>
          <p className="mt-1 text-2xl font-bold text-primary">ANCRAGE</p>
          <p className="mt-2 text-3xl font-bold">29€</p>
          <div className="mt-4 space-y-1 text-sm text-muted-foreground">
            <p>✔ Paiement sécurisé</p>
            <p>✔ Accès immédiat</p>
            <p>✔ Utilisable à vie</p>
          </div>
          <div className="mt-2 space-y-1 text-xs text-muted-foreground">
            <p>👉 Moins qu'une séance</p>
            <p>👉 Mais utilisable tous les jours</p>
          </div>
          <div className="mt-6">
            <CTAButton to={MOLLIE_LINK}>Je reprends le contrôle — 29€</CTAButton>
          </div>
          <div className="mt-4 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
            <Lock className="h-3.5 w-3.5" />
            <span>Paiement 100% sécurisé via Mollie</span>
          </div>
        </div>
      </SectionBlock>

      {/* RASSURANCE FINALE */}
      <SectionBlock variant="blue">
        <div className="space-y-4 text-center">
          <p className="font-semibold">Tu peux commencer maintenant</p>
          <div className="space-y-1 text-sm text-muted-foreground">
            <p>👉 sans te justifier</p>
            <p>👉 sans te forcer</p>
            <p>👉 sans te mettre en danger</p>
            <p>👉 à ton rythme</p>
          </div>
          <div className="mt-4">
            <CTAButton to="/emotions">Je veux sortir de cet état</CTAButton>
          </div>
        </div>
      </SectionBlock>

      {/* SECTION URGENCE */}
      <EmergencySection />

      {/* CADRE LÉGAL */}
      <div className="px-6 py-6 text-center text-xs text-muted-foreground">
        Cet outil ne remplace pas un accompagnement médical, juridique ou psychologique.
      </div>
    </div>
  );
};

export default Index;
