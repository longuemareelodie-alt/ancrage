import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2, Mic, Sparkles, Square } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { guessDomain, mascotOf } from "@/data/pulseMascots";
import { useVoiceDictation } from "@/hooks/useVoiceDictation";
import { toast } from "@/hooks/use-toast";

/**
 * 🧠 Vider ma tête — on écrit tout en vrac, Éclosia range.
 * Chaque ligne devient une tâche dans les tâches existantes (`todo_items`),
 * avec un domaine devineé pour lui associer un compagnon PULSE.
 */
const ViderMaTete = () => {
  const navigate = useNavigate();
  const [text, setText] = useState("");
  const [saving, setSaving] = useState(false);

  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  const save = async () => {
    if (!lines.length || saving) return;
    setSaving(true);
    const { data: auth } = await supabase.auth.getUser();
    const uid = auth.user?.id;
    if (!uid) {
      setSaving(false);
      return;
    }
    const { error } = await supabase.from("todo_items").insert(
      lines.map((title) => ({
        user_id: uid,
        title,
        domain: guessDomain(title),
      })),
    );
    setSaving(false);
    if (error) {
      toast({ description: "Ça n'a pas pu être enregistré. On réessaie ?" });
      return;
    }
    navigator.vibrate?.(12);
    toast({
      description:
        lines.length > 1
          ? `${lines.length} choses sont sorties de ta tête. Elles sont en sécurité.`
          : "C'est sorti de ta tête. C'est en sécurité.",
    });
    navigate("/aujourdhui");
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto w-full max-w-lg px-6 pb-10 pt-10">
        <button
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center gap-2 text-sm text-muted-foreground"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={1.75} />
          Retour
        </button>

        <h1 className="font-serif text-3xl text-foreground">Vider ma tête 🧠</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Écris tout ce qui tourne, une chose par ligne. Pas besoin d'ordre, ni de phrases
          complètes. Je m'occupe de ranger.
        </p>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={10}
          autoFocus
          placeholder={"Appeler le médecin\nFacture électricité\nSigner le mot de la maîtresse"}
          className="mt-6 w-full resize-none rounded-[20px] border border-border/70 bg-card px-5 py-4 text-sm leading-relaxed text-foreground outline-none placeholder:text-muted-foreground/60 focus:border-primary/50"
        />

        {lines.length > 0 && (
          <ul className="mt-4 space-y-2">
            {lines.map((l, i) => {
              const m = mascotOf(guessDomain(l));
              return (
                <li
                  key={i}
                  className="flex items-center gap-3 rounded-[18px] border border-border/60 bg-card/60 px-4 py-3"
                >
                  <span
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-sm ${m?.tint ?? "bg-secondary/40"}`}
                    aria-hidden
                  >
                    {m?.emoji ?? "✨"}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-sm text-foreground">{l}</span>
                  {m && <span className="shrink-0 text-[11px] text-muted-foreground">{m.label}</span>}
                </li>
              );
            })}
          </ul>
        )}

        <button
          onClick={save}
          disabled={!lines.length || saving}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-primary px-5 py-3.5 text-sm font-semibold text-primary-foreground transition-transform active:scale-[0.98] disabled:opacity-50"
        >
          <Sparkles className="h-4 w-4" strokeWidth={1.75} />
          {saving ? "J'enregistre…" : "Ranger pour moi"}
        </button>

        <p className="mt-4 text-center text-xs text-muted-foreground">
          Rien ne sera perdu. Tu retrouveras tout dans tes tâches.
        </p>
      </div>
    </div>
  );
};

export default ViderMaTete;
