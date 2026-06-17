import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, BookHeart, Download, Loader2, Sparkles } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  exportLivreReconstructionPdf,
  type Chapter,
  type JournalEntry,
  type Portrait,
} from "@/lib/exportLivreReconstructionPdf";

const MONTHS = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre",
];

const monthKey = (y: number, m: number) => `${y}-${String(m).padStart(2, "0")}`;

const LivreReconstruction = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [openKey, setOpenKey] = useState<string | null>(null);
  const [firstName, setFirstName] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      const [entriesRes, portraitsRes, profileRes] = await Promise.all([
        supabase
          .from("private_journal_entries")
          .select("id, prompt_key, content, created_at")
          .eq("user_id", user.id)
          .order("created_at", { ascending: true }),
        supabase
          .from("transformation_portraits")
          .select("year, month, overcome, developing, new_strengths, becoming")
          .eq("user_id", user.id),
        supabase.from("profiles").select("first_name").eq("user_id", user.id).maybeSingle(),
      ]);
      if (cancelled) return;

      const entries = (entriesRes.data ?? []) as JournalEntry[];
      const portraits = (portraitsRes.data ?? []) as Portrait[];
      setFirstName(profileRes.data?.first_name ?? undefined);

      const map = new Map<string, Chapter>();
      const ensure = (y: number, m: number) => {
        const k = monthKey(y, m);
        let ch = map.get(k);
        if (!ch) {
          ch = { year: y, month: m, entries: [], victories: [] };
          map.set(k, ch);
        }
        return ch;
      };

      for (const e of entries) {
        const d = new Date(e.created_at);
        const ch = ensure(d.getFullYear(), d.getMonth() + 1);
        if (e.prompt_key === "victoire") ch.victories.push(e);
        else ch.entries.push(e);
      }
      for (const p of portraits) {
        const ch = ensure(p.year, p.month);
        ch.portrait = p;
      }

      const sorted = Array.from(map.values()).sort(
        (a, b) => a.year - b.year || a.month - b.month,
      );
      setChapters(sorted);
      if (sorted.length > 0) setOpenKey(monthKey(sorted[0].year, sorted[0].month));
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [user]);

  const totals = useMemo(() => {
    let entries = 0, victories = 0, portraits = 0;
    for (const ch of chapters) {
      entries += ch.entries.length;
      victories += ch.victories.length;
      if (ch.portrait) portraits += 1;
    }
    return { entries, victories, portraits };
  }, [chapters]);

  const handleExport = async () => {
    if (exporting || chapters.length === 0) return;
    setExporting(true);
    try {
      exportLivreReconstructionPdf(chapters, { firstName });
      toast({ title: "Livre exporté 📖", description: "Ton PDF a été téléchargé." });
    } catch (e) {
      toast({
        title: "Oups",
        description: "Impossible de générer le PDF. Réessaye dans un instant.",
        variant: "destructive",
      });
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="mx-auto max-w-2xl px-5 py-6">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Tableau de bord
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-5 text-center space-y-3"
        >
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
            <BookHeart className="h-7 w-7 text-primary" />
          </div>
          <h1 className="font-serif text-3xl font-semibold tracking-tight">
            Mon Livre de Reconstruction 📖
          </h1>
          <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
            Tes pages de journal, tes portraits et tes petites victoires, rassemblés mois par mois.
            Un récit doux de qui tu deviens.
          </p>
        </motion.div>

        {!loading && chapters.length > 0 && (
          <div className="mt-6 grid grid-cols-3 gap-2 text-center">
            <Stat label="Chapitres" value={chapters.length} />
            <Stat label="Pages" value={totals.entries + totals.victories} />
            <Stat label="Portraits" value={totals.portraits} />
          </div>
        )}

        <div className="mt-6 flex justify-center">
          <Button
            onClick={handleExport}
            disabled={exporting || loading || chapters.length === 0}
            size="lg"
            className="rounded-full"
          >
            {exporting ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Préparation…</>
            ) : (
              <><Download className="mr-2 h-4 w-4" /> Télécharger en PDF</>
            )}
          </Button>
        </div>

        <div className="mt-8 space-y-3">
          {loading ? (
            <p className="text-center text-sm text-muted-foreground">Chargement de ton livre…</p>
          ) : chapters.length === 0 ? (
            <div className="rounded-2xl bg-card p-8 text-center shadow-soft border border-primary/10 space-y-3">
              <Sparkles className="h-6 w-6 mx-auto text-primary/70" />
              <p className="text-sm text-muted-foreground">
                Ton livre est encore vierge. Écris quelques pages dans ton journal, puis reviens —
                chaque mois deviendra un chapitre.
              </p>
              <Link
                to="/lies-autrement/journal"
                className="inline-block text-sm font-medium text-primary hover:underline"
              >
                Aller au journal →
              </Link>
            </div>
          ) : (
            chapters.map((ch, i) => {
              const k = monthKey(ch.year, ch.month);
              const isOpen = openKey === k;
              return (
                <motion.div
                  key={k}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="rounded-2xl bg-card border border-primary/10 shadow-soft overflow-hidden"
                >
                  <button
                    onClick={() => setOpenKey(isOpen ? null : k)}
                    className="w-full flex items-center justify-between p-4 text-left hover:bg-primary/5 transition-colors"
                  >
                    <div>
                      <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">
                        Chapitre {i + 1}
                      </p>
                      <h2 className="font-serif text-lg font-semibold text-primary">
                        {MONTHS[ch.month - 1]} {ch.year}
                      </h2>
                    </div>
                    <div className="text-xs text-muted-foreground text-right space-y-0.5">
                      {ch.portrait && <p>🌸 Portrait</p>}
                      {ch.victories.length > 0 && <p>✦ {ch.victories.length} victoire{ch.victories.length > 1 ? "s" : ""}</p>}
                      {ch.entries.length > 0 && <p>📝 {ch.entries.length} page{ch.entries.length > 1 ? "s" : ""}</p>}
                    </div>
                  </button>

                  {isOpen && (
                    <div className="px-4 pb-5 space-y-5 border-t border-primary/10 pt-4">
                      {ch.portrait && (
                        <Section title="Portrait du mois">
                          <PortraitBlock label="Ce que tu as surmonté" text={ch.portrait.overcome} />
                          <PortraitBlock label="Ce que tu développes" text={ch.portrait.developing} />
                          <PortraitBlock label="Tes nouvelles forces" text={ch.portrait.new_strengths} />
                          <PortraitBlock label="La femme que tu deviens" text={ch.portrait.becoming} />
                        </Section>
                      )}

                      {ch.victories.length > 0 && (
                        <Section title="Tes petites victoires">
                          <div className="space-y-3">
                            {ch.victories.map((v) => (
                              <div key={v.id} className="rounded-xl bg-accent/30 p-3">
                                <p className="text-[11px] text-muted-foreground italic mb-1">
                                  ✦ {new Date(v.created_at).toLocaleDateString("fr-FR", { day: "2-digit", month: "long" })}
                                </p>
                                <p className="text-sm text-foreground/85 whitespace-pre-line">{v.content}</p>
                              </div>
                            ))}
                          </div>
                        </Section>
                      )}

                      {ch.entries.length > 0 && (
                        <Section title="Pages de journal">
                          <div className="space-y-3">
                            {ch.entries.map((e) => (
                              <div key={e.id} className="rounded-xl bg-secondary/40 p-3">
                                <p className="text-[11px] text-muted-foreground italic mb-1">
                                  {new Date(e.created_at).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" })}
                                </p>
                                <p className="text-sm text-foreground/85 whitespace-pre-line line-clamp-[12]">
                                  {e.content}
                                </p>
                              </div>
                            ))}
                          </div>
                        </Section>
                      )}
                    </div>
                  )}
                </motion.div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

const Stat = ({ label, value }: { label: string; value: number }) => (
  <div className="rounded-xl bg-card border border-primary/10 py-3">
    <p className="font-serif text-2xl font-semibold text-primary">{value}</p>
    <p className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</p>
  </div>
);

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div>
    <h3 className="font-serif text-sm font-semibold text-primary/90 mb-2 uppercase tracking-wider">
      {title}
    </h3>
    {children}
  </div>
);

const PortraitBlock = ({ label, text }: { label: string; text: string }) => (
  <div className="mb-3">
    <p className="text-xs font-medium text-primary italic mb-1">{label}</p>
    <p className="text-sm text-foreground/85 whitespace-pre-line leading-relaxed">{text}</p>
  </div>
);

export default LivreReconstruction;
