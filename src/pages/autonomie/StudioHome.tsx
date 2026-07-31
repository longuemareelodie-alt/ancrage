import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import HubShell from "@/components/hub/HubShell";
import { SUPPORT_ORDER, SUPPORT_TYPES } from "@/data/supportTemplates";
import { Sparkles, ChevronRight, Library, Printer } from "lucide-react";
import { toast } from "@/hooks/use-toast";

type Support = { id: string; title: string; support_type: string; profile_id: string | null };
type Profile = { id: string; first_name: string };

/**
 * Le Studio est le cœur d'Autonomie : on crée, on imprime, on recommence.
 * Le sélecteur d'enfant est en haut car un support n'existe jamais « en général ».
 */
const StudioHome = () => {
  const navigate = useNavigate();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [childId, setChildId] = useState<string>("");
  const [supports, setSupports] = useState<Support[]>([]);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    (async () => {
      const [{ data: p }, { data: s }] = await Promise.all([
        supabase.from("family_medical_profiles").select("id, first_name").order("created_at"),
        supabase
          .from("autonomy_supports")
          .select("id, title, support_type, profile_id")
          .order("updated_at", { ascending: false }),
      ]);
      setProfiles(p ?? []);
      setSupports(s ?? []);
      if (p?.length) setChildId(p[0].id);
    })();
  }, []);

  const create = async (type: string) => {
    if (creating) return;
    setCreating(true);
    const { data: auth } = await supabase.auth.getUser();
    const uid = auth.user?.id;
    if (!uid) return;
    const def = SUPPORT_TYPES[type as keyof typeof SUPPORT_TYPES];
    const { data, error } = await supabase
      .from("autonomy_supports")
      .insert({
        user_id: uid,
        profile_id: childId || null,
        support_type: type,
        title: def.label,
        content: { items: [{ label: "" }] },
      })
      .select("id")
      .single();
    setCreating(false);
    if (error || !data) {
      toast({ description: "Impossible de créer ce support.", variant: "destructive" });
      return;
    }
    navigate("/autonomie/support/" + data.id);
  };

  const nameFor = (id: string | null) => profiles.find((p) => p.id === id)?.first_name;

  return (
    <HubShell title="Studio" subtitle="Crée un support, imprime-le, colle-le sur le frigo.">
      {profiles.length > 0 && (
        <div className="flex items-center gap-3 rounded-[20px] border border-border/70 bg-card px-5 py-3">
          <span className="text-xs font-medium text-muted-foreground">Pour</span>
          <select
            value={childId}
            onChange={(e) => setChildId(e.target.value)}
            className="flex-1 bg-transparent text-sm font-semibold text-foreground outline-none"
          >
            {profiles.map((p) => (
              <option key={p.id} value={p.id}>
                {p.first_name}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 pt-2 sm:grid-cols-3">
        {SUPPORT_ORDER.map((type) => {
          const def = SUPPORT_TYPES[type];
          return (
            <button
              key={type}
              onClick={() => create(type)}
              className="flex flex-col items-start gap-2 rounded-[20px] border border-border/70 bg-card px-4 py-5 text-left transition-all hover:border-primary/40 active:scale-[0.98]"
            >
              <def.icon className="h-5 w-5 text-foreground" strokeWidth={1.75} />
              <span className="text-sm font-semibold text-foreground">{def.label}</span>
              <span className="text-[11px] leading-snug text-muted-foreground">{def.desc}</span>
            </button>
          );
        })}
      </div>

      <Link
        to="/autonomie/bibliotheque"
        className="mt-2 flex items-center gap-4 rounded-[20px] border border-border/70 bg-card px-5 py-4"
      >
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-secondary/60">
          <Library className="h-[18px] w-[18px]" strokeWidth={1.75} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-semibold text-foreground">Modèles prêts à l'emploi</span>
          <span className="mt-0.5 block text-xs text-muted-foreground">
            Ne pars jamais d'une page blanche.
          </span>
        </span>
        <ChevronRight className="h-4 w-4 text-muted-foreground" strokeWidth={1.75} />
      </Link>

      <div className="flex items-center gap-4 rounded-[20px] border border-dashed border-border bg-card/50 px-5 py-4">
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-secondary/40">
          <Sparkles className="h-[18px] w-[18px] text-muted-foreground" strokeWidth={1.75} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-semibold text-foreground">Créer avec l'assistant</span>
          <span className="mt-0.5 block text-xs text-muted-foreground">
            Bientôt : décris la situation, le support se rédige.
          </span>
        </span>
      </div>

      {supports.length > 0 && (
        <>
          <p className="pb-1 pt-6 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            Mes supports
          </p>
          {supports.map((s) => (
            <Link
              key={s.id}
              to={"/autonomie/support/" + s.id}
              className="flex items-center gap-4 rounded-[20px] border border-border/70 bg-card px-5 py-4"
            >
              <Printer className="h-4 w-4 shrink-0 text-muted-foreground" strokeWidth={1.75} />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold text-foreground">{s.title}</span>
                <span className="mt-0.5 block text-xs text-muted-foreground">
                  {SUPPORT_TYPES[s.support_type as keyof typeof SUPPORT_TYPES]?.label ?? s.support_type}
                  {nameFor(s.profile_id) ? " · " + nameFor(s.profile_id) : ""}
                </span>
              </span>
              <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" strokeWidth={1.75} />
            </Link>
          ))}
        </>
      )}
    </HubShell>
  );
};

export default StudioHome;
