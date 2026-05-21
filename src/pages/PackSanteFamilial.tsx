import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  HeartPulse,
  Users,
  ShieldCheck,
  Clock,
  CalendarCheck,
  QrCode,
  Pill,
  FileText,
  ArrowRight,
  Check,
} from "lucide-react";
import Breadcrumb from "@/components/Breadcrumb";

const features = [
  {
    icon: Users,
    title: "Profils famille",
    desc: "Un dossier pour toi, ton/ta partenaire et chaque enfant. Tout au même endroit, plus jamais à chercher dans 4 carnets.",
  },
  {
    icon: ShieldCheck,
    title: "Coffre-fort médical",
    desc: "Groupe sanguin, allergies, traitements, antécédents. Stockés en sécurité, accessibles à toi seule.",
  },
  {
    icon: Clock,
    title: "Timeline médicale",
    desc: "Chaque RDV, vaccin, ordonnance, symptôme : une frise claire pour comprendre l'historique d'un coup d'œil.",
  },
  {
    icon: CalendarCheck,
    title: "Préparation RDV",
    desc: "Questions à poser, symptômes à décrire, derniers traitements. Tu n'oublies plus rien dans la salle d'attente.",
  },
  {
    icon: Pill,
    title: "Suivi des médicaments",
    desc: "Posologies, horaires, fin de traitement. Des rappels pour ne plus zapper une prise.",
  },
  {
    icon: QrCode,
    title: "Fiche d'urgence partageable",
    desc: "Un QR code à montrer aux secours. Tes infos vitales accessibles en 3 secondes, sans déverrouiller ton téléphone.",
  },
];

const steps = [
  {
    n: "01",
    title: "Crée les profils de ta famille",
    desc: "Toi, partenaire, enfants. 2 minutes par personne, et c'est fait pour toujours.",
  },
  {
    n: "02",
    title: "Remplis le coffre-fort",
    desc: "Allergies, traitements, antécédents importants. Tu peux y aller petit à petit, ça se garde.",
  },
  {
    n: "03",
    title: "Ajoute tes RDV et médicaments",
    desc: "Une fois rentrés, tu reçois les rappels et la timeline se construit toute seule.",
  },
  {
    n: "04",
    title: "Génère ta fiche d'urgence",
    desc: "Un QR code à coller dans ton portefeuille, sur le frigo, dans le sac à langer. Prêt si besoin.",
  },
];

const PackSanteFamilial = () => {
  return (
    <div className="min-h-screen bg-background">
      <Breadcrumb items={[{ label: "Pack Santé familial" }]} />
      <div className="flex flex-col px-5 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mx-auto w-full max-w-md space-y-8"
        >
          {/* Hero */}
          <div className="text-center space-y-3">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.2, 1] }}
              transition={{ duration: 0.5 }}
              className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/15 text-primary"
            >
              <HeartPulse className="h-8 w-8" />
            </motion.div>
            <p className="text-xs font-semibold uppercase tracking-wide text-primary">
              Inclus dans l'accès à vie
            </p>
            <h1 className="text-2xl font-bold leading-tight">
              🏥 Cerveau médical familial
            </h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Toute la charge médicale de ta famille en un seul endroit.
              <br />
              Tu poses, on s'occupe de te le rappeler.
            </p>
          </div>

          {/* Promesse */}
          <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5">
            <p className="text-sm leading-relaxed text-foreground">
              Plus de carnets perdus. Plus de "c'était quand sa dernière otite ?".
              Plus de panique aux urgences. Tu décharges ta tête, l'app retient
              pour toi.
            </p>
          </div>

          {/* Fonctionnalités */}
          <div className="space-y-3">
            <h2 className="text-lg font-bold">Ce que tu débloques</h2>
            <div className="space-y-3">
              {features.map((f) => (
                <div
                  key={f.title}
                  className="flex gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
                    <f.icon className="h-5 w-5" />
                  </span>
                  <div className="space-y-1">
                    <p className="text-sm font-semibold">{f.title}</p>
                    <p className="text-xs leading-relaxed text-muted-foreground">
                      {f.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Étapes */}
          <div className="space-y-3">
            <h2 className="text-lg font-bold">Comment ça marche</h2>
            <ol className="space-y-3">
              {steps.map((s) => (
                <li
                  key={s.n}
                  className="flex gap-4 rounded-2xl bg-card p-4 shadow-sm"
                >
                  <span className="text-2xl font-bold text-primary">{s.n}</span>
                  <div className="space-y-1">
                    <p className="text-sm font-semibold">{s.title}</p>
                    <p className="text-xs leading-relaxed text-muted-foreground">
                      {s.desc}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          {/* Pour qui */}
          <div className="rounded-2xl border border-border bg-card p-5 space-y-2">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              <p className="text-sm font-semibold">Pour qui ?</p>
            </div>
            <ul className="space-y-1.5 text-xs text-muted-foreground">
              <li className="flex items-start gap-2">
                <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                <span>Parents qui jonglent avec plusieurs suivis médicaux</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                <span>Familles avec enfants atypiques, allergiques, à pathologie chronique</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                <span>Aidants de parents âgés</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                <span>Toutes celles qui ne veulent plus avoir cette charge dans la tête</span>
              </li>
            </ul>
          </div>

          {/* CTA */}
          <Link
            to="/paywall"
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/25 transition-transform hover:scale-[1.02] active:scale-[0.98]"
          >
            Débloquer le Pack Santé familial — 57€
            <ArrowRight className="h-4 w-4" />
          </Link>
          <p className="text-center text-xs text-muted-foreground">
            Paiement unique · Accès à vie · Sans abonnement
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default PackSanteFamilial;
