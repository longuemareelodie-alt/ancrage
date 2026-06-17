import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Sparkles, Loader2, Flower2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

type Portrait = {
  id: string;
  year: number;
  month: number;
  overcome: string;
  developing: string;
  new_strengths: string;
  becoming: string;
  entry_count: number;
  generation_mode: "manual" | "auto";
  created_at: string;
  updated_at: string;
};

const MONTHS = [
  "janvier", "février", "mars", "avril", "mai", "juin",
  "juillet", "août", "septembre", "octobre", "novembre", "décembre",
];

const formatMonth = (p: Portrait) => `${MONTHS[p.month - 1]} ${p.year}`;

const SectionCard = ({
  title,
  text,
  delay = 0,
}: { title: string; text: string; delay?: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="rounded-2xl bg-card p-5 shadow-soft border border-primary/10"
  >
    <h3 className="font-serif text-lg font-semibold text-primary mb-2">{title}</h3>
    <p className="text-sm leading-relaxed text-foreground/85 whitespace-pre-line">{text}</p>
  </motion.div>
);

const PortraitView = ({ p }: { p: Portrait }) => (
  <div className="space-y-3">
    <p className="text-center text-xs text-muted-foreground">
      Portrait de {formatMonth(p)} · {p.entry_count} entrée{p.entry_count > 1 ? "s" : ""} de journal
      {p.generation_mode === "auto" ? " · généré automatiquement" : ""}
    </p>
    <SectionCard title="🌱 Ce que tu as surmonté ce mois-ci" text={p.overcome} delay={0.05} />
    <SectionCard title="🌿 Ce que tu es en train de développer" text={p.developing} delay={0.1} />
    <SectionCard title="✨ Tes nouvelles forces" text={p.new_strengths} delay={0.15} />
    <SectionCard title="🌸 La femme que tu es en train de devenir" text={p.becoming} delay={0.2} />
  </div>
);

const PortraitTransformation = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [portraits, setPortraits] = useState<Portrait[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const load = async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from("transformation_portraits")
      .select("*")
      .eq("user_id", user.id)
      .order("year", { ascending: false })
      .order("month", { ascending: false });
    const list = (data ?? []) as Portrait[];
    setPortraits(list);
    if (list.length > 0 && !selectedId) setSelectedId(list[0].id);
    setLoading(false);
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [user]);

  const generate = async () => {
    if (!user || generating) return;
    setGenerating(true);
    const now = new Date();
    const { data, error } = await supabase.functions.invoke("generate-transformation-portrait", {
      body: { year: now.getFullYear(), month: now.getMonth() + 1, mode: "manual" },
    });
    setGenerating(false);
    if (error || (data as any)?.error) {
      const msg = (data as any)?.message || error?.message || "Impossible de générer le portrait.";
      toast({ title: "Oups", description: msg, variant: "destructive" });
      return;
    }
    toast({ title: "Portrait créé 🌸", description: "Ton portrait du mois est prêt." });
    const portrait = (data as any).portrait as Portrait;
    setSelectedId(portrait.id);
    await load();
  };

  const selected = portraits.find((p) => p.id === selectedId) ?? portraits[0];

  return (
    <div className="min-h-screen bg-background pb-16">
      <div className="mx-auto max-w-2xl px-5 py-6">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Tableau de bord
        </Link>

        <div className="mt-5 text-center space-y-2">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Flower2 className="h-6 w-6 text-primary" />
          </div>
          <h1 className="font-serif text-3xl font-semibold tracking-tight">
            Mon Portrait de Transformation 🌸
          </h1>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Chaque mois, ton journal devient un miroir doux de ton parcours. Voici ce que tu traverses,
            développes et deviens.
          </p>
        </div>

        <div className="mt-6 flex justify-center">
          <Button onClick={generate} disabled={generating} size="lg" className="rounded-full">
            {generating ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Génération…</>
            ) : (
              <><Sparkles className="mr-2 h-4 w-4" /> Générer mon portrait</>
            )}
          </Button>
        </div>

        {portraits.length > 1 && (
          <div className="mt-6 flex gap-2 overflow-x-auto pb-1">
            {portraits.map((p) => {
              const active = p.id === selectedId;
              return (
                <button
                  key={p.id}
                  onClick={() => setSelectedId(p.id)}
                  className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-medium transition-colors ${
                    active
                      ? "bg-primary text-primary-foreground"
                      : "bg-card text-muted-foreground hover:bg-secondary"
                  }`}
                >
                  {formatMonth(p)}
                </button>
              );
            })}
          </div>
        )}

        <div className="mt-6">
          {loading ? (
            <p className="text-center text-sm text-muted-foreground">Chargement…</p>
          ) : selected ? (
            <PortraitView p={selected} />
          ) : (
            <div className="rounded-2xl bg-card p-8 text-center shadow-soft space-y-3">
              <p className="text-sm text-muted-foreground">
                Tu n'as pas encore de portrait. Écris quelques pages dans ton journal,
                puis clique sur « Générer mon portrait ».
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PortraitTransformation;
