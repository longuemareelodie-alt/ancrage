import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import HubShell from "@/components/hub/HubShell";
import { SUPPORT_TEMPLATES, SUPPORT_TYPES } from "@/data/supportTemplates";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { toast } from "@/hooks/use-toast";

/** Bibliothèque de modèles : un clic crée une copie modifiable. */
const Bibliotheque = () => {
  const navigate = useNavigate();

  const use = async (slug: string) => {
    const tpl = SUPPORT_TEMPLATES.find((t) => t.slug === slug)!;
    const { data: auth } = await supabase.auth.getUser();
    const uid = auth.user?.id;
    if (!uid) return;
    const { data, error } = await supabase
      .from("autonomy_supports")
      .insert({
        user_id: uid,
        support_type: tpl.type,
        title: tpl.title,
        description: tpl.description,
        content: { items: tpl.items },
      })
      .select("id")
      .single();
    if (error || !data) {
      toast({ description: "Impossible d'utiliser ce modèle.", variant: "destructive" });
      return;
    }
    navigate("/autonomie/support/" + data.id);
  };

  return (
    <HubShell title="Modèles" subtitle="Choisis, puis adapte à ton enfant.">
      <button
        onClick={() => navigate("/autonomie/studio")}
        className="mb-2 flex items-center gap-1.5 text-xs font-medium text-muted-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" strokeWidth={2} /> Studio
      </button>

      {SUPPORT_TEMPLATES.map((tpl) => {
        const def = SUPPORT_TYPES[tpl.type];
        return (
          <button
            key={tpl.slug}
            onClick={() => use(tpl.slug)}
            className="flex w-full items-center gap-4 rounded-[20px] border border-border/70 bg-card px-5 py-4 text-left transition-all hover:border-primary/40 active:scale-[0.99]"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-secondary/60">
              <def.icon className="h-[18px] w-[18px]" strokeWidth={1.75} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-semibold text-foreground">{tpl.title}</span>
              <span className="mt-0.5 block text-xs text-muted-foreground">
                {def.label} · {tpl.items.length} éléments
              </span>
            </span>
            <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" strokeWidth={1.75} />
          </button>
        );
      })}
    </HubShell>
  );
};

export default Bibliotheque;
