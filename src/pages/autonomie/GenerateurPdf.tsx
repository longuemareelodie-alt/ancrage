import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import HubShell from "@/components/hub/HubShell";
import { SUPPORT_TYPES, SupportItem, SupportType } from "@/data/supportTemplates";
import { exportMergedSupportsPdf, PdfFormat, SupportSheet } from "@/lib/exportSupportPdf";
import { cacheSupports, isOffline, readCachedSupports, CachedSupport } from "@/lib/supportsCache";
import { describePersonalisation, softHaptic } from "@/lib/supportPersonalisation";
import { ArrowLeft, Check, FileText, Printer, Search, WifiOff } from "lucide-react";
import { toast } from "@/hooks/use-toast";

type Row = CachedSupport & { personalisation?: Record<string, string> | null };
type Profile = { id: string; first_name: string };

const norm = (s: string) =>
  s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

/**
 * Générateur PDF : réunir plusieurs supports dans un seul document à imprimer.
 * Utile avant une rentrée, un séjour chez les grands-parents, un rendez-vous.
 */
const GenerateurPdf = () => {
  const navigate = useNavigate();
  const [rows, setRows] = useState<Row[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [query, setQuery] = useState("");
  const [format, setFormat] = useState<PdfFormat>("a4");
  const [docTitle, setDocTitle] = useState("Mes supports");
  const [offline, setOffline] = useState(isOffline());

  useEffect(() => {
    (async () => {
      const cached = readCachedSupports();
      if (cached.length) setRows(cached as Row[]);
      const [{ data: s }, { data: p }] = await Promise.all([
        supabase
          .from("autonomy_supports")
          .select(
            "id, title, support_type, profile_id, is_favorite, archived, updated_at, use_count, content, personalisation",
          )
          .eq("archived", false)
          .order("updated_at", { ascending: false }),
        supabase.from("family_medical_profiles").select("id, first_name").order("created_at"),
      ]);
      if (s?.length) {
        setRows(s as unknown as Row[]);
        cacheSupports(s as unknown as CachedSupport[]);
      }
      setProfiles(p ?? []);
      setOffline(isOffline());
    })();
  }, []);

  const filtered = useMemo(() => {
    const q = norm(query.trim());
    return rows.filter((r) => !r.archived && (!q || norm(r.title).includes(q)));
  }, [rows, query]);

  const toggle = (id: string) => {
    softHaptic();
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const nameFor = (id: string | null) => profiles.find((p) => p.id === id)?.first_name;

  const generate = () => {
    const sheets: SupportSheet[] = selected
      .map((id) => rows.find((r) => r.id === id))
      .filter((r): r is Row => Boolean(r))
      .map((r) => ({
        title: r.title,
        type: r.support_type as SupportType,
        childName: nameFor(r.profile_id),
        subtitle: describePersonalisation(r.personalisation as never),
        items: (r.content?.items ?? []).filter((i: SupportItem) => i.label?.trim()),
      }))
      .filter((s) => s.items.length > 0);

    if (!sheets.length) {
      toast({ description: "Choisis au moins un support qui contient des lignes." });
      return;
    }
    exportMergedSupportsPdf(sheets, { format, docTitle });
    softHaptic([10, 40, 10]);
    toast({ description: "Ton document est prêt 🌸" });
  };

  return (
    <HubShell
      title="Générateur PDF"
      subtitle="Réunis plusieurs supports dans un seul document à imprimer."
    >
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
            Tu es hors ligne. Tes supports déjà créés restent disponibles.
          </p>
        </div>
      )}

      <div className="space-y-3 rounded-[20px] border border-border/70 bg-card px-5 py-4">
        <div>
          <p className="pb-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            Titre du document
          </p>
          <input
            value={docTitle}
            onChange={(e) => setDocTitle(e.target.value)}
            className="w-full border-b border-border/60 bg-transparent pb-1.5 font-serif text-base text-foreground outline-none"
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-medium text-muted-foreground">Format</span>
          {(["a4", "a5"] as PdfFormat[]).map((f) => (
            <button
              key={f}
              onClick={() => setFormat(f)}
              className={`rounded-full border px-3 py-1.5 text-[11px] font-medium ${
                format === f
                  ? "border-primary/40 bg-primary/10 text-foreground"
                  : "border-border/70 bg-card text-muted-foreground"
              }`}
            >
              {f.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-3 rounded-[20px] border border-border/70 bg-card px-5 py-3.5">
        <Search className="h-4 w-4 shrink-0 text-muted-foreground" strokeWidth={1.75} />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Chercher un support"
          className="min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
        />
      </div>

      {filtered.length === 0 ? (
        <p className="pt-4 text-sm leading-relaxed text-muted-foreground">
          Rien à réunir pour l'instant. Crée un premier support, ça ira vite.
        </p>
      ) : (
        <div className="space-y-2 pt-1">
          {filtered.map((r, i) => {
            const on = selected.includes(r.id);
            const def = SUPPORT_TYPES[r.support_type as SupportType];
            return (
              <motion.button
                key={r.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: Math.min(i, 8) * 0.03 }}
                onClick={() => toggle(r.id)}
                className={`flex w-full items-center gap-4 rounded-[20px] border px-5 py-4 text-left transition-all active:scale-[0.99] ${
                  on ? "border-primary/40 bg-primary/5" : "border-border/70 bg-card"
                }`}
              >
                <span
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border ${
                    on ? "border-primary bg-primary text-primary-foreground" : "border-border"
                  }`}
                >
                  {on && <Check className="h-3.5 w-3.5" strokeWidth={2.5} />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-foreground">
                    {r.title}
                  </span>
                  <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                    {def?.label ?? r.support_type}
                    {nameFor(r.profile_id) ? " · " + nameFor(r.profile_id) : ""}
                  </span>
                </span>
                <FileText className="h-4 w-4 shrink-0 text-muted-foreground" strokeWidth={1.75} />
              </motion.button>
            );
          })}
        </div>
      )}

      {selected.length > 0 && (
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={generate}
          className="sticky bottom-24 mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-5 py-4 text-sm font-semibold text-primary-foreground shadow-lg transition-transform active:scale-[0.98]"
        >
          <Printer className="h-4 w-4" strokeWidth={1.75} /> Créer le PDF ({selected.length})
        </motion.button>
      )}
    </HubShell>
  );
};

export default GenerateurPdf;
