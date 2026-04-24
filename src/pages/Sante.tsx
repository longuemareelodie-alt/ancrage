import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import SectionBlock from "@/components/SectionBlock";
import { Calendar, Pill, HeartPulse, Sparkles, ChevronRight, Lock } from "lucide-react";

const Sante = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [planType, setPlanType] = useState<string>("none");

  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("plan_type")
      .eq("user_id", user.id)
      .single()
      .then(({ data }) => setPlanType((data as any)?.plan_type ?? "none"));
  }, [user]);

  const isSubscription = planType === "subscription";

  const items = [
    {
      key: "rdv",
      to: "/sante/rendez-vous",
      icon: Calendar,
      emoji: "📅",
      title: "Mes Rendez-vous",
      desc: "Agenda médical avec rappels automatiques",
      locked: !isSubscription,
    },
    {
      key: "med",
      to: "/sante/medicaments",
      icon: Pill,
      emoji: "💊",
      title: "Mes Médicaments",
      desc: "Suivi et rappels quotidiens",
      locked: !isSubscription,
    },
    {
      key: "fiche",
      to: "/sante/fiche-medicale",
      icon: HeartPulse,
      emoji: "🆘",
      title: "Fiche Médicale d'Urgence",
      desc: "Tes infos vitales accessibles via QR code",
      locked: !isSubscription,
    },
    {
      key: "ressources",
      to: "/sante/ressources",
      icon: Sparkles,
      emoji: "🌸",
      title: "Mes Ressources",
      desc: "Numéros et liens utiles en France",
      locked: false,
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
              onClick={() => {
                if (item.locked) navigate("/paywall?upgrade=subscription");
                else navigate(item.to);
              }}
              className="flex w-full items-center gap-4 rounded-2xl bg-card p-4 text-left shadow-sm transition-all hover:shadow-md active:scale-[0.98]"
            >
              <span className="text-3xl">{item.emoji}</span>
              <div className="flex-1">
                <p className="text-sm font-semibold">{item.title}</p>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
              {item.locked ? (
                <Lock className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              )}
            </button>
          ))}
        </div>

        {!isSubscription && (
          <div className="mt-6 rounded-2xl border border-primary/20 bg-primary/5 p-4">
            <p className="text-xs font-semibold text-primary">💡 Débloque tout ton suivi santé</p>
            <p className="mt-1 text-xs text-muted-foreground">
              L'abonnement te donne accès à l'agenda médical, au suivi des traitements et à ta fiche d'urgence.
            </p>
            <button
              onClick={() => navigate("/paywall?upgrade=subscription")}
              className="mt-3 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground"
            >
              Découvrir l'abonnement
            </button>
          </div>
        )}
      </SectionBlock>
    </div>
  );
};

export default Sante;
