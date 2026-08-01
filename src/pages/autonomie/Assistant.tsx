import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Sparkles, Loader2, Printer, PenLine } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import HubShell from "@/components/hub/HubShell";
import { SUPPORT_TYPES, SupportItem, SupportType } from "@/data/supportTemplates";
import { exportSupportPdf } from "@/lib/exportSupportPdf";
import { toast } from "@/hooks/use-toast";

type Suggestion = {
  type: SupportType;
  title: string;
  description: string;
  items: SupportItem[];
};

type Profile = { id: string; first_name: string };

const EXAMPLES = [
  "Mon fils refuse de mettre ses chaussures.",
  "Le coucher se termine toujours en crise.",
  "Elle panique dans les magasins bruyants.",
  "Il oublie tout le matin avant l'école.",
];

/**
 * Assistant Éclosia — on décrit une situation, on repart avec des supports
 * concrets, imprimables. Ce n'est pas un chat : c'est une fabrique.
 */
const Assistant = () => {
  const navigate = useNavigate();
  const [situation, setSituation] = useState("");
  const [loading, setLoading] = useState(false);
  const [intro, setIntro] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [childId, setChildId] = useState("");

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("family_medical_profiles")
        .select("id, first_name")
        .order("created_at");
      setProfiles(data ?? []);
      if (data?.length) setChildId(data[0].id);
    })();
  }, []);

  const childName = profiles.find((p) => p.id === childId)?.first_name;

  const ask = async () => {
    if (situation.trim().length < 5 || loading) return;
    setLoading(true);
    setSuggestions([]);
    setIntro("");
    const { data, error } = await supabase.functions.invoke("assistant-support", {
      body: { situation: situation.trim(), childName },
    });
    setLoading(false);
    if (error || data?.error) {
      toast({
        description: data?.message ?? "L'assistant n'a pas pu répondre. Réessaie dans un instant.",
        variant: "destructive",
      });
      return;
    }
    setIntro(data.intro ?? "");
    setSuggestions(data.supports ?? []);
  };

  const save = async (s: Suggestion) => {
    const { data: auth } = await supabase.auth.getUser();
    const uid = auth.user?.id;
    if (!uid) return;
    const { data, error } = await supabase
      .from("autonomy_supports")
      .insert({
        user_id: uid,
        profile_id: childId || null,
        support_type: s.type,
        title: s.title,
        description: s.description,
        content: { items: s.items },
      })
      .select("id")
      .single();
    if (error || !data) {
      toast({ description: "Impossible d'enregistrer ce support.", variant: "destructive" });
      return;
    }
    navigate("/autonomie/support/" + data.id);
  };

  return (
    <HubShell
      title="Assistant Éclosia"
      subtitle="Décris la situation en une phrase. Je prépare les supports pour toi."
    >
      <button
        onClick={() => navigate("/autonomie/studio")}
        className="mb-2 flex items-center gap-1.5 text-xs font-medium text-muted-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" strokeWidth={2} /> Studio
      </button>

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

      <div className="rounded-[24px] border border-border/70 bg-card px-5 py-5">
        <textarea
          value={situation}
          onChange={(e) => setSituation(e.target.value)}
          rows={3}
          placeholder="Ex. : mon fils refuse de mettre ses chaussures."
          className="w-full resize-none bg-transparent text-sm leading-relaxed text-foreground outline-none placeholder:text-muted-foreground"
        />
        <button
          onClick={ask}
          disabled={loading || situation.trim().length < 5}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-5 py-3.5 text-sm font-semibold text-primary-foreground transition-transform active:scale-[0.98] disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2} /> Je prépare…
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" strokeWidth={1.75} /> Créer les supports
            </>
          )}
        </button>
      </div>

      {!suggestions.length && !loading && (
        <>
          <p className="pb-1 pt-4 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            Exemples
          </p>
          <div className="space-y-2">
            {EXAMPLES.map((ex) => (
              <button
                key={ex}
                onClick={() => setSituation(ex)}
                className="w-full rounded-[20px] border border-border/70 bg-card px-5 py-3.5 text-left text-sm text-muted-foreground transition-all hover:border-primary/40 active:scale-[0.99]"
              >
                {ex}
              </button>
            ))}
          </div>
        </>
      )}

      <AnimatePresence>
        {intro && (
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="pt-4 text-sm leading-relaxed text-muted-foreground"
          >
            {intro}
          </motion.p>
        )}
      </AnimatePresence>

      {suggestions.map((s, i) => {
        const def = SUPPORT_TYPES[s.type];
        return (
          <motion.div
            key={s.title + i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] }}
            className="rounded-[24px] border border-border/70 bg-card px-5 py-5"
          >
            <div className="flex items-start gap-3">
              {def && <def.icon className="mt-0.5 h-5 w-5 shrink-0 text-foreground" strokeWidth={1.75} />}
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-foreground">{s.title}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {def?.label ?? s.type}
                  {s.description ? " · " + s.description : ""}
                </p>
              </div>
            </div>

            <ul className="mt-4 space-y-1.5">
              {s.items.map((it, j) => (
                <li key={j} className="flex gap-2 text-sm text-foreground">
                  {it.time && (
                    <span className="w-11 shrink-0 text-xs font-semibold tabular-nums text-muted-foreground">
                      {it.time}
                    </span>
                  )}
                  <span className="min-w-0 flex-1">{it.label}</span>
                </li>
              ))}
            </ul>

            <div className="mt-5 flex gap-2">
              <button
                onClick={() => save(s)}
                className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-3 text-xs font-semibold text-primary-foreground transition-transform active:scale-[0.98]"
              >
                <PenLine className="h-3.5 w-3.5" strokeWidth={2} /> Enregistrer et modifier
              </button>
              <button
                onClick={() =>
                  exportSupportPdf({
                    title: s.title,
                    type: s.type,
                    childName,
                    items: s.items,
                  })
                }
                className="flex items-center justify-center gap-2 rounded-2xl border border-border/70 px-4 py-3 text-xs font-semibold text-foreground transition-transform active:scale-[0.98]"
              >
                <Printer className="h-3.5 w-3.5" strokeWidth={2} /> PDF
              </button>
            </div>
          </motion.div>
        );
      })}
    </HubShell>
  );
};

export default Assistant;
