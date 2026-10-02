import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Loader2, Mic, PenLine, Square, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useVoiceDictation } from "@/hooks/useVoiceDictation";
import { helpNow, type HelpAction, type HelpContext, type HelpResult } from "@/lib/helpNow";
import { toast } from "@/hooks/use-toast";

/**
 * 🆘 « Éclosia m'aide maintenant » — on décrit, Éclosia oriente vers UNE aide.
 * Les données lues sont uniquement celles du compte connecté.
 */
const HelpNowBlock = ({ next }: { next: { title: string; to: string } | null }) => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [ctx, setCtx] = useState<HelpContext | null>(null);
  const [result, setResult] = useState<HelpResult | null>(null);
  const [more, setMore] = useState(false);

  const dictation = useVoiceDictation({
    onDone: (spoken) => {
      setOpen(true);
      setText((p) => (p.trim() ? `${p} ${spoken}` : spoken));
    },
    onError: (m) => toast({ description: m }),
  });

  useEffect(() => {
    if (!open || ctx) return;
    (async () => {
      const { data: auth } = await supabase.auth.getUser();
      const uid = auth.user?.id;
      if (!uid) return;
      const [family, contacts, supports] = await Promise.all([
        supabase.from("family_medical_profiles").select("id, first_name").eq("user_id", uid),
        supabase.from("business_contacts").select("id, first_name, last_exchange_date, next_action").eq("user_id", uid),
        supabase.from("autonomy_supports").select("id, title, support_type, profile_id").eq("user_id", uid).eq("archived", false).limit(200),
      ]);
      setCtx({
        family: family.data ?? [],
        contacts: contacts.data ?? [],
        supports: supports.data ?? [],
        next: null,
      });
    })();
  }, [open, ctx]);

  const run = (value = text) => {
    if (!value.trim()) return;
    setMore(false);
    setResult(helpNow(value, { ...(ctx ?? { family: [], contacts: [], supports: [], next: null }), next }));
  };

  const reset = () => {
    setResult(null);
    setText("");
    setMore(false);
  };

  const act = async (a: HelpAction) => {
    const { data: auth } = await supabase.auth.getUser();
    const uid = auth.user?.id;
    if (a.kind === "go") return navigate(a.to);
    if (!uid) return;
    if (a.kind === "relance") {
      const today = new Date().toISOString().slice(0, 10);
      const { error } = await supabase
        .from("business_contacts")
        .update({ followup_date: today, next_action: text.trim().slice(0, 200) })
        .eq("id", a.contactId)
        .eq("user_id", uid);
      if (error) return toast({ description: "Ça n'a pas pu être enregistré. On réessaie ?" });
      return navigate("/business/relances");
    }
    if (a.kind === "note") {
      const { error } = await supabase.from("organisation_notes").insert({ user_id: uid, content: text.trim(), pinned: false });
      toast({ description: error ? "La note n'a pas pu être créée." : "C'est noté, en sécurité." });
      if (!error) reset();
      return;
    }
    if (a.kind === "task") {
      const { error } = await supabase.from("todo_items").insert({ user_id: uid, title: text.trim().slice(0, 200) });
      toast({ description: error ? "La tâche n'a pas pu être créée." : "C'est dans tes tâches." });
      if (!error) reset();
      return;
    }
    if (a.kind === "need") {
      const { data } = await supabase.from("profiles").select("personalization_prefs").eq("user_id", uid).maybeSingle();
      const prefs = (data?.personalization_prefs ?? {}) as Record<string, unknown>;
      const list = Array.isArray(prefs.situations) ? (prefs.situations as string[]) : [];
      const { error } = await supabase
        .from("profiles")
        .update({ personalization_prefs: { ...prefs, situations: [...list, text.trim().slice(0, 200)].slice(-30) } })
        .eq("user_id", uid);
      toast({ description: error ? "Ça n'a pas pu être enregistré." : "C'est ajouté à tes besoins." });
      if (!error) reset();
    }
  };

  return (
    <div className="mt-4 rounded-[20px] border border-primary/25 bg-primary/5 px-4 py-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-foreground">Besoin d'aide maintenant ?</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Dis-moi ce qui se passe. Éclosia t'aide à trouver quoi faire maintenant.
          </p>
        </div>
        {(open || result) && (
          <button onClick={() => { reset(); setOpen(false); }} aria-label="Fermer" className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-muted-foreground">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {!result && (
        <>
          {open && (
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={3}
              autoFocus
              placeholder="Ex. : Je dois partir dans 10 minutes et mon enfant refuse de s'habiller."
              className="mt-3 w-full resize-none rounded-[16px] border border-border/70 bg-card px-4 py-3 text-sm text-foreground outline-none placeholder:text-muted-foreground/60 focus:border-primary/50"
            />
          )}
          <div className="mt-3 grid grid-cols-2 gap-2">
            {open ? (
              <button
                onClick={() => run()}
                disabled={!text.trim()}
                className="flex min-h-[44px] items-center justify-center gap-2 rounded-full bg-primary px-4 text-sm font-semibold text-primary-foreground disabled:opacity-50"
              >
                M'aider <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <button onClick={() => setOpen(true)} className="flex min-h-[44px] items-center justify-center gap-2 rounded-full border border-border/70 bg-card px-4 text-sm font-semibold text-foreground">
                <PenLine className="h-4 w-4" /> Écrire
              </button>
            )}
            <button
              onClick={dictation.status === "recording" ? dictation.stop : dictation.start}
              disabled={dictation.status === "transcribing"}
              className="flex min-h-[44px] items-center justify-center gap-2 rounded-full border border-border/70 bg-card px-4 text-sm font-semibold text-foreground disabled:opacity-60"
            >
              {dictation.status === "transcribing" ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> J'écris…</>
              ) : dictation.status === "recording" ? (
                <><Square className="h-3.5 w-3.5" /> Arrêter</>
              ) : (
                <><Mic className="h-4 w-4" /> Dicter</>
              )}
            </button>
          </div>
        </>
      )}

      {result?.type === "question" && (
        <div className="mt-3">
          <p className="text-sm text-foreground">{result.question}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {result.choices.map((c) => (
              <button
                key={c.label}
                onClick={() => { const v = text + c.append; setText(v); run(v); }}
                className="min-h-[40px] rounded-full border border-border/70 bg-card px-4 text-sm text-foreground"
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {result?.type === "answer" && (
        <div className="mt-3 space-y-3">
          <p className="font-serif text-lg leading-snug text-foreground">{result.lead}</p>
          <dl className="space-y-1 text-xs">
            <div className="flex gap-2"><dt className="text-muted-foreground">Situation :</dt><dd className="font-medium text-foreground">{result.situation}</dd></div>
            {result.person && <div className="flex gap-2"><dt className="text-muted-foreground">Pour :</dt><dd className="font-medium text-foreground">{result.person}</dd></div>}
            {result.resource && <div className="flex gap-2"><dt className="text-muted-foreground">Ressource :</dt><dd className="font-medium text-foreground">{result.resource}</dd></div>}
          </dl>
          <div className="rounded-[16px] bg-card px-4 py-3">
            <p className="text-sm text-foreground">{result.firstAction}</p>
            {result.steps && (
              <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-foreground">
                {result.steps.map((s) => <li key={s}>{s}</li>)}
              </ol>
            )}
            {result.details?.map((d) => <p key={d} className="mt-1 text-xs text-muted-foreground">{d}</p>)}
          </div>
          {result.hiddenSpace && (
            <p className="text-xs text-muted-foreground">
              Cela concerne ton espace {result.hiddenSpace.label} (actuellement masqué). Tu peux l'ouvrir sans le réactiver.
            </p>
          )}
          {result.caution && <p className="text-xs text-muted-foreground">{result.caution}</p>}
          <button
            onClick={() => void act(result.primary)}
            className="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground active:scale-[0.98]"
          >
            → {result.primary.label}
          </button>
          {result.others.length > 0 && !more && (
            <button onClick={() => setMore(true)} className="w-full text-center text-xs font-medium text-muted-foreground underline-offset-4 hover:underline">
              Voir d'autres options
            </button>
          )}
          {more && (
            <div className="space-y-2">
              {result.others.map((o) => (
                <button key={o.label} onClick={() => void act(o)} className="flex min-h-[44px] w-full items-center justify-between rounded-full border border-border/70 bg-card px-4 text-left text-sm text-foreground">
                  {o.label} <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                </button>
              ))}
            </div>
          )}
          <button onClick={reset} className="w-full text-center text-xs text-muted-foreground">Décrire autre chose</button>
        </div>
      )}
    </div>
  );
};

export default HelpNowBlock;
