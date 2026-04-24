import SectionBlock from "@/components/SectionBlock";
import CTAButton from "@/components/CTAButton";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { Check, User, Lock } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useMolliePayment } from "@/hooks/useMolliePayment";
import logo from "@/assets/logo-ancrage.png";

const Index = () => {
  const { user } = useAuth();
  const { startPayment, loading: paymentLoading } = useMolliePayment();

  const handlePayment = () => {
    if (!user) {
      window.location.href = "/auth?redirect=/&action=pay";
      return;
    }
    startPayment();
  };

  return (
    <div className="home-gradient relative min-h-screen">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-3">
        <div />
        <Link to="/" className="flex flex-col items-center">
          <img src={logo} alt="Ancrage" className="h-12 w-auto" />
        </Link>
        <Link
          to={user ? "/profil" : "/auth"}
          className="flex items-center gap-1.5 rounded-full bg-card px-3 py-1.5 text-xs font-medium shadow-sm transition-colors hover:bg-secondary"
        >
          <User className="h-3.5 w-3.5" />
          {user ? "Mon espace" : "Connexion"}
        </Link>
      </div>

      {/* HERO — Nouveau positionnement universel */}
      <SectionBlock variant="blue">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="space-y-6 text-center"
        >
          <h1 className="text-2xl font-bold leading-tight tracking-tight md:text-3xl">
            Tu réfléchis trop.
            <br />
            Tu t'épuises sans comprendre.
            <br />
            <span className="text-primary">Et ton corps ne redescend pas.</span>
          </h1>
          <div className="space-y-2 pt-2">
            <p className="font-semibold">Ce n'est pas toi.</p>
            <p className="text-sm text-primary font-medium">
              👉 Ton système nerveux est en mode alerte.
            </p>
          </div>
          <div className="pt-2">
            <CTAButton to="/emotions">Essayer gratuitement</CTAButton>
          </div>
        </motion.div>
      </SectionBlock>

      {/* MÉCANISME */}
      <SectionBlock>
        <div className="space-y-4 text-center">
          <p className="text-lg font-bold">Tu n'as pas un problème de volonté</p>
          <p className="text-primary font-medium">👉 Tu es en état d'alerte permanent</p>
          <div className="space-y-2 text-muted-foreground">
            <p>Ton cerveau essaie de te protéger</p>
            <p>Mais il ne sait pas que c'est terminé</p>
          </div>
        </div>
      </SectionBlock>

      {/* COMMENT ÇA MARCHE */}
      <SectionBlock variant="blue">
        <h2 className="mb-2 text-xl font-bold text-center">Ici, tu ne vas pas réfléchir</h2>
        <p className="mb-6 text-sm text-primary font-medium text-center">
          👉 tu vas agir directement sur ton corps
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
      </SectionBlock>

      {/* URGENCE */}
      <SectionBlock>
        <div className="space-y-4 text-center">
          <p className="text-lg font-bold">Plus tu attends…</p>
          <p className="font-semibold text-primary">plus ton corps reste bloqué dans cet état</p>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>👉 ton système s'habitue à l'alerte</p>
            <p>👉 ça devient ton "normal"</p>
          </div>
          <p className="font-medium">Et ça ne disparaît pas tout seul.</p>
        </div>
      </SectionBlock>

      {/* PROJECTION */}
      <SectionBlock variant="blue">
        <div className="space-y-4 text-center">
          <p className="text-lg font-bold">Dans quelques minutes :</p>
          <ul className="space-y-3">
            {[
              "ton corps redescend",
              "ton mental ralentit",
              "tu respires enfin",
            ].map((item) => (
              <li key={item} className="flex items-center justify-center gap-3">
                <Check className="h-5 w-5 shrink-0 text-primary" />
                <span className="font-medium">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </SectionBlock>

      {/* SOCIAL PROOF — sans témoignages */}
      <SectionBlock>
        <div className="space-y-4 text-center">
          <p className="text-sm text-muted-foreground">Tu n'es pas la seule à ressentir ça.</p>
          <p className="font-semibold">Des femmes utilisent Ancrage pour ces moments-là.</p>
          <p className="text-sm text-muted-foreground italic">
            J'ai créé ça parce que j'en avais besoin moi aussi.
          </p>
        </div>
      </SectionBlock>

      {/* PRIX + CTA */}
      <SectionBlock variant="blue">
        <div className="rounded-2xl bg-card p-8 text-center shadow-sm">
          <p className="text-sm font-medium text-muted-foreground">Accéder à</p>
          <p className="mt-1 text-2xl font-bold text-primary">ANCRAGE</p>

          <div className="mt-4 rounded-xl bg-primary/5 border border-primary/10 p-4 space-y-2">
            <p className="text-3xl font-bold">39€</p>
            <p className="text-xs text-muted-foreground">Paiement unique · Accès à vie</p>
            <div className="space-y-1 text-sm text-muted-foreground text-left pt-2">
              <p>✔ Rituel quotidien complet</p>
              <p>✔ Bouton urgence “Ça déborde”</p>
              <p>✔ Espace santé (RDV, médicaments, fiche urgence)</p>
              <p>✔ Ressources France</p>
              <p>✔ Notes privées</p>
              <p>✔ Badges et progression</p>
              <p>✔ Parcours 4 phases</p>
              <p>✔ Accès à vie — aucun abonnement</p>
            </div>
          </div>

          <div className="mt-4">
            <CTAButton to="#" onClick={handlePayment} loading={paymentLoading}>
              Je veux me sentir mieux — 39€
            </CTAButton>
          </div>

          <p className="mt-3 text-xs text-muted-foreground">
            Paiement unique. Accès à vie. 100% sécurisé via Mollie.
          </p>

          <div className="mt-3 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
            <Lock className="h-3.5 w-3.5" />
            <span>Paiement 100% sécurisé via Mollie</span>
          </div>
        </div>
      </SectionBlock>

      {/* RASSURANCE FINALE */}
      <SectionBlock>
        <div className="space-y-4 text-center">
          <p className="font-semibold">Tu peux commencer maintenant</p>
          <div className="space-y-1 text-sm text-muted-foreground">
            <p>👉 sans te justifier</p>
            <p>👉 sans te forcer</p>
            <p>👉 à ton rythme</p>
          </div>
          <div className="mt-4">
            <CTAButton to="/emotions">Essayer gratuitement</CTAButton>
          </div>
        </div>
      </SectionBlock>

      <Footer />
    </div>
  );
};

export default Index;
