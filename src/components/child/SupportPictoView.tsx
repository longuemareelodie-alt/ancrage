import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PICTOGRAMS } from "@/data/pictograms";
import { presentationFor, type ChildComm } from "@/lib/childAdapt";
import { speakFr } from "@/components/child/PictoChoice";

const norm = (v: string) => v.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

const EXTRA: [RegExp, string][] = [
  [/dent|brosse/, "🪥"], [/habill|vetement|pull|pantalon/, "👕"], [/chaussure|basket/, "👟"], [/manteau|veste/, "🧥"],
  [/petit.?dej|dejeuner|diner|repas|manger|gouter/, "🍽️"], [/douche|bain|laver|savon/, "🧼"], [/lit|dormir|coucher|sieste/, "🛌"],
  [/cartable|sac|ecole/, "🎒"], [/toilette|pipi|wc/, "🚽"], [/main/, "🙌"], [/livre|lire|histoire/, "📖"], [/ecran|tele|tablette/, "📺"],
  [/jouer|jeu|jouet/, "🧸"], [/voiture/, "🚗"], [/ranger/, "🧹"], [/boire|eau/, "🥤"], [/calme|respir/, "🤫"], [/calin/, "🤗"],
];

/** Pictogramme deviné à partir du libellé de l'étape (mots-clés, sans IA). */
export function guessEmoji(label: string): string {
  const t = norm(label);
  for (const [re, e] of EXTRA) if (re.test(t)) return e;
  const p = PICTOGRAMS.find((x) => x.category !== "reponses" && t.includes(norm(x.label)));
  return p?.emoji ?? "⭐";
}

type Props = { items: { label: string; time?: string }[]; profileId: string | null };

/** Séquence visuelle : une étape par carte, pictogramme + texte, lecture audio, adaptée au profil. */
const SupportPictoView = ({ items, profileId }: Props) => {
  const [child, setChild] = useState<ChildComm | null>(null);
  const [done, setDone] = useState<number[]>([]);
  const [photos, setPhotos] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!profileId) return setChild(null);
    supabase
      .from("family_medical_profiles")
      .select("id, first_name, nickname, birth_date, communication_modes, question_prefs, answer_prefs, picto_mode, picto_show_text, max_choices")
      .eq("id", profileId)
      .maybeSingle()
      .then(({ data }) => setChild(data as ChildComm | null));
  }, [profileId]);

  useEffect(() => {
    if (!profileId) return;
    import("@/lib/childPhotos").then(({ loadChildPhotos }) => loadChildPhotos(profileId).then(setPhotos));
  }, [profileId]);

  const pres = { ...presentationFor(child), visual: true };
  const steps = items.filter((i) => i.label.trim());

  return (
    <div className="space-y-2">
      {steps.map((s, i) => {
        const photo = Object.entries(photos).find(([k]) => norm(s.label).includes(norm(k.split(":")[1] ?? "")))?.[1];
        const on = done.includes(i);
        return (
          <button
            key={i}
            type="button"
            onClick={() => {
              if (pres.audio) speakFr(s.label);
              setDone(on ? done.filter((x) => x !== i) : [...done, i]);
            }}
            className={`flex w-full items-center gap-4 rounded-[22px] border-2 bg-card px-4 text-left ${pres.big ? "py-4" : "py-3"} ${on ? "border-primary bg-secondary/50 opacity-70" : "border-border/70"}`}
          >
            <span className="w-6 text-center text-xs font-semibold text-muted-foreground">{i + 1}</span>
            {photo ? (
              <img src={photo} alt="" className="h-14 w-14 rounded-xl object-cover" />
            ) : (
              <span className={pres.big ? "text-5xl" : "text-3xl"} aria-hidden>{guessEmoji(s.label)}</span>
            )}
            {pres.showText && (
              <span className={`flex-1 font-semibold text-foreground ${pres.big ? "text-base" : "text-sm"}`}>
                {s.time ? `${s.time} · ` : ""}{s.label}
              </span>
            )}
            {on && <span aria-hidden>✓</span>}
          </button>
        );
      })}
    </div>
  );
};

export default SupportPictoView;
