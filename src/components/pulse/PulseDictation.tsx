import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Loader2, Mic, Square, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { guessDomain, type PulseDomain } from "@/data/pulseMascots";
import { useVoiceDictation } from "@/hooks/useVoiceDictation";
import { toast } from "@/hooks/use-toast";
import MascotPicker from "@/components/pulse/MascotPicker";

/**
 * 🎙️ Dictée vocale PULSE — on parle, la prochaine action s'écrit toute seule.
 * Le texte dicté devient une tâche dans les tâches existantes (`todo_items`).
 */
const PulseDictation = ({ onAdded }: { onAdded?: () => void }) => {
  const [draft, setDraft] = useState("");
  const [saving, setSaving] = useState(false);
  const [chosen, setChosen] = useState<PulseDomain | null | undefined>(undefined);

  const { status, partial, start, stop, cancel } = useVoiceDictation({
    onDone: (text) => setDraft(text),
    onError: (message) => toast({ description: message }),
  });

  const domain = chosen !== undefined ? chosen : draft ? guessDomain(draft) : null;

  const save = async () => {
    const title = draft.trim();
    if (!title || saving) return;
    setSaving(true);
    const { data: auth } = await supabase.auth.getUser();
    const uid = auth.user?.id;
    if (!uid) {
      setSaving(false);
      return;
    }
    const { error } = await supabase
      .from("todo_items")
      .insert({ user_id: uid, title, domain });
    setSaving(false);
    if (error) {
      toast({ description: "Ça n'a pas pu être enregistré. On réessaie ?" });
      return;
    }
    navigator.vibrate?.(12);
    setDraft("");
    setChosen(undefined);
    toast({ description: "C'est noté. Tu n'as plus à y penser." });
    onAdded?.();
  };

  const recording = status === "recording";
  const transcribing = status === "transcribing";

  return (
    <div className="mt-4">
      <div className="flex items-center gap-3">
        <motion.button
          whileTap={{ scale: 0.94 }}
          onClick={recording ? stop : start}
          disabled={transcribing}
          aria-label={recording ? "Arrêter la dictée" : "Dicter à voix haute"}
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full border transition-colors ${
            recording
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border/70 text-foreground"
          } disabled:opacity-60`}
        >
          {transcribing ? (
            <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.75} />
          ) : recording ? (
            <Square className="h-3.5 w-3.5" strokeWidth={2.5} />
          ) : (
            <Mic className="h-4 w-4" strokeWidth={1.75} />
          )}
        </motion.button>

        <div className="min-w-0 flex-1">
          {recording ? (
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1" aria-hidden>
                {[0, 1, 2].map((i) => (
                  <motion.span
                    key={i}
                    className="h-3 w-[3px] rounded-full bg-primary"
                    animate={{ scaleY: [0.5, 1.6, 0.5] }}
                    transition={{ duration: 1, repeat: Infinity, delay: i * 0.15 }}
                  />
                ))}
              </span>
              <p className="text-xs text-muted-foreground">Je t'écoute… parle tranquillement.</p>
            </div>
          ) : transcribing ? (
            <p className="text-xs text-muted-foreground">
              {partial || "J'écris ce que tu viens de dire…"}
            </p>
          ) : (
            <p className="text-xs text-muted-foreground">
              Dicte ta prochaine action, je l'écris pour toi.
            </p>
          )}
        </div>

        {recording && (
          <button
            onClick={cancel}
            aria-label="Annuler"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border/60 text-muted-foreground"
          >
            <X className="h-4 w-4" strokeWidth={1.75} />
          </button>
        )}
      </div>

      <AnimatePresence>
        {draft && !recording && !transcribing && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-3 rounded-[18px] border border-border/60 bg-card px-4 py-3"
          >
            <div className="flex items-center gap-3">
              <MascotAvatar mascot={mascot} size={34} className="rounded-xl" />
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                aria-label="Action dictée"
                className="min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none"
              />
            </div>
            <div className="mt-3 flex items-center gap-2">
              <button
                onClick={save}
                disabled={saving}
                className="flex flex-1 items-center justify-center gap-2 rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-transform active:scale-[0.98] disabled:opacity-60"
              >
                <Check className="h-4 w-4" strokeWidth={2} />
                {saving ? "J'enregistre…" : "Garder cette action"}
              </button>
              <button
                onClick={() => setDraft("")}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border/70 text-muted-foreground"
                aria-label="Effacer"
              >
                <X className="h-4 w-4" strokeWidth={1.75} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PulseDictation;
