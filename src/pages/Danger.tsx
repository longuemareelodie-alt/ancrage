import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowLeft, Phone, MessageCircle, ShieldAlert, HeartPulse, Wind, Hand } from "lucide-react";

type HelpLine = {
  name: string;
  number: string;
  href: string;
  desc: string;
  available: string;
  tone?: "destructive" | "primary";
};

const LINES: HelpLine[] = [
  {
    name: "Urgences européennes",
    number: "112",
    href: "tel:112",
    desc: "Police, pompiers, SAMU — danger immédiat.",
    available: "24h/24, 7j/7",
    tone: "destructive",
  },
  {
    name: "SAMU (France)",
    number: "15",
    href: "tel:15",
    desc: "Urgence médicale ou psychiatrique.",
    available: "24h/24, 7j/7",
    tone: "destructive",
  },
  {
    name: "3919 — Violences faites aux femmes",
    number: "3919",
    href: "tel:3919",
    desc: "Écoute anonyme et gratuite. N'apparaît pas sur la facture.",
    available: "24h/24, 7j/7",
  },
  {
    name: "3114 — Prévention du suicide",
    number: "3114",
    href: "tel:3114",
    desc: "Si tu penses à mettre fin à ta vie, ou pour quelqu'un qui te préoccupe.",
    available: "24h/24, 7j/7",
  },
  {
    name: "119 — Enfance en danger",
    number: "119",
    href: "tel:119",
    desc: "Si un enfant est en danger (le tien, un autre).",
    available: "24h/24, 7j/7",
  },
  {
    name: "SOS Amitié",
    number: "09 72 39 40 50",
    href: "tel:0972394050",
    desc: "Écoute pour aller mieux quand tu te sens seule ou submergée.",
    available: "24h/24, 7j/7",
  },
];

const STEPS = [
  {
    icon: Phone,
    title: "Appelle quelqu'un — maintenant",
    desc: "Compose un des numéros ci-dessous. Tu n'as pas à expliquer parfaitement. Dis juste : « J'ai besoin d'aide. »",
  },
  {
    icon: ShieldAlert,
    title: "Mets-toi à l'abri",
    desc: "Sors de la pièce, va chez un voisin, dans un lieu public, dans ta voiture. La sécurité physique d'abord.",
  },
  {
    icon: Wind,
    title: "Respire — 4 secondes / 6 secondes",
    desc: "Inspire 4 sec par le nez, expire 6 sec par la bouche. Trois cycles. Ça calme le système nerveux en 30 secondes.",
  },
  {
    icon: Hand,
    title: "Ancre-toi dans le présent",
    desc: "Pose les pieds au sol. Nomme à voix basse 5 choses que tu vois, 4 que tu entends, 3 que tu touches.",
  },
];

const Danger = () => {
  return (
    <div className="min-h-screen bg-background pb-12">
      <div className="mx-auto max-w-2xl px-5 py-6">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-5"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="space-y-6"
        >
          {/* Headline */}
          <div className="rounded-2xl bg-destructive/10 border border-destructive/30 p-6 text-center space-y-2">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/20">
              <HeartPulse className="h-6 w-6 text-destructive" />
            </div>
            <h1 className="font-serif text-2xl font-semibold text-destructive">
              Tu n'es pas seule.
            </h1>
            <p className="text-sm text-foreground/80">
              Si tu es en danger immédiat, appelle le <strong>112</strong> tout de suite. Sinon, voici les étapes
              et les numéros qui peuvent t'aider, là, maintenant.
            </p>
            <a
              href="tel:112"
              className="mt-2 inline-flex items-center justify-center gap-2 rounded-xl bg-destructive px-6 py-3 text-base font-bold text-destructive-foreground shadow-lg shadow-destructive/30 transition-transform hover:scale-[1.02] active:scale-[0.98]"
            >
              <Phone className="h-5 w-5" />
              Appeler le 112
            </a>
          </div>

          {/* Immediate steps */}
          <section className="rounded-2xl bg-card p-5 shadow-soft space-y-4">
            <h2 className="font-serif text-lg font-semibold">Étapes immédiates</h2>
            <ol className="space-y-3">
              {STEPS.map((s, i) => {
                const Icon = s.icon;
                return (
                  <li key={i} className="flex gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold">
                        {i + 1}. {s.title}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">{s.desc}</p>
                    </div>
                  </li>
                );
              })}
            </ol>
          </section>

          {/* Help lines */}
          <section className="space-y-3">
            <h2 className="font-serif text-lg font-semibold">Numéros d'aide (France)</h2>
            <div className="grid grid-cols-1 gap-3">
              {LINES.map((l) => {
                const isUrgent = l.tone === "destructive";
                return (
                  <a
                    key={l.number}
                    href={l.href}
                    className={`flex items-center gap-4 rounded-2xl border p-4 shadow-soft transition-transform hover:scale-[1.01] active:scale-[0.99] ${
                      isUrgent
                        ? "bg-destructive/5 border-destructive/30"
                        : "bg-card border-border"
                    }`}
                  >
                    <div
                      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${
                        isUrgent ? "bg-destructive/15 text-destructive" : "bg-primary/10 text-primary"
                      }`}
                    >
                      <Phone className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2 flex-wrap">
                        <p className="font-bold text-base">{l.number}</p>
                        <p className="text-xs text-muted-foreground truncate">{l.name}</p>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{l.desc}</p>
                      <p className="mt-1 text-[11px] uppercase tracking-wide text-muted-foreground/80">
                        {l.available}
                      </p>
                    </div>
                  </a>
                );
              })}
            </div>
          </section>

          {/* Chat alternative */}
          <section className="rounded-2xl bg-primary/5 border border-primary/15 p-5 space-y-2">
            <div className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4 text-primary" />
              <h3 className="font-semibold text-sm">Tu préfères écrire ?</h3>
            </div>
            <p className="text-xs text-muted-foreground">
              Le <strong>3919</strong> propose un tchat sur{" "}
              <a
                href="https://arretonslesviolences.gouv.fr/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline-offset-2 hover:underline"
              >
                arretonslesviolences.gouv.fr
              </a>
              . Le <strong>3114</strong> propose un tchat sur{" "}
              <a
                href="https://3114.fr/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline-offset-2 hover:underline"
              >
                3114.fr
              </a>
              .
            </p>
          </section>

          <Link
            to="/urgence"
            className="block w-full rounded-xl bg-card border border-border px-6 py-3 text-center text-sm font-medium text-foreground shadow-soft hover:bg-secondary"
          >
            Revenir à « Sors du mode survie »
          </Link>
        </motion.div>
      </div>
    </div>
  );
};

export default Danger;
