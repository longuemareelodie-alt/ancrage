import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Clock, Loader2, Sparkles, CloudLightning, Sprout, Sun, PenLine, Check } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

type Timeline = {
  before_text: string;
  storm_text: string;
  today_text: string;
};

type JournalEntry = {
  id: string;
  content: string;
  created_at: string;
  prompt_key: string | null;
};

const STEPS = [
  {
    key: "before" as const,
    title: "Avant",
    subtitle: "Qui étais-tu quand tu as commencé ?",
    icon: Sprout,
    placeholder: "Avant, j'étais… (ce que tu ressentais, ce qui te pesait, ce que tu cherchais)",
  },
  {
    key: "storm" as const,
    title: "Tempête",
    subtitle: "Ce que tu as traversé",
    icon: CloudLightning,
    placeholder: "Ce que j'ai traversé… (les épreuves, les nuits longues, ce qui t'a secouée)",
  },
  {
    key: "today" as const,
    title: "Aujourd'hui",
    subtitle: "Qui es-tu devenue ?",
    icon: Sun,
    placeholder: "Aujourd'hui, je suis… (tes forces, ta douceur, ce que tu sais maintenant)",
  },
];

const FriseEvolution = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [timeline, setTimeline] = useState<Timeline>({ before_text: "", storm_text: "", today_text: "" });
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [editMode, setEditMode] = useState(false);
  const [draft, setDraft] = useState<Timeline>({ before_text: "", storm_text: "", today_text: "" });

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      const [tlRes, entriesRes] = await Promise.all([
        supabase
          .from("evolution_timelines")
          .select("before_text, storm_text, today_text")
          .eq("user_id", user.id)
          .maybeSingle(),
        supabase
          .from("private_journal_entries")
          .select("id, content, created_at, prompt_key")
          .eq("user_id", user.id)
          .order("created_at", { ascending: true }),
      ]);
      if (cancelled) return;
      const tl = tlRes.data ?? { before_text: "", storm_text: "", today_text: "" };
      setTimeline(tl);
      setDraft(tl);
      setEntries((entriesRes.data ?? []) as JournalEntry[]);
      // Onboarding: edit mode if nothing yet
      const empty = !tl.before_text && !tl.storm_text && !tl.today_text;
      setEditMode(empty);
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [user]);

  const handleSave = async () => {
    if (!user || saving) return;
    setSaving(true);
    const { error } = await supabase
      .from("evolution_timelines")
      .upsert(
        { user_id: user.id, ...draft },
        { onConflict: "user_id" },
      );
    setSaving(false);
    if (error) {
      toast({ title: "Oups", description: "Impossible de sauvegarder.", variant: "destructive" });
      return;
    }
    setTimeline(draft);
    setEditMode(false);
    toast({ title: "Frise mise à jour ✨", description: "Ton parcours est enregistré." });
  };

  const milestones = useMemo(() => {
    const filled = STEPS.filter((s) => timeline[`${s.key}_text` as keyof Timeline]).length;
    return filled;
  }, [timeline]);

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
            <Clock className="h-7 w-7 text-primary" />
          </div>
          <h1 className="font-serif text-3xl font-semibold tracking-tight">
            Ma Frise d'Évolution 🕰️
          </h1>
          <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
            Trois étapes pour raconter ton chemin. Ton journal viendra l'enrichir, jour après jour.
          </p>
        </motion.div>

        {loading ? (
          <p className="mt-10 text-center text-sm text-muted-foreground">Chargement…</p>
        ) : editMode ? (
          <OnboardingForm
            draft={draft}
            setDraft={setDraft}
            saving={saving}
            onSave={handleSave}
            onCancel={milestones > 0 ? () => { setDraft(timeline); setEditMode(false); } : undefined}
          />
        ) : (
          <>
            <div className="mt-8 flex justify-end">
              <Button variant="ghost" size="sm" onClick={() => setEditMode(true)}>
                <PenLine className="mr-1.5 h-3.5 w-3.5" /> Modifier
              </Button>
            </div>
            <TimelineView timeline={timeline} entries={entries} />
          </>
        )}
      </div>
    </div>
  );
};

