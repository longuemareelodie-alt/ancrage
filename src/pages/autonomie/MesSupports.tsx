import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import HubShell from "@/components/hub/HubShell";
import { SUPPORT_ORDER, SUPPORT_TYPES, SupportType } from "@/data/supportTemplates";
import { cacheSupports, isOffline, readCachedSupports, CachedSupport } from "@/lib/supportsCache";
import { ArrowLeft, ChevronRight, Search, Star, Archive, WifiOff, FileText } from "lucide-react";

type Support = CachedSupport;
type Profile = { id: string; first_name: string };

type Tab = "recents" | "favoris" | "brouillons" | "utilises";

const TABS: { key: Tab; label: string }[] = [
  { key: "recents", label: "Derniers" },
  { key: "favoris", label: "Favoris" },
  { key: "brouillons", label: "Brouillons" },
  { key: "utilises", label: "Les plus utilisés" },
];

const norm = (s: string) =>
  s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

const isDraft = (s: Support) =>
  (s.content?.items ?? []).filter((i) => i.label?.trim()).length === 0;

/** Mes créations : derniers, favoris, brouillons, plus utilisés, par enfant, recherche instantanée. */
const MesSupports = () => {
  const navigate = useNavigate();
  const [supports, setSupports] = useState<Support[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<Tab>("recents");
  const [type, setType] = useState<SupportType | "tous">("tous");
  const [childId, setChildId] = useState("tous");
  const [showArchived, setShowArchived] = useState(false);
  const [offline, setOffline] = useState(isOffline());

  useEffect(() => {
    const cached = readCachedSupports();
    if (cached.length) setSupports(cached);
    (async () => {
      const [{ data: s }, { data: p }] = await Promise.all([
        supabase
          .from("autonomy_supports")
          .select(
            "id, title, support_type, profile_id, is_favorite, archived, updated_at, use_count, content",
          )
          .order("updated_at", { ascending: false }),
        supabase.from("family_medical_profiles").select("id, first_name").order("created_at"),
      ]);
      if (s) {
        setSupports(s as unknown as Support[]);
        cacheSupports(s as unknown as Support[]);
      }
      setProfiles(p ?? []);
      setOffline(isOffline());
    })();
  }, []);

  const filtered = useMemo(() => {
    const q = norm(query.trim());
    const list = supports.filter((s) => {
      if (Boolean(s.archived) !== showArchived) return false;
      if (type !== "tous" && s.support_type !== type) return false;
      if (childId !== "tous" && s.profile_id !== childId) return false;
      if (q && !norm(s.title).includes(q)) return false;
      if (tab === "favoris" && !s.is_favorite) return false;
      if (tab === "brouillons" && !isDraft(s)) return false;
      if (tab === "utilises" && !(s.use_count ?? 0)) return false;
      return true;
    });
    if (tab === "utilises") {
      return [...list].sort((a, b) => (b.use_count ?? 0) - (a.use_count ?? 0));
    }
    return list;
  }, [supports, query, tab, type, childId, showArchived]);

  const nameFor = (id: string | null) => profiles.find((p) => p.id === id)?.first_name;

  const emptyLabel =
    showArchived
      ? "Aucun support rangé ici."
      : tab === "brouillons"
        ? "Aucun brouillon en attente. Tu es à jour."
        : tab === "utilises"
          ? "Les supports que tu imprimes apparaîtront ici."
          : tab === "favoris"
            ? "Épingle un support pour le retrouver tout de suite."
            : "Rien pour l'instant. Tu peux partir d'un modèle, c'est plus rapide.";

  return (
    <HubShell title="Mes créations" subtitle="Tout ce que tu as créé, à portée de main.">
      <button
        onClick={() => navigate("/autonomie/studio")}
        className="mb-2 flex items-center gap-1.5 text-xs font-medium text-muted-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" strokeWidth={2} /> Studio
      </button>

      {offline && (
        <div className="flex items-center gap-3 rounded-[20px] border border-border/70 bg-card px-5 py-3.5">
          <WifiOff className="h-4 w-4 shrink-0 text-muted-foreground" strokeWidth={1.75} />
          <p className="text-xs leading-relaxed text-muted-foreground">
            Hors ligne. Voici tes supports enregistrés sur cet appareil.
          </p>
        </div>
      )}

      <div className="flex items-center gap-3 rounded-[20px] border border-border/70 bg-card px-5 py-3.5">
        <Search className="h-4 w-4 shrink-0 text-muted-foreground" strokeWidth={1.75} />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Chercher : école, repas, colère…"
          className="min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
        />
      </div>

      <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 pt-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`shrink-0 rounded-full border px-4 py-2 text-xs font-medium ${
              tab === t.key
                ? "border-primary/40 bg-primary/10 text-foreground"
                : "border-border/70 bg-card text-muted-foreground"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
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
            {t === "tous" ? "Tous les types" : SUPPORT_TYPES[t].label}
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
        <p className="pt-6 text-sm leading-relaxed text-muted-foreground">{emptyLabel}</p>
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
                <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                  {SUPPORT_TYPES[s.support_type as keyof typeof SUPPORT_TYPES]?.label ??
                    s.support_type}
                  {nameFor(s.profile_id) ? " · " + nameFor(s.profile_id) : ""}
                  {isDraft(s) ? " · brouillon" : ""}
                  {(s.use_count ?? 0) > 0 ? ` · imprimé ${s.use_count}×` : ""}
                </span>
              </span>
              <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" strokeWidth={1.75} />
            </Link>
          ))}
        </div>
      )}

      <Link
        to="/autonomie/pdf"
        className="mt-6 flex items-center justify-center gap-2 rounded-[20px] border border-border/70 bg-card py-3.5 text-xs font-semibold text-foreground"
      >
        <FileText className="h-3.5 w-3.5" strokeWidth={1.75} /> Réunir plusieurs supports en un PDF
      </Link>

      <button
        onClick={() => setShowArchived((v) => !v)}
        className="mt-3 flex w-full items-center justify-center gap-2 text-xs font-medium text-muted-foreground"
      >
        <Archive className="h-3.5 w-3.5" strokeWidth={1.75} />
        {showArchived ? "Revenir à mes créations" : "Voir les supports rangés"}
      </button>
    </HubShell>
  );
};

export default MesSupports;
