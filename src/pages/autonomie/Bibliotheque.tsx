import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import HubShell from "@/components/hub/HubShell";
import {
  CATEGORY_LABELS,
  SUPPORT_ORDER,
  SUPPORT_TEMPLATES,
  SUPPORT_TYPES,
  SupportType,
  TemplateCategory,
} from "@/data/supportTemplates";
import { ArrowLeft, ChevronRight, Search } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const norm = (s: string) =>
  s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

/** Bibliothèque de modèles : recherche libre, filtre par type, classement par catégorie. */
const Bibliotheque = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [type, setType] = useState<SupportType | "tous">("tous");

  const results = useMemo(() => {
    const q = norm(query.trim());
    return SUPPORT_TEMPLATES.filter((t) => {
      if (type !== "tous" && t.type !== type) return false;
      if (!q) return true;
      return (
        norm(t.title).includes(q) ||
        norm(t.description).includes(q) ||
        norm(CATEGORY_LABELS[t.category]).includes(q) ||
        t.items.some((i) => norm(i.label).includes(q))
      );
    });
  }, [query, type]);

  const grouped = useMemo(() => {
    const map = new Map<TemplateCategory, typeof SUPPORT_TEMPLATES>();
    results.forEach((t) => {
      map.set(t.category, [...(map.get(t.category) ?? []), t]);
    });
    return Array.from(map.entries());
  }, [results]);

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
    <HubShell title="Modèles" subtitle="Choisis, puis adapte à ton enfant. Tout est modifiable.">
      <button
        onClick={() => navigate("/autonomie/studio")}
        className="mb-2 flex items-center gap-1.5 text-xs font-medium text-muted-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" strokeWidth={2} /> Studio
      </button>

      <div className="flex items-center gap-3 rounded-[20px] border border-border/70 bg-card px-5 py-3.5">
        <Search className="h-4 w-4 shrink-0 text-muted-foreground" strokeWidth={1.75} />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Chercher : coucher, bruit, dents…"
          className="min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
        />
      </div>

      <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 pt-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {(["tous", ...SUPPORT_ORDER] as const).map((t) => (
          <button
            key={t}
            onClick={() => setType(t)}
            className={`shrink-0 rounded-full border px-4 py-2 text-xs font-medium transition-colors ${
              type === t
                ? "border-primary/40 bg-primary/10 text-foreground"
                : "border-border/70 bg-card text-muted-foreground"
            }`}
          >
            {t === "tous" ? "Tous" : SUPPORT_TYPES[t].label}
          </button>
        ))}
      </div>

      {grouped.length === 0 && (
        <p className="pt-6 text-sm leading-relaxed text-muted-foreground">
          Rien avec ces mots. Essaie un mot plus simple, ou demande à l'assistant de créer le
          support pour toi.
        </p>
      )}

      {grouped.map(([category, list]) => (
        <div key={category} className="pt-4">
          <p className="pb-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            {CATEGORY_LABELS[category]}
          </p>
          <div className="space-y-2">
            {list.map((tpl) => {
              const def = SUPPORT_TYPES[tpl.type];
              return (
                <button
                  key={tpl.slug}
                  onClick={() => use(tpl.slug)}
                  className="flex w-full items-center gap-4 rounded-[20px] border border-border/70 bg-card px-5 py-4 text-left transition-all hover:border-primary/40 active:scale-[0.99]"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-secondary/60">
                    <def.icon className="h-4 w-4 text-foreground" strokeWidth={1.75} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold text-foreground">{tpl.title}</span>
                    <span className="mt-0.5 block text-xs text-muted-foreground">
                      {def.label} · {tpl.description}
                      {tpl.ages ? " · " + tpl.ages : ""}
                    </span>
                  </span>
                  <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" strokeWidth={1.75} />
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </HubShell>
  );
};

export default Bibliotheque;
