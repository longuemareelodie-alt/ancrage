import { useEffect, useState } from "react";
import { NotebookPen, Plus, Trash2, Sparkles, PenLine } from "lucide-react";
import LiesShell from "@/components/lies/LiesShell";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { JOURNAL_PROMPTS } from "@/data/journalPrompts";
import { toast } from "@/hooks/use-toast";
import JournalMemoryInsight from "@/components/journal/JournalMemoryInsight";
import SoftEmptyState from "@/components/SoftEmptyState";
import { celebrate } from "@/lib/gentleBadges";

type Entry = {
  id: string;
  mode: string;
  prompt_key: string | null;
  content: string;
  created_at: string;
};

const JournalPage = () => {
  const { user } = useAuth();
  const [entries, setEntries] = useState<Entry[]>([]);
  const [mode, setMode] = useState<"free" | "guided">("free");
  const [promptKey, setPromptKey] = useState<string | null>(null);
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [insightKey, setInsightKey] = useState(0);

  const load = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("private_journal_entries")
      .select("id, mode, prompt_key, content, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(50);
    if (data) setEntries(data as Entry[]);
  };

  useEffect(() => {
    load();
  }, [user]);

  const handleSave = async () => {
    if (!user || !content.trim()) return;
    setSaving(true);
    const { error } = await supabase.from("private_journal_entries").insert({
      user_id: user.id,
      mode,
      prompt_key: mode === "guided" ? promptKey : null,
      content: content.trim(),
    });
    setSaving(false);
    if (error) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
      return;
    }
    setContent("");
    setPromptKey(null);
    toast({ title: "C'est déposé 💛", description: "Ta page est enregistrée, rien qu'à toi." });
    celebrate("first_journal");
    load();
    setInsightKey((k) => k + 1);
  };

  const handleDelete = async (id: string) => {
    if (!user) return;
    const { error } = await supabase
      .from("private_journal_entries")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);
    if (error) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
      return;
    }
    setEntries((e) => e.filter((x) => x.id !== id));
  };

  const currentPrompt = JOURNAL_PROMPTS.find((p) => p.key === promptKey);

  return (
    <LiesShell
      title="Mon journal privé"
      subtitle="Un espace rien qu'à vous. Personne d'autre ne peut le lire."
      icon={<NotebookPen className="h-6 w-6" />}
    >
      <JournalMemoryInsight refreshKey={insightKey} />
      <div className="mb-5 rounded-2xl border border-border bg-card p-4">
        <div className="mb-3 flex gap-2">
          <button
            onClick={() => { setMode("free"); setPromptKey(null); }}
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm transition-colors ${
              mode === "free"
                ? "bg-[hsl(var(--lies))] text-[hsl(var(--lies-foreground))]"
                : "border border-border text-muted-foreground"
            }`}
          >
            <PenLine className="h-3.5 w-3.5" /> Écriture libre
          </button>
          <button
            onClick={() => setMode("guided")}
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm transition-colors ${
              mode === "guided"
                ? "bg-[hsl(var(--lies))] text-[hsl(var(--lies-foreground))]"
                : "border border-border text-muted-foreground"
            }`}
          >
            <Sparkles className="h-3.5 w-3.5" /> Avec un prompt
          </button>
        </div>

        {mode === "guided" && (
          <div className="mb-3 grid gap-1.5 sm:grid-cols-2">
            {JOURNAL_PROMPTS.map((p) => (
              <button
                key={p.key}
                onClick={() => setPromptKey(p.key)}
                className={`rounded-lg p-2 text-left text-xs transition-colors ${
                  promptKey === p.key
                    ? "bg-[hsl(var(--lies-soft))] text-foreground ring-1 ring-[hsl(var(--lies))]"
                    : "bg-muted/40 text-muted-foreground hover:bg-muted"
                }`}
              >
                {p.text}
              </button>
            ))}
          </div>
        )}

        {currentPrompt && (
          <p className="mb-2 rounded-lg bg-[hsl(var(--lies-soft))] p-2 text-sm italic text-foreground">
            {currentPrompt.text}
          </p>
        )}

        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={mode === "guided" && !promptKey ? "Choisissez un prompt ci-dessus…" : "Écrivez librement…"}
          rows={6}
          className="mb-3"
        />

        <Button
          onClick={handleSave}
          disabled={!content.trim() || saving || (mode === "guided" && !promptKey)}
          className="bg-[hsl(var(--lies))] hover:bg-[hsl(var(--lies)/0.9)] text-[hsl(var(--lies-foreground))]"
        >
          <Plus className="mr-2 h-4 w-4" />
          {saving ? "Enregistrement…" : "Enregistrer"}
        </Button>
      </div>

      <h2 className="mb-3 font-serif text-xl text-foreground">Mes entrées</h2>
      {entries.length === 0 ? (
        <SoftEmptyState
          emoji="💛"
          title="Chaque histoire commence quelque part."
          hint="Personne d'autre ne lira ces pages."
          actionLabel="Écrire ma première page"
          onAction={() =>
            document.querySelector("textarea")?.scrollIntoView({ behavior: "smooth", block: "center" })
          }
        />
      ) : (
        <ul className="space-y-2">
          {entries.map((e) => {
            const prompt = e.prompt_key ? JOURNAL_PROMPTS.find((p) => p.key === e.prompt_key) : null;
            return (
              <li key={e.id} className="rounded-xl border border-border bg-card p-3">
                <div className="mb-1 flex items-center justify-between gap-2">
                  <span className="text-xs text-muted-foreground">
                    {new Date(e.created_at).toLocaleString("fr-FR", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </span>
                  <button
                    onClick={() => handleDelete(e.id)}
                    className="text-muted-foreground hover:text-destructive"
                    aria-label="Supprimer"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                {prompt && <p className="mb-1 text-xs italic text-[hsl(var(--lies))]">{prompt.text}</p>}
                <p className="whitespace-pre-wrap text-sm text-foreground">{e.content}</p>
              </li>
            );
          })}
        </ul>
      )}
    </LiesShell>
  );
};

export default JournalPage;
