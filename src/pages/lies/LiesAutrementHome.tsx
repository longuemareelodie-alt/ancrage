import { Link } from "react-router-dom";
import { BookOpen, BookHeart, ShieldAlert, NotebookPen, Users, Handshake, Sparkles, Rainbow } from "lucide-react";
import LiesShell from "@/components/lies/LiesShell";

const MODULES = [
  {
    to: "/lies-autrement/lsf",
    title: "Apprendre la LSF",
    desc: "Premiers signes pour communiquer avec votre enfant : besoins, émotions, routine, famille.",
    icon: BookOpen,
  },
  {
    to: "/lies-autrement/ressources",
    title: "Ressources & troubles",
    desc: "Comprendre TSA, TDAH, DYS, épilepsie… et trouver les bonnes ressources françaises.",
    icon: BookHeart,
  },
  {
    to: "/lies-autrement/crise",
    title: "Gérer une crise",
    desc: "Étapes claires pour traverser un épisode, à la maison ou à l'extérieur. Carte d'aide PDF.",
    icon: ShieldAlert,
  },
  {
    to: "/lies-autrement/journal",
    title: "Mon journal privé",
    desc: "Un espace d'écriture rien qu'à vous. Libre ou guidé. 100 % privé.",
    icon: NotebookPen,
  },
  {
    to: "/lies-autrement/communaute",
    title: "Communauté",
    desc: "Échanger avec d'autres parents qui vivent quelque chose de similaire.",
    icon: Users,
  },
  {
    to: "/lies-autrement/activites",
    title: "Activités & lien",
    desc: "Idées d'activités par âge et selon les besoins : TSA, TDAH, DYS, surdité, hypersensibilité…",
    icon: Sparkles,
  },
  {
    to: "/comment-tu-te-sens",
    title: "Comment tu te sens ?",
    desc: "Aide ton enfant à mettre des mots sur ses émotions et anticipe les crises.",
    icon: Rainbow,
  },
];

const LiesAutrementHome = () => {
  return (
    <LiesShell
      title="Liés autrement"
      subtitle="Un espace pour les familles qui avancent autrement, à leur rythme."
      backTo="/dashboard"
      icon={<Handshake className="h-6 w-6" />}
    >
      <div className="grid gap-3 sm:grid-cols-2">
        {MODULES.map(({ to, title, desc, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            className="group flex flex-col rounded-2xl border border-border bg-card p-5 transition-all hover:border-[hsl(var(--lies))] hover:shadow-soft"
          >
            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-[hsl(var(--lies)/0.12)] text-[hsl(var(--lies))] transition-colors group-hover:bg-[hsl(var(--lies)/0.2)]">
              <Icon className="h-5 w-5" />
            </div>
            <h2 className="font-serif text-xl text-foreground">{title}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
          </Link>
        ))}
      </div>
    </LiesShell>
  );
};

export default LiesAutrementHome;