const OnboardingForm = ({
  draft, setDraft, saving, onSave, onCancel,
}: {
  draft: Timeline;
  setDraft: (t: Timeline) => void;
  saving: boolean;
  onSave: () => void;
  onCancel?: () => void;
}) => (
  <div className="mt-8 space-y-5">
    {STEPS.map((step, i) => {
      const Icon = step.icon;
      const field = `${step.key}_text` as keyof Timeline;
      return (
        <motion.div
          key={step.key}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.08 }}
          className="rounded-2xl bg-card border border-primary/10 p-5 shadow-soft"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <Icon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-semibold text-primary">{step.title}</h3>
              <p className="text-xs text-muted-foreground">{step.subtitle}</p>
            </div>
          </div>
          <Textarea
            value={draft[field]}
            onChange={(e) => setDraft({ ...draft, [field]: e.target.value })}
            placeholder={step.placeholder}
            rows={4}
            className="resize-none"
          />
        </motion.div>
      );
    })}

    <div className="flex gap-2 pt-2">
      {onCancel && (
        <Button variant="outline" onClick={onCancel} disabled={saving} className="flex-1">
          Annuler
        </Button>
      )}
      <Button onClick={onSave} disabled={saving} className="flex-1 rounded-full">
        {saving ? (
          <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sauvegarde…</>
        ) : (
          <><Check className="mr-2 h-4 w-4" /> Enregistrer ma frise</>
        )}
      </Button>
    </div>
  </div>
);

const TimelineView = ({ timeline, entries }: { timeline: Timeline; entries: JournalEntry[] }) => {
  // Group entries by month for the journal section
  const enriched = useMemo(() => {
    const map = new Map<string, { label: string; date: Date; entries: JournalEntry[] }>();
    for (const e of entries) {
      const d = new Date(e.created_at);
      const k = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      if (!map.has(k)) {
        map.set(k, {
          label: d.toLocaleDateString("fr-FR", { month: "long", year: "numeric" }),
          date: new Date(d.getFullYear(), d.getMonth(), 1),
          entries: [],
        });
      }
      map.get(k)!.entries.push(e);
    }
    return Array.from(map.values()).sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [entries]);

  return (
    <div className="mt-4 relative">
      {/* Vertical line */}
      <div className="absolute left-[27px] top-2 bottom-2 w-[2px] bg-gradient-to-b from-primary/40 via-primary/20 to-accent/40 rounded-full" />

      <div className="space-y-6">
        {STEPS.map((step, i) => {
          const Icon = step.icon;
          const text = timeline[`${step.key}_text` as keyof Timeline];
          return (
            <motion.div
              key={step.key}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="relative pl-16"
            >
              <div className="absolute left-0 top-1 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/5 border-2 border-primary/30 shadow-soft">
                <Icon className="h-6 w-6 text-primary" />
              </div>
              <div className="rounded-2xl bg-card border border-primary/10 p-4 shadow-soft">
                <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">
                  Étape {i + 1}
                </p>
                <h3 className="font-serif text-xl font-semibold text-primary mt-0.5">
                  {step.title}
                </h3>
                <p className="text-xs text-muted-foreground italic mb-2">{step.subtitle}</p>
                {text ? (
                  <p className="text-sm text-foreground/85 whitespace-pre-line leading-relaxed">
                    {text}
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground italic">
                    Pas encore écrit — clique sur « Modifier » pour le compléter.
                  </p>
                )}
              </div>
            </motion.div>
          );
        })}

        {/* Journal enrichment */}
        {enriched.length > 0 && (
          <>
            <div className="relative pl-16 pt-2">
              <div className="absolute left-[19px] top-3 flex h-4 w-4 items-center justify-center rounded-full bg-accent border-2 border-background">
                <Sparkles className="h-2.5 w-2.5 text-accent-foreground" />
              </div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium pt-1">
                Et au fil des jours…
              </p>
            </div>

            {enriched.map((group, i) => (
              <motion.div
                key={group.label}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.04 }}
                className="relative pl-16"
              >
                <div className="absolute left-[19px] top-3 h-4 w-4 rounded-full bg-primary/30 border-2 border-background" />
                <div className="rounded-2xl bg-secondary/40 border border-primary/5 p-4">
                  <p className="font-serif text-sm font-semibold text-primary capitalize mb-2">
                    {group.label}
                  </p>
                  <div className="space-y-2">
                    {group.entries.slice(0, 3).map((e) => (
                      <p
                        key={e.id}
                        className="text-xs text-foreground/80 leading-relaxed line-clamp-3"
                      >
                        {e.prompt_key === "victoire" ? "✦ " : "· "}
                        {e.content}
                      </p>
                    ))}
                    {group.entries.length > 3 && (
                      <p className="text-[11px] text-muted-foreground italic">
                        + {group.entries.length - 3} autre{group.entries.length - 3 > 1 ? "s" : ""} entrée{group.entries.length - 3 > 1 ? "s" : ""}
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </>
        )}
      </div>
    </div>
  );
};

export default FriseEvolution;
