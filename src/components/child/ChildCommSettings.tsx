import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import {
  ANSWER_PREFS, COMMUNICATION_MODES, PICTO_MODES, QUESTION_PREFS, ageLabel, presentationFor, type ChildComm,
} from "@/lib/childAdapt";

const toggle = (arr: string[], v: string) => (arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);

const Chip = ({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) => (
  <button
    type="button"
    onClick={onClick}
    aria-pressed={on}
    className={`rounded-2xl border px-3 py-2 text-left text-xs font-medium leading-snug transition-colors ${
      on ? "border-primary/60 bg-secondary/60 text-foreground" : "border-border/70 bg-card text-muted-foreground"
    }`}
  >
    {children}
  </button>
);

/** « Comment communiquer avec moi ? » — sert à adapter l'interface, jamais à évaluer. */
const ChildCommSettings = ({ child, onSaved }: { child: ChildComm; onSaved: () => void }) => {
  const [f, setF] = useState({
    nickname: child.nickname ?? "",
    communication_modes: child.communication_modes ?? [],
    question_prefs: child.question_prefs ?? [],
    answer_prefs: child.answer_prefs ?? [],
    picto_mode: child.picto_mode ?? "parfois",
    picto_show_text: child.picto_show_text ?? true,
    max_choices: child.max_choices ?? null,
  });
  const [saving, setSaving] = useState(false);
  const pres = presentationFor({ ...child, ...f });
  const age = ageLabel(child.birth_date);

  const save = async () => {
    setSaving(true);
    const { error } = await supabase
      .from("family_medical_profiles")
      .update({ ...f, nickname: f.nickname.trim() || null })
      .eq("id", child.id);
    setSaving(false);
    toast({ description: error ? "Enregistrement impossible." : "C'est noté.", variant: error ? "destructive" : undefined });
    if (!error) onSaved();
  };

  return (
    <div className="space-y-5 pt-2">
      <p className="text-xs leading-relaxed text-muted-foreground">
        Ces réglages servent seulement à adapter Éclosia à {child.first_name}. Ce n'est pas une évaluation.
        {age && ` Âge calculé automatiquement : ${age}.`}
      </p>

      <div>
        <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Surnom (facultatif)</p>
        <Input value={f.nickname} onChange={(e) => setF({ ...f, nickname: e.target.value })} className="text-sm" />
      </div>

      <div>
        <p className="mb-2 text-sm font-semibold text-foreground">Comment communiquer avec moi ?</p>
        <div className="grid grid-cols-1 gap-2">
          {COMMUNICATION_MODES.map((m) => (
            <Chip key={m.id} on={f.communication_modes.includes(m.id)} onClick={() => setF({ ...f, communication_modes: toggle(f.communication_modes, m.id) })}>
              {m.emoji} {m.label}
            </Chip>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-2 text-sm font-semibold text-foreground">Comment dois-je te poser les questions ?</p>
        <div className="grid grid-cols-2 gap-2">
          {QUESTION_PREFS.map((m) => (
            <Chip key={m.id} on={f.question_prefs.includes(m.id)} onClick={() => setF({ ...f, question_prefs: toggle(f.question_prefs, m.id) })}>
              {m.label}
            </Chip>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-2 text-sm font-semibold text-foreground">Comment préfères-tu répondre ?</p>
        <div className="grid grid-cols-2 gap-2">
          {ANSWER_PREFS.map((m) => (
            <Chip key={m.id} on={f.answer_prefs.includes(m.id)} onClick={() => setF({ ...f, answer_prefs: toggle(f.answer_prefs, m.id) })}>
              {m.emoji} {m.label}
            </Chip>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-2 text-sm font-semibold text-foreground">Utiliser les pictogrammes</p>
        <div className="grid grid-cols-4 gap-2">
          {PICTO_MODES.map((m) => (
            <Chip key={m.id} on={f.picto_mode === m.id} onClick={() => setF({ ...f, picto_mode: m.id })}>
              {m.label}
            </Chip>
          ))}
        </div>
        <label className="mt-3 flex items-center gap-2 text-xs text-foreground">
          <input type="checkbox" checked={f.picto_show_text} onChange={(e) => setF({ ...f, picto_show_text: e.target.checked })} />
          Afficher le texte avec les pictogrammes
        </label>
      </div>

      <div>
        <p className="mb-2 text-sm font-semibold text-foreground">Nombre de choix affichés</p>
        <div className="grid grid-cols-5 gap-2">
          {[null, 2, 3, 4, 6].map((n) => (
            <Chip key={String(n)} on={f.max_choices === n} onClick={() => setF({ ...f, max_choices: n })}>
              {n === null ? "Auto" : n}
            </Chip>
          ))}
        </div>
        <p className="mt-2 text-[11px] text-muted-foreground">
          Aperçu : {pres.visual ? "interface visuelle" : "interface texte"}, {pres.maxChoices} choix maximum
          {pres.audio ? ", lecture audio" : ""}.
        </p>
      </div>

      <Button onClick={save} disabled={saving} className="w-full">Enregistrer</Button>
    </div>
  );
};

export default ChildCommSettings;
