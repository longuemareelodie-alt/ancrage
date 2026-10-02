import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import HubShell from "@/components/hub/HubShell";
import { Button } from "@/components/ui/button";
import PictoChoice, { SpeakLine, speakFr } from "@/components/child/PictoChoice";
import { CATEGORY_LABEL, PICTOGRAMS, picto, type PictoCategory } from "@/data/pictograms";
import { loadChildPhotos } from "@/lib/childPhotos";
import { presentationFor, type ChildComm } from "@/lib/childAdapt";

const CATS: PictoCategory[] = ["besoins", "actions", "lieux", "personnes", "emotions"];

/** « Tu préfères quoi ? » — 2 choix pour un enfant qui a besoin de simplicité, 4 au maximum. */
const ChoixVisuel = () => {
  const [params] = useSearchParams();
  const [children, setChildren] = useState<ChildComm[]>([]);
  const [childId, setChildId] = useState<string | null>(params.get("enfant"));
  const [cat, setCat] = useState<PictoCategory>("besoins");
  const [picked, setPicked] = useState<string[]>([]);
  const [show, setShow] = useState(false);
  const [choice, setChoice] = useState<string | null>(null);
  const [photos, setPhotos] = useState<Record<string, string>>({});

  useEffect(() => {
    supabase
      .from("family_medical_profiles")
      .select("id, first_name, nickname, birth_date, communication_modes, question_prefs, answer_prefs, picto_mode, picto_show_text, max_choices")
      .order("created_at")
      .then(({ data }) => setChildren((data ?? []) as ChildComm[]));
  }, []);
  useEffect(() => { if (childId) loadChildPhotos(childId).then(setPhotos); }, [childId]);

  const child = children.find((c) => c.id === childId) ?? null;
  const pres = useMemo(() => ({ ...presentationFor(child), visual: true }), [child]);
  const max = pres.short ? 2 : Math.min(4, pres.maxChoices);

  const toggle = (k: string) =>
    setPicked((p) => (p.includes(k) ? p.filter((x) => x !== k) : p.length >= max ? p : [...p, k]));

  if (show) {
    return (
      <HubShell title="Tu préfères quoi ?" subtitle={child ? `Pour ${child.nickname || child.first_name}` : undefined}>
        <div className="flex justify-end"><SpeakLine text="Tu préfères quoi ?" /></div>
        <PictoChoice keys={picked} pres={{ ...pres, big: true }} photos={photos} selected={choice ? [choice] : []}
          onPick={(k) => { setChoice(k); speakFr(picto(k).label); }} />
        {choice && <p className="text-center text-base font-semibold text-foreground">Tu as choisi : {picto(choice).label}</p>}
        <Button variant="outline" className="w-full" onClick={() => { setShow(false); setChoice(null); }}>Changer les choix</Button>
      </HubShell>
    );
  }

  return (
    <HubShell title="Tu préfères quoi ?" subtitle="Montre 2 à 4 images. L'enfant choisit en touchant.">
      <div className="flex flex-wrap gap-2">
        {children.map((c) => (
          <button key={c.id} onClick={() => { setChildId(c.id); setPicked([]); }}
            className={`rounded-full border px-4 py-1.5 text-xs font-medium ${c.id === childId ? "border-primary/60 bg-secondary/60 text-foreground" : "border-border/70 text-muted-foreground"}`}>
            {c.nickname || c.first_name}
          </button>
        ))}
      </div>
      <p className="text-xs text-muted-foreground">{max} choix maximum{child ? ` pour ${child.nickname || child.first_name}` : ""}. Sélectionnés : {picked.length}</p>
      <div className="-mx-1 flex gap-1 overflow-x-auto">
        {CATS.map((c) => (
          <button key={c} onClick={() => setCat(c)}
            className={`shrink-0 rounded-full border px-3 py-1 text-xs ${cat === c ? "border-primary/60 bg-secondary/60 text-foreground" : "border-border/70 text-muted-foreground"}`}>
            {CATEGORY_LABEL[c]}
          </button>
        ))}
      </div>
      <PictoChoice keys={PICTOGRAMS.filter((p) => p.category === cat).map((p) => p.key)} pres={{ ...pres, big: false }} photos={photos} selected={picked} onPick={toggle} />
      <Button className="w-full" disabled={picked.length < 2} onClick={() => setShow(true)}>Montrer à l'enfant</Button>
    </HubShell>
  );
};

export default ChoixVisuel;
