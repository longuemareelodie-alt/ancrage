import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Check, Loader2, Mic, Sparkles, Square, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { mascotOf, type PulseDomain } from "@/data/pulseMascots";
import MascotPicker from "@/components/pulse/MascotPicker";
import { useVoiceDictation } from "@/hooks/useVoiceDictation";
import { usePulseState } from "@/hooks/usePulseState";
import { parseBrainDump, prettyDate, type DumpItem, type FamilyPerson } from "@/lib/brainDump";
import { toast } from "@/hooks/use-toast";

/**
 * 🧠 Vide-cervEAU — « Balance tout. PULSE s'occupe du tri. »
 * On écrit en vrac, Éclosia sépare les éléments, propose un compagnon et une date
 * seulement si elle était écrite, puis on confirme avant tout enregistrement.
 * Tout est rangé dans les structures déjà existantes : tâches, rendez-vous, notes.
 */
const KIND_LABEL: Record<DumpItem["kind"], string> = {
  tache: "Tâche",
  rdv: "Rendez-vous",
  note: "À garder",
};

const ViderMaTete = () => {
  const navigate = useNavigate();
  const { state } = usePulseState();
  const [text, setText] = useState("");
  const [items, setItems] = useState<DumpItem[] | null>(null);
  const [saving, setSaving] = useState(false);
  const [people, setPeople] = useState<FamilyPerson[]>([]);

  const dictation = useVoiceDictation({
    onDone: (spoken) =>
      setText((prev) => (prev.trim() ? `${prev.replace(/\n+$/, "")}\n${spoken}` : spoken)),
    onError: (message) => toast({ description: message }),
  });

  useEffect(() => {
    (async () => {
      const { data: auth } = await supabase.auth.getUser();
      const uid = auth.user?.id;
      if (!uid) return;
      const { data } = await supabase
        .from("family_medical_profiles")
        .select("id, first_name")
        .eq("user_id", uid);
      setPeople((data ?? []) as FamilyPerson[]);
    })();
  }, []);

  const calm = state === "sature" || state === "ko";

  const organise = () => {
    const parsed = parseBrainDump(text, people);
    if (!parsed.length) {
      toast({ description: "Écris ou dicte au moins une chose, je m'occupe du reste." });
      return;
    }
    navigator.vibrate?.(10);
    setItems(parsed);
  };

  const patch = (key: string, next: Partial<DumpItem>) =>
    setItems((prev) =>
      prev ? prev.map((it) => (it.key === key ? { ...it, ...next, needsDate: next.date ? false : it.needsDate } : it)) : prev,
    );

  const remove = (key: string) =>
    setItems((prev) => (prev ? prev.filter((it) => it.key !== key) : prev));

  const grouped = useMemo(() => {
    if (!items) return [];
    const map = new Map<string, DumpItem[]>();
    for (const it of items) {
      const k = it.domain ?? "autre";
      map.set(k, [...(map.get(k) ?? []), it]);
    }
    return [...map.entries()];
  }, [items]);

  const save = async () => {
    if (!items?.length || saving) return;
    setSaving(true);
    const { data: auth } = await supabase.auth.getUser();
    const uid = auth.user?.id;
    if (!uid) {
      setSaving(false);
      return;
    }

    const tasks = items.filter((i) => i.kind === "tache" || (i.kind === "rdv" && !i.date));
    const rdvs = items.filter((i) => i.kind === "rdv" && i.date);
    const notes = items.filter((i) => i.kind === "note");

    const errors: string[] = [];

    if (tasks.length) {
      const { error } = await supabase.from("todo_items").insert(
        tasks.map((i) => ({
          user_id: uid,
          title: i.title,
          domain: i.domain,
          due_date: i.date,
          profile_id: i.profileId,
        })),
      );
      if (error) errors.push("tâches");
    }

    if (rdvs.length) {
      const { error } = await supabase.from("appointments").insert(
        rdvs.map((i) => ({
          user_id: uid,
          title: i.title,
          appointment_at: new Date(`${i.date}T${i.time ?? "09:00"}:00`).toISOString(),
          domain: i.domain,
          profile_id: i.profileId,
        })),
      );
      if (error) errors.push("rendez-vous");
    }

    if (notes.length) {
      const { error } = await supabase.from("organisation_notes").insert(
        notes.map((i) => ({ user_id: uid, content: i.title, pinned: false })),
      );
      if (error) errors.push("notes");
    }

    // Historique discret : le vrac d'origine, retrouvable dans les notes.
    await supabase.from("organisation_notes").insert({
      user_id: uid,
      title: "Vidé de ma tête",
      content: text.trim(),
      pinned: false,
    });

    setSaving(false);
    if (errors.length) {
      toast({ description: "Une partie n'a pas pu être enregistrée. On réessaie ?" });
      return;
    }
    navigator.vibrate?.(12);
    toast({
      description:
        items.length > 1
          ? `${items.length} choses sont sorties de ta tête. Elles sont en sécurité.`
          : "C'est sorti de ta tête. C'est en sécurité.",
    });
    navigate("/aujourdhui");
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto w-full max-w-lg px-5 pb-28 pt-8 sm:px-6 sm:pt-10">
        <button
          onClick={() => (items ? setItems(null) : navigate(-1))}
          className="mb-6 flex items-center gap-2 text-sm text-muted-foreground"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={1.75} />
          Retour
        </button>

        {!items ? (
          <>
            <h1 className="font-serif text-3xl text-foreground">Vide ta tête 🧠</h1>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Écris tout comme ça te vient. Pas besoin de trier.
            </p>

            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={9}
              autoFocus
              placeholder="Tout ce que tu dois faire, ne pas oublier, organiser ou simplement sortir de ta tête…"
              className="mt-6 w-full resize-none rounded-[20px] border border-border/70 bg-card px-5 py-4 text-base leading-relaxed text-foreground outline-none placeholder:text-muted-foreground/60 focus:border-primary/50"
            />

            <button
              onClick={dictation.status === "recording" ? dictation.stop : dictation.start}
              disabled={dictation.status === "transcribing"}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-full border border-border/70 px-5 py-3 text-sm font-medium text-foreground transition-transform active:scale-[0.98] disabled:opacity-60"
            >
              {dictation.status === "transcribing" ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.75} />
                  {dictation.partial || "J'écris ce que tu viens de dire…"}
                </>
              ) : dictation.status === "recording" ? (
                <>
                  <Square className="h-3.5 w-3.5" strokeWidth={2.5} />
                  Je t'écoute — appuie pour arrêter
                </>
              ) : (
                <>
                  <Mic className="h-4 w-4" strokeWidth={1.75} />
                  Dicter
                </>
              )}
            </button>

            <button
              onClick={organise}
              disabled={!text.trim()}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-primary px-5 py-3.5 text-sm font-semibold text-primary-foreground transition-transform active:scale-[0.98] disabled:opacity-50"
            >
              <Sparkles className="h-4 w-4" strokeWidth={1.75} />
              Organiser pour moi
              <ArrowRight className="h-4 w-4" strokeWidth={1.75} />
            </button>

            <p className="mt-4 text-center text-xs text-muted-foreground">
              Rien n'est enregistré avant que tu aies validé.
            </p>
          </>
        ) : (
          <>
            <h1 className="font-serif text-3xl text-foreground">J'ai compris ça 👇</h1>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {calm
                ? "Je garde tout. Tu vérifies juste vite, et on s'arrête là."
                : "Vérifie, corrige si besoin, puis j'enregistre au bon endroit."}
            </p>

            <div className="mt-6 space-y-5">
              {grouped.map(([key, list]) => {
                const m = mascotOf(key);
                return (
                  <div key={key}>
                    <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      {m ? `${m.emoji} ${m.label}` : "À ranger"}
                    </p>
                    <ul className="space-y-2">
                      {list.map((it) => (
                        <li
                          key={it.key}
                          className="rounded-[18px] border border-border/60 bg-card px-3 py-3"
                        >
                          <div className="flex items-start gap-2">
                            <MascotPicker
                              value={it.domain}
                              onChange={(d) => patch(it.key, { domain: d as PulseDomain | null })}
                              showLabel={false}
                            />
                            <input
                              value={it.title}
                              onChange={(e) => patch(it.key, { title: e.target.value })}
                              aria-label="Intitulé"
                              className="min-w-0 flex-1 bg-transparent py-1.5 text-sm text-foreground outline-none"
                            />
                            <button
                              onClick={() => remove(it.key)}
                              aria-label="Enlever"
                              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-muted-foreground"
                            >
                              <Trash2 className="h-4 w-4" strokeWidth={1.75} />
                            </button>
                          </div>

                          <div className="mt-2 flex flex-wrap items-center gap-2">
                            <select
                              value={it.kind}
                              onChange={(e) =>
                                patch(it.key, { kind: e.target.value as DumpItem["kind"] })
                              }
                              aria-label="Type"
                              className="rounded-full border border-border/60 bg-transparent px-3 py-1.5 text-xs text-foreground"
                            >
                              {(["tache", "rdv", "note"] as const).map((k) => (
                                <option key={k} value={k}>
                                  {KIND_LABEL[k]}
                                </option>
                              ))}
                            </select>

                            <input
                              type="date"
                              value={it.date ?? ""}
                              onChange={(e) => patch(it.key, { date: e.target.value || null })}
                              aria-label="Date"
                              className="rounded-full border border-border/60 bg-transparent px-3 py-1.5 text-xs text-foreground"
                            />

                            {people.length > 0 && (
                              <select
                                value={it.profileId ?? ""}
                                onChange={(e) => {
                                  const id = e.target.value || null;
                                  patch(it.key, {
                                    profileId: id,
                                    profileName:
                                      people.find((p) => p.id === id)?.first_name ?? null,
                                  });
                                }}
                                aria-label="Pour qui"
                                className="rounded-full border border-border/60 bg-transparent px-3 py-1.5 text-xs text-foreground"
                              >
                                <option value="">Pour moi</option>
                                {people.map((p) => (
                                  <option key={p.id} value={p.id}>
                                    Pour {p.first_name}
                                  </option>
                                ))}
                              </select>
                            )}
                          </div>

                          {it.date ? (
                            <p className="mt-2 text-xs text-muted-foreground">
                              {prettyDate(it.date, it.time)}
                            </p>
                          ) : it.needsDate ? (
                            <p className="mt-2 text-xs text-foreground/80">
                              Tu veux que je l'ajoute comme rendez-vous ? Il me manque la date.
                            </p>
                          ) : null}
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>

            <button
              onClick={save}
              disabled={!items.length || saving}
              className="mt-7 flex w-full items-center justify-center gap-2 rounded-full bg-primary px-5 py-3.5 text-sm font-semibold text-primary-foreground transition-transform active:scale-[0.98] disabled:opacity-50"
            >
              <Check className="h-4 w-4" strokeWidth={2} />
              {saving ? "J'enregistre…" : "C'est bon, j'enregistre"}
            </button>

            <p className="mt-4 text-center text-xs text-muted-foreground">
              Rien ne sera perdu. Tu retrouveras tout dans tes tâches et ton agenda.
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default ViderMaTete;
