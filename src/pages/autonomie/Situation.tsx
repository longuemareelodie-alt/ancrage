import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Phone } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import HubShell from "@/components/hub/HubShell";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import PictoChoice, { SpeakLine } from "@/components/child/PictoChoice";
import { loadChildPhotos } from "@/lib/childPhotos";
import { presentationFor, type ChildComm } from "@/lib/childAdapt";
import {
  QUESTIONS, SITUATIONS, isRepeatedText, matchSituation, situationByKey,
  type Answer, type AnswerSource, type SituationTemplate,
} from "@/data/situationTemplates";

type Trusted = { id: string; name: string; role: string; phone: string | null };
type Existing = { id: string; title: string; template_key: string | null; occurred_on: string };

const fmt = (d: string) => new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" });

/** 🧩 « Qu'est-ce que je fais dans cette situation ? » — observer, ressentir, décrire, demander de l'aide. */
const Situation = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [children, setChildren] = useState<ChildComm[]>([]);
  const [childId, setChildId] = useState<string | null>(params.get("enfant"));
  const [tpl, setTpl] = useState<SituationTemplate | null>(null);
  const [freeText, setFreeText] = useState("");
  const [situationId, setSituationId] = useState<string | null>(params.get("refaire"));
  const [existing, setExisting] = useState<Existing[]>([]);
  const [similar, setSimilar] = useState<Existing | null>(null);
  const [who, setWho] = useState<AnswerSource>("enfant");
  const [step, setStep] = useState<"choose" | "similar" | "intro" | "q" | "end">("choose");
  const [qi, setQi] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [words, setWords] = useState("");
  const [trusted, setTrusted] = useState<Trusted[]>([]);
  const [note, setNote] = useState({ parent_note: "", helped: "", not_helped: "" });
  const [saved, setSaved] = useState(false);
  const [photos, setPhotos] = useState<Record<string, string>>({});

  useEffect(() => {
    if (childId) loadChildPhotos(childId).then(setPhotos);
  }, [childId]);

  useEffect(() => {
    supabase
      .from("family_medical_profiles")
      .select("id, first_name, nickname, birth_date, communication_modes, question_prefs, answer_prefs, picto_mode, picto_show_text, max_choices")
      .order("created_at")
      .then(({ data }) => setChildren((data ?? []) as ChildComm[]));
  }, []);

  useEffect(() => {
    if (!childId) return;
    Promise.all([
      supabase.from("child_contacts").select("id, name, role, phone, is_trusted").eq("profile_id", childId),
      supabase.from("child_situations").select("id, title, template_key, occurred_on").eq("profile_id", childId).order("last_observed_at", { ascending: false }),
    ]).then(([{ data: c }, { data: s }]) => {
      const all = (c ?? []) as (Trusted & { is_trusted: boolean })[];
      setTrusted(all.filter((x) => x.is_trusted));
      const ex = (s ?? []) as Existing[];
      setExisting(ex);
      const modele = situationByKey(params.get("modele"));
      if (modele && !params.get("refaire")) {
        setTpl(modele);
        const sim = ex.find((e) => e.template_key === modele.key);
        if (sim) setSimilar(sim);
        setStep(sim ? "similar" : "intro");
      }
      const r = params.get("refaire");
      if (r) {
        const found = ex.find((x) => x.id === r);
        if (found) {
          setTpl(situationByKey(found.template_key) ?? { ...SITUATIONS[0], key: "libre", title: found.title, sensitive: false, questions: ["quoi", "ressens", "besoin"], explain: [] });
          setStep("intro");
        }
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [childId]);

  const child = children.find((c) => c.id === childId) ?? null;
  const pres = useMemo(() => presentationFor(child), [child]);
  const qs = tpl?.questions ?? [];
  const q = QUESTIONS[qs[qi]];

  const choicesFor = (keys: string[]) => {
    const extra = ["reponses:je-ne-sais-pas", ...(tpl?.sensitive ? ["reponses:pas-repondre"] : [])];
    return [...keys.slice(0, Math.max(1, pres.maxChoices - 1)), ...extra];
  };

  const pick = (t: SituationTemplate) => {
    setTpl(t);
    const sim = existing.find((e) => e.template_key === t.key);
    if (sim && !situationId) {
      setSimilar(sim);
      setStep("similar");
    } else setStep("intro");
  };

  const answer = (key: string, text?: string) => {
    const a: Answer = { question_key: q.key, answer_key: key, text, source: who };
    const next = [...answers.filter((x) => x.question_key !== q.key), a];
    setAnswers(next);
    if (qi + 1 < qs.length) setQi(qi + 1);
    else setStep("end");
  };

  const unsafe = answers.some((a) => a.answer_key === "reponses:securite-non");
  const repeated = answers.some((a) => a.answer_key === "reponses:plusieurs-fois") || isRepeatedText(freeText + " " + words);
  const wantsHelp = answers.some((a) => a.question_key === "aide" && a.answer_key === "reponses:oui");

  const save = async () => {
    if (!childId || !tpl) return;
    const { data: auth } = await supabase.auth.getUser();
    const uid = auth.user?.id;
    if (!uid) return;
    let sid = situationId;
    if (!sid) {
      const { data, error } = await supabase
        .from("child_situations")
        .insert({ user_id: uid, profile_id: childId, template_key: tpl.key === "libre" ? null : tpl.key, title: tpl.key === "libre" ? freeText.slice(0, 120) || "Situation" : tpl.title, context: freeText || null })
        .select("id")
        .single();
      if (error || !data) return toast({ description: "Enregistrement impossible.", variant: "destructive" });
      sid = data.id;
      setSituationId(sid);
    } else {
      await supabase.from("child_situations").update({ last_observed_at: new Date().toISOString() }).eq("id", sid);
    }
    const emotions = answers.filter((a) => a.answer_key.startsWith("emotions:")).map((a) => a.answer_key);
    const { error } = await supabase.from("child_situation_observations").insert({
      user_id: uid, situation_id: sid, profile_id: childId,
      answers: answers as never, emotions,
      child_words: who === "enfant" ? words || null : null,
      parent_note: [who === "parent" && words ? words : "", note.parent_note].filter(Boolean).join(" — ") || null,
      helped: note.helped || null, not_helped: note.not_helped || null, felt_unsafe: unsafe,
    });
    if (error) return toast({ description: "Enregistrement impossible.", variant: "destructive" });
    setSaved(true);
    toast({ description: "C'est gardé en mémoire." });
  };

  const back = () => navigate(childId ? `/famille/${childId}?onglet=situations` : "/autonomie");

  return (
    <HubShell title="Qu'est-ce que je fais dans cette situation ?" subtitle="Observer, comprendre, ressentir, demander de l'aide.">
      <button onClick={back} className="mb-1 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
        <ArrowLeft className="h-3.5 w-3.5" strokeWidth={2} /> Retour
      </button>

      {step === "choose" && (
        <div className="space-y-4">
          <div>
            <p className="mb-2 text-sm font-semibold text-foreground">Pour qui ?</p>
            <div className="flex flex-wrap gap-2">
              {children.map((c) => (
                <button key={c.id} onClick={() => setChildId(c.id)}
                  className={`rounded-full border px-4 py-1.5 text-xs font-medium ${c.id === childId ? "border-primary/60 bg-secondary/60 text-foreground" : "border-border/70 text-muted-foreground"}`}>
                  {c.nickname || c.first_name}
                </button>
              ))}
              {children.length === 0 && (
                <Link to="/famille" className="text-xs text-primary-dark">Ajouter un enfant dans Famille</Link>
              )}
            </div>
          </div>
          {childId && (
            <>
              <div className="space-y-2">
                <Textarea value={freeText} onChange={(e) => setFreeText(e.target.value)} placeholder="Raconte en quelques mots…" className="text-sm" />
                <Button size="sm" className="w-full" disabled={!freeText.trim()}
                  onClick={() => pick(matchSituation(freeText) ?? { key: "libre", emoji: "🧩", title: "Situation", sensitive: false, questions: ["quoi", "ressens", "besoin", "aide"], explain: ["Tu as bien fait d'en parler."] })}>
                  Continuer
                </Button>
              </div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Ou choisis</p>
              <div className="grid grid-cols-1 gap-2">
                {SITUATIONS.map((s) => (
                  <button key={s.key} onClick={() => pick(s)} className="flex items-center gap-3 rounded-[18px] border border-border/70 bg-card px-4 py-3 text-left">
                    <span className="text-2xl" aria-hidden>{s.emoji}</span>
                    <span className="text-sm font-medium text-foreground">{s.title}</span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {step === "similar" && similar && (
        <div className="space-y-3 rounded-[20px] border border-border/70 bg-card px-5 py-5">
          <p className="text-sm font-semibold text-foreground">Cette situation ressemble à celle du {fmt(similar.occurred_on)}.</p>
          <Link to={`/famille/${childId}?onglet=situations`} className="block w-full rounded-full border border-border/70 py-2.5 text-center text-sm font-semibold text-foreground">Comparer</Link>
          <Button className="w-full" onClick={() => { setSituationId(similar.id); setStep("intro"); }}>Refaire les questions</Button>
          <Button variant="outline" className="w-full" onClick={() => setStep("intro")}>Créer une nouvelle observation</Button>
        </div>
      )}

      {step === "intro" && tpl && (
        <div className="space-y-4 rounded-[20px] border border-border/70 bg-card px-5 py-5">
          <p className="text-4xl" aria-hidden>🧩</p>
          {tpl.protective ? (
            <p className="text-sm font-semibold leading-relaxed text-foreground">{tpl.protective}</p>
          ) : (
            <p className="text-sm font-semibold text-foreground">On va essayer de comprendre ce qui s'est passé.</p>
          )}
          <p className="text-xs text-muted-foreground">Tu peux toujours répondre « Je ne sais pas ». Personne n'est obligé de répondre.</p>
          <div>
            <p className="mb-2 text-xs font-semibold text-foreground">Qui répond ?</p>
            <div className="flex gap-2">
              {([["enfant", `${child?.nickname || child?.first_name || "L'enfant"}`], ["parent", "Moi, le parent"]] as const).map(([k, l]) => (
                <button key={k} onClick={() => setWho(k)}
                  className={`flex-1 rounded-full border px-3 py-2 text-xs font-medium ${who === k ? "border-primary/60 bg-secondary/60 text-foreground" : "border-border/70 text-muted-foreground"}`}>{l}</button>
              ))}
            </div>
          </div>
          <Button className="w-full" onClick={() => { setQi(0); setAnswers([]); setStep("q"); }}>Commencer</Button>
        </div>
      )}

      {step === "q" && q && (
        <div className="space-y-4">
          <div className="flex gap-1">
            {qs.map((_, i) => <span key={i} className={`h-1 flex-1 rounded-full ${i <= qi ? "bg-primary" : "bg-border"}`} />)}
          </div>
          <div className="flex items-start justify-between gap-3">
            <p className={`font-semibold leading-snug text-foreground ${pres.big ? "text-xl" : "text-base"}`}>{q.text[pres.band]}</p>
            <SpeakLine text={q.text[pres.band]} />
          </div>
          {q.key === "pourquoi" && (
            <p className="text-xs text-muted-foreground">Tu n'es pas obligé de savoir pourquoi. On peut regarder ce qui s'est passé et comment tu te sens.</p>
          )}
          {q.free ? (
            <div className="space-y-2">
              <Textarea value={words} onChange={(e) => setWords(e.target.value)}
                placeholder={who === "enfant" ? "Ses mots, tels qu'il les dit" : "Ce que j'ai observé"} className="text-sm" />
              <p className="text-[11px] text-muted-foreground">
                Enregistré comme {who === "enfant" ? "parole rapportée de l'enfant" : "observation du parent"}, sans interprétation.
              </p>
              <Button className="w-full" onClick={() => answer(words.trim() ? "libre" : "reponses:je-ne-sais-pas", words.trim() || undefined)}>
                {words.trim() ? "Suivant" : "Passer"}
              </Button>
              <PictoChoice keys={choicesFor([])} pres={pres} photos={photos} onPick={(k) => answer(k)} />
            </div>
          ) : (
            <PictoChoice keys={choicesFor(q.choices)} pres={pres} photos={photos} onPick={(k) => answer(k)} />
          )}
          {qi > 0 && (
            <button onClick={() => setQi(qi - 1)} className="text-xs text-muted-foreground">← Question précédente</button>
          )}
        </div>
      )}

      {step === "end" && tpl && (
        <div className="space-y-4">
          {unsafe && (
            <div className="space-y-2 rounded-[20px] border-2 border-primary/60 bg-card px-5 py-5">
              <p className="text-sm font-semibold text-foreground">Tu n'es pas seul. Va voir un adulte de confiance maintenant.</p>
              {trusted.map((t) => (
                <p key={t.id} className="flex items-center justify-between text-sm text-foreground">
                  {t.name} <span className="text-xs text-muted-foreground">{t.role}</span>
                  {t.phone && <a href={`tel:${t.phone}`} className="text-primary-dark"><Phone className="h-4 w-4" /></a>}
                </p>
              ))}
              <p className="pt-1 text-xs leading-relaxed text-muted-foreground">
                Services publics en France, extérieurs à Éclosia : <a href="tel:119" className="font-semibold text-foreground">119</a> Allô Enfance en Danger (gratuit, 24h/24) ·{" "}
                <a href="tel:17" className="font-semibold text-foreground">17</a> Police · <a href="tel:15" className="font-semibold text-foreground">15</a> Samu ·{" "}
                <a href="tel:112" className="font-semibold text-foreground">112</a> Urgences. Éclosia n'est pas un service d'urgence.
              </p>
            </div>
          )}
          <div className="space-y-2 rounded-[20px] border border-border/70 bg-card px-5 py-5">
            {repeated && <p className="text-sm font-semibold text-foreground">Tu me dis que cela arrive plusieurs fois. On peut garder une trace de ce qui s'est passé.</p>}
            {tpl.explain.map((e) => <p key={e} className="text-sm leading-relaxed text-foreground">{e}</p>)}
            {tpl.sayIt && <p className="text-sm text-foreground"><span className="text-muted-foreground">Tu peux dire : </span>{tpl.sayIt}</p>}
            {tpl.sayIt && <SpeakLine text={tpl.sayIt} />}
          </div>

          {!saved ? (
            <div className="space-y-2 rounded-[20px] border border-border/70 bg-card px-5 py-4">
              <p className="text-xs font-semibold text-foreground">Pour le parent (facultatif)</p>
              <Textarea value={note.parent_note} onChange={(e) => setNote({ ...note, parent_note: e.target.value })} placeholder="Ce que j'ai observé" className="text-sm" />
              <Textarea value={note.helped} onChange={(e) => setNote({ ...note, helped: e.target.value })} placeholder="Ce qui a aidé" className="text-sm" />
              <Textarea value={note.not_helped} onChange={(e) => setNote({ ...note, not_helped: e.target.value })} placeholder="Ce qui n'a pas aidé" className="text-sm" />
              <Button className="w-full" onClick={save}>Enregistrer ce que je veux garder en mémoire</Button>
            </div>
          ) : (
            <p className="text-center text-sm text-muted-foreground">C'est gardé dans « Mes situations ».</p>
          )}
          <div className="grid grid-cols-1 gap-2">
            {(wantsHelp || tpl.sensitive || repeated) && (
              <Link to={`/famille/${childId}?onglet=contacts`} className="rounded-full border border-border/70 py-2.5 text-center text-sm font-semibold text-foreground">
                En parler à un adulte de confiance
              </Link>
            )}
            <Button variant="outline" onClick={back}>Terminer</Button>
          </div>
        </div>
      )}
    </HubShell>
  );
};

export default Situation;
