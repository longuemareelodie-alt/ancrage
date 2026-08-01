import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import HubShell from "@/components/hub/HubShell";
import { SUPPORT_ORDER, SUPPORT_TEMPLATES, SUPPORT_TYPES } from "@/data/supportTemplates";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { toast } from "@/hooks/use-toast";

/** Bibliothèque de modèles, classés par catégorie : un clic crée une copie modifiable. */
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
    <HubShell title="Modèles" subtitle="Choisis une catégorie, puis adapte à ton enfant.">
      <button
        onClick={() => navigate("/autonomie/studio")}
        className="mb-2 flex items-center gap-1.5 text-xs font-medium text-muted-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" strokeWidth={2} /> Studio
      </button>

      {SUPPORT_ORDER.map((type) => {
        const def = SUPPORT_TYPES[type];
        const list = SUPPORT_TEMPLATES.filter((t) => t.type === type);
        if (!list.length) return null;
        return (
          <div key={type} className="pt-4">
            <p className="flex items-center gap-2 pb-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              <def.icon className="h-3.5 w-3.5" strokeWidth={2} />
              {def.label}
            </p>
            <div className="space-y-2">
              {list.map((tpl) => (
                <button
                  key={tpl.slug}
                  onClick={() => use(tpl.slug)}
                  className="flex w-full items-center gap-4 rounded-[20px] border border-border/70 bg-card px-5 py-4 text-left transition-all hover:border-primary/40 active:scale-[0.99]"
                >
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold text-foreground">{tpl.title}</span>
                    <span className="mt-0.5 block text-xs text-muted-foreground">
                      {tpl.description} · {tpl.items.length} éléments
                    </span>
                  </span>
                  <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" strokeWidth={1.75} />
                </button>
              ))}
            </div>
          </div>
        );
      })}
    </HubShell>
  );
};

export default Bibliotheque;
