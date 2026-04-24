import { useNavigate } from "react-router-dom";
import SectionBlock from "@/components/SectionBlock";
import { Calendar, Pill, HeartPulse, Sparkles, ChevronRight } from "lucide-react";

const Sante = () => {
  const navigate = useNavigate();

  const items = [
    {
      key: "rdv",
      to: "/sante/rendez-vous",
      icon: Calendar,
      emoji: "📅",
      title: "Mes Rendez-vous",
      desc: "Agenda médical avec rappels automatiques",
    },
    {
      key: "med",
      to: "/sante/medicaments",
      icon: Pill,
      emoji: "💊",
      title: "Mes Médicaments",
      desc: "Suivi et rappels quotidiens",
    },
    {
      key: "fiche",
      to: "/sante/fiche-medicale",
      icon: HeartPulse,
      emoji: "🆘",
      title: "Fiche Médicale d'Urgence",
      desc: "Tes infos vitales accessibles via QR code",
    },
    {
      key: "ressources",
      to: "/sante/ressources",
      icon: Sparkles,
      emoji: "🌸",
      title: "Mes Ressources",
      desc: "Numéros et liens utiles en France",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <SectionBlock variant="blue">
        <h1 className="text-2xl font-bold">Mon espace santé 💗</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Tes outils pour prendre soin de toi au quotidien.
        </p>
      </SectionBlock>

      <SectionBlock>
        <div className="space-y-3">
          {items.map((item) => (
            <button
              key={item.key}
              onClick={() => navigate(item.to)}
              className="flex w-full items-center gap-4 rounded-2xl bg-card p-4 text-left shadow-sm transition-all hover:shadow-md active:scale-[0.98]"
            >
              <span className="text-3xl">{item.emoji}</span>
              <div className="flex-1">
                <p className="text-sm font-semibold">{item.title}</p>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </button>
          ))}
        </div>
      </SectionBlock>
    </div>
  );
};

export default Sante;
