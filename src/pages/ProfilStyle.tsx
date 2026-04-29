import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Wind, Hand, Sparkles } from "lucide-react";
import SectionBlock from "@/components/SectionBlock";
import {
  ActionStyle,
  ACTION_STYLE_LABELS,
  getActionStyle,
  setActionStyle,
} from "@/lib/actionStyle";
import { resolveAutoStyleFromToday, type ResolvedStyle } from "@/lib/autoStyle";
import { toast } from "@/hooks/use-toast";

const OPTIONS: {
  value: ActionStyle;
  title: string;
  description: string;
  Icon: typeof Wind;
}[] = [
  {
    value: "breathing",
    title: "Respiration",
    description:
      "Tes exercices privilégient la respiration : inspirations longues, expirations allongées pour calmer ton système nerveux.",
    Icon: Wind,
  },
  {
    value: "sensory",
    title: "Ancrage sensoriel",
    description:
      "Tes exercices privilégient les sensations : toucher, voir, écouter pour revenir dans ton corps et l'instant présent.",
    Icon: Hand,
  },
  {
    value: "any",
    title: "Au choix (auto)",
    description:
      "L'app alterne automatiquement entre respiration et sensoriel selon ton humeur du jour.",
    Icon: Sparkles,
  },
];

const RESOLVED_LABEL: Record<ResolvedStyle, string> = {
  breathing: "Respiration",
  sensory: "Sensoriel",
};

const ProfilStyle = () => {
  const [style, setStyle] = useState<ActionStyle>(() => getActionStyle());
  const [autoResolved, setAutoResolved] = useState<ResolvedStyle | null>(null);

  useEffect(() => {
    if (style !== "any") {
      setAutoResolved(null);
      return;
    }
    let cancelled = false;
    resolveAutoStyleFromToday().then((r) => {
      if (!cancelled) setAutoResolved(r);
    });
    return () => {
      cancelled = true;
    };
  }, [style]);

  const handleSelect = (value: ActionStyle) => {
    setStyle(value);
    setActionStyle(value);
    toast({
      title: "Style mis à jour",
      description: `Préférence : ${ACTION_STYLE_LABELS[value]}`,
    });
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <SectionBlock variant="blue">
        <Link
          to="/profil"
          className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour au profil
        </Link>
        <h1 className="text-2xl font-bold">Mon style préféré</h1>
        <p className="mt-2 text-muted-foreground">
          Choisis le type d'exercice qui te correspond. Il s'appliquera
          automatiquement à toutes tes pages émotion et tes actions rapides.
        </p>
      </SectionBlock>

      <SectionBlock>
        <div className="space-y-3">
          {OPTIONS.map(({ value, title, description, Icon }) => {
            const active = style === value;
            return (
              <button
                key={value}
                type="button"
                onClick={() => handleSelect(value)}
                aria-pressed={active}
                className={`flex w-full items-start gap-4 rounded-2xl border p-4 text-left transition-colors ${
                  active
                    ? "border-primary bg-primary/5 shadow-sm"
                    : "border-border bg-card hover:bg-muted/50"
                }`}
              >
                <span
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                    active
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                </span>
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <h2 className="font-semibold">{title}</h2>
                    {active && (
                      <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-primary-foreground">
                        Actuel
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {description}
                  </p>
                  {value === "any" && active && autoResolved && (
                    <p className="mt-2 text-xs text-muted-foreground">
                      Aujourd'hui :{" "}
                      <span className="font-semibold text-foreground">
                        {RESOLVED_LABEL[autoResolved]}
                      </span>
                    </p>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </SectionBlock>
    </div>
  );
};

export default ProfilStyle;
