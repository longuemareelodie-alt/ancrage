import SectionBlock from "@/components/SectionBlock";
import CTAButton from "@/components/CTAButton";
import EmergencySection from "@/components/EmergencySection";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { Check, User, Lock } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import logo from "@/assets/logo-ancrage.png";

const MOLLIE_LINK = "https://payment-links.mollie.com/payment/Uqs26mrjXBFeWj5oK8hkr";

const Index = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background">
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
            <CTAButton to="/emotions">Je veux que mon corps redescende</CTAButton>
          </div>
        </motion.div>
      </SectionBlock>

      {/* IDENTIFICATION */}
      <SectionBlock>
        <h2 className="mb-4 text-xl font-bold">Tu fais peut-être ça sans t'en rendre compte :</h2>
        <ul className="space-y-3 text-muted-foreground">
          {[
            "tu analyses tout",
            "tu anticipes tout",
            "tu te sens en danger sans raison",
            "tu doutes de toi en permanence",
            "tu es épuisée sans comprendre pourquoi",
          ].map((item) => (
            <li key={item} className="flex items-start gap-3">
              <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
        <p className="mt-6 text-sm text-muted-foreground">
          👉 et tu penses que le problème vient de toi
        </p>
        <p className="mt-2 text-sm font-semibold text-primary">👉 Tu n'inventes rien.</p>
      </SectionBlock>

      {/* MÉCANISME */}
      <SectionBlock variant="blue">
        <div className="space-y-4 text-center">
          <p className="text-lg font-bold">Tu n'as pas un problème de volonté</p>
          <p className="text-primary font-medium">👉 Tu es en état d'alerte</p>
          <div className="space-y-2 text-muted-foreground">
            <p>Ton cerveau essaie de te protéger</p>
            <p>Mais il ne sait pas que c'est terminé</p>
          </div>
          <p className="mt-2 font-semibold text-primary">
            👉 Ton corps rejoue encore le danger
          </p>
        </div>
      </SectionBlock>

      {/* TENSION */}
      <SectionBlock>
        <div className="space-y-4 text-center">
          <p className="text-lg font-bold">Et le problème…</p>
          <p className="font-semibold text-primary">c'est que ça ne disparaît pas tout seul</p>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>👉 ton corps s'habitue à cet état</p>
            <p>👉 ça devient ton "normal"</p>
          </div>
          <p className="font-medium">Et tu restes bloquée dedans</p>
        </div>
      </SectionBlock>

      {/* COMMENT ÇA MARCHE */}
      <SectionBlock variant="blue">
        <h2 className="mb-2 text-xl font-bold">Ici, tu ne vas pas réfléchir</h2>
        <p className="mb-6 text-sm text-primary font-medium">
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
              <span>{step}</span>
            </div>
          ))}
        </div>
        <p className="mt-4 text-sm text-muted-foreground">👉 même légèrement</p>
        <p className="mt-1 text-sm font-semibold text-primary">
          Et c'est là que tout commence à changer
        </p>
        <div className="mt-6">
          <CTAButton to="/emotions">Je veux essayer maintenant</CTAButton>
        </div>
      </SectionBlock>

      {/* PROJECTION (modifiée — moins généreuse) */}
      <SectionBlock>
        <h2 className="mb-2 text-xl font-bold text-center">En continuant…</h2>
        <p className="mb-6 text-sm text-muted-foreground text-center">
          tu peux ressentir :
        </p>
        <ul className="space-y-3">
          {[
            "encore plus de calme",
            "un vrai relâchement",
            "un mental qui ralentit vraiment",
          ].map((item) => (
            <li key={item} className="flex items-center gap-3">
              <Check className="h-5 w-5 shrink-0 text-primary" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-sm font-semibold text-primary text-center">
          👉 mais seulement si tu vas jusqu'au bout
        </p>
      </SectionBlock>

      {/* DÉCLENCHEUR / RISQUE */}
      <SectionBlock variant="blue">
        <div className="space-y-4 text-center">
          <p className="text-lg font-bold">Si tu ne fais rien :</p>
          <ul className="space-y-2 text-muted-foreground text-left">
            {[
              "ton corps restera en alerte",
              "tu continueras à douter",
              "tu resteras épuisée",
              "tu risques de revivre les mêmes schémas",
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

      {/* FILTRE */}
      <SectionBlock>
        <div className="space-y-6">
          <div>
            <p className="font-bold mb-3">Cet outil n'est pas pour toi si :</p>
            <ul className="space-y-2 text-muted-foreground">
              <li className="flex items-start gap-3">
                <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-destructive" />
                <span>tu veux tout résoudre en réfléchissant</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-destructive" />
                <span>tu refuses d'écouter ton corps</span>
              </li>
            </ul>
          </div>
          <div>
            <p className="font-bold mb-3">Par contre, il est pour toi si :</p>
            <ul className="space-y-2 text-muted-foreground">
              <li className="flex items-start gap-3">
                <Check className="h-4 w-4 shrink-0 text-primary mt-0.5" />
                <span>tu veux sortir concrètement de cet état</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="h-4 w-4 shrink-0 text-primary mt-0.5" />
                <span>tu veux te sentir mieux rapidement</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="h-4 w-4 shrink-0 text-primary mt-0.5" />
                <span>tu es prête à faire des actions simples</span>
              </li>
            </ul>
          </div>
        </div>
      </SectionBlock>

      {/* POURQUOI PAYER */}
      <SectionBlock variant="blue">
        <div className="space-y-4 text-center">
          <p className="text-lg font-bold">Ce que tu as essayé avant :</p>
          <ul className="space-y-2 text-muted-foreground">
            <li>• réfléchir</li>
            <li>• analyser</li>
            <li>• attendre que ça passe</li>
          </ul>
          <p className="font-semibold text-primary">👉 ça ne marche pas</p>
          <p className="text-muted-foreground">Parce que le problème n'est pas mental</p>
          <p className="font-bold text-primary">👉 il est dans ton système nerveux</p>
        </div>
      </SectionBlock>

      {/* POSITIONNEMENT PRODUIT */}
      <SectionBlock>
        <div className="space-y-4 text-center">
          <p className="text-lg font-bold">ANCRAGE n'est pas :</p>
          <div className="space-y-2 text-muted-foreground">
            <p>❌ une thérapie</p>
            <p>❌ du blabla</p>
            <p>❌ de la motivation</p>
          </div>
          <p className="font-bold text-primary mt-4">👉 c'est un outil concret</p>
          <p className="text-muted-foreground">qui agit directement sur ton corps</p>
        </div>
      </SectionBlock>

      {/* PRIX + CTA */}
      <SectionBlock variant="blue">
        <div className="rounded-2xl bg-card p-8 text-center shadow-sm">
          <p className="text-sm font-medium text-muted-foreground">Accéder à</p>
          <p className="mt-1 text-2xl font-bold text-primary">ANCRAGE</p>
          <p className="mt-2 text-3xl font-bold">29€</p>
          <div className="mt-4 space-y-1 text-sm text-muted-foreground">
            <p>✔ Accès immédiat</p>
            <p>✔ Utilisable à vie</p>
            <p>✔ Aucun abonnement</p>
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
      <SectionBlock>
        <div className="space-y-4 text-center">
          <p className="font-semibold">Tu peux commencer maintenant</p>
          <div className="space-y-1 text-sm text-muted-foreground">
            <p>👉 sans te justifier</p>
            <p>👉 sans te forcer</p>
            <p>👉 sans te mettre en danger</p>
            <p>👉 à ton rythme</p>
          </div>
          <div className="mt-4">
            <CTAButton to={MOLLIE_LINK}>Je reprends le contrôle — 29€</CTAButton>
          </div>
        </div>
      </SectionBlock>

      {/* SECTION URGENCE */}
      <EmergencySection />

      {/* FOOTER */}
      <Footer />
    </div>
  );
};

export default Index;
