import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import HubShell from "@/components/hub/HubShell";
import { SUPPORT_ORDER, SUPPORT_TYPES, SupportType } from "@/data/supportTemplates";
import { ArrowLeft, ChevronRight, Search, Star, Archive } from "lucide-react";

type Support = {
  id: string;
  title: string;
  support_type: string;
  profile_id: string | null;
  is_favorite: boolean;
  archived: boolean;
  updated_at: string;
};
type Profile = { id: string; first_name: string };

const norm = (s: string) =>
  s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

/** Tous les supports créés : recherche, filtre par type, par enfant, favoris et archives. */
const MesSupports = () => {
  const navigate = useNavigate();
  const [supports, setSupports] = useState<Support[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [query, setQuery] = useState("");
  const [type, setType] = useState<SupportType | "tous">("tous");
  const [childId, setChildId] = useState("tous");
  const [favOnly, setFavOnly] = useState(false);
  const [showArchived, setShowArchived] = useState(false);

  useEffect(() => {
    (async () => {
      const [{ data: s }, { data: p }] = await Promise.all([
        supabase
          .from("autonomy_supports")
          .select("id, title, support_type, profile_id, is_favorite, archived, updated_at")
          .order("updated_at", { ascending: false }),
        supabase.from("family_medical_profiles").select("id, first_name").order("created_at"),
      ]);
      setSupports(s ?? []);
      setProfiles(p ?? []);
    })();
  }, []);

  const filtered = useMemo(() => {
    const q = norm(query.trim());
    return supports.filter((s) => {
      if (s.archived !== showArchived) return false;
      if (favOnly && !s.is_favorite) return false;
      if (type !== "tous" && s.support_type !== type) return false;
      if (childId !== "tous" && s.profile_id !== childId) return false;
      if (q && !norm(s.title).includes(q)) return false;
      return true;
    });
  }, [supports, query, type, childId, favOnly, showArchived]);

  const nameFor = (id: string | null) => profiles.find((p) => p.id === id)?.first_name;

  return (
    <HubShell title="Mes supports" subtitle="Tout ce que tu as créé, à portée de main.">
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
          placeholder="Chercher un support"
          className="min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
        />
      </div>

      <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 pt-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <button
          onClick={() => setFavOnly((v) => !v)}
          className={`flex shrink-0 items-center gap-1.5 rounded-full border px-4 py-2 text-xs font-medium ${
            favOnly
              ? "border-primary/40 bg-primary/10 text-foreground"
              : "border-border/70 bg-card text-muted-foreground"
          }`}
        >
          <Star className={`h-3.5 w-3.5 ${favOnly ? "fill-primary text-primary" : ""}`} strokeWidth={1.75} />
          Favoris
        </button>
        {(["tous", ...SUPPORT_ORDER] as const).map((t) => (
          <button
            key={t}
            onClick={() => setType(t)}
            className={`shrink-0 rounded-full border px-4 py-2 text-xs font-medium ${
              type === t
                ? "border-primary/40 bg-primary/10 text-foreground"
                : "border-border/70 bg-card text-muted-foreground"
            }`}
          >
            {t === "tous" ? "Tous" : SUPPORT_TYPES[t].label}
          </button>
        ))}
      </div>

      {profiles.length > 0 && (
        <div className="flex items-center gap-3 rounded-[20px] border border-border/70 bg-card px-5 py-3">
          <span className="text-xs font-medium text-muted-foreground">Enfant</span>
          <select
            value={childId}
            onChange={(e) => setChildId(e.target.value)}
            className="flex-1 bg-transparent text-sm font-semibold text-foreground outline-none"
          >
            <option value="tous">Tous</option>
            {profiles.map((p) => (
              <option key={p.id} value={p.id}>
                {p.first_name}
              </option>
            ))}
          </select>
        </div>
      )}

      {filtered.length === 0 ? (
        <p className="pt-6 text-sm leading-relaxed text-muted-foreground">
          {showArchived
            ? "Aucun support rangé ici."
            : "Rien pour l'instant. Tu peux partir d'un modèle, c'est plus rapide."}
        </p>
      ) : (
        <div className="space-y-2 pt-2">
          {filtered.map((s) => (
            <Link
              key={s.id}
              to={"/autonomie/support/" + s.id}
              className="flex items-center gap-4 rounded-[20px] border border-border/70 bg-card px-5 py-4"
            >
              {s.is_favorite ? (
                <Star className="h-4 w-4 shrink-0 fill-primary text-primary" strokeWidth={1.75} />
              ) : (
                <span className="h-4 w-4 shrink-0" />
              )}
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold text-foreground">
                  {s.title}
                </span>
                <span className="mt-0.5 block text-xs text-muted-foreground">
                  {SUPPORT_TYPES[s.support_type as keyof typeof SUPPORT_TYPES]?.label ??
                    s.support_type}
                  {nameFor(s.profile_id) ? " · " + nameFor(s.profile_id) : ""}
                </span>
              </span>
              <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" strokeWidth={1.75} />
            </Link>
          ))}
        </div>
      )}

      <button
        onClick={() => setShowArchived((v) => !v)}
        className="mt-6 flex w-full items-center justify-center gap-2 text-xs font-medium text-muted-foreground"
      >
        <Archive className="h-3.5 w-3.5" strokeWidth={1.75} />
        {showArchived ? "Revenir à mes supports" : "Voir les supports rangés"}
      </button>
    </HubShell>
  );
};

export default MesSupports;
