import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { picto } from "@/data/pictograms";
import { loadChildPhotos, removeChildPhoto, setChildPhoto } from "@/lib/childPhotos";
import { toast } from "@/hooks/use-toast";

const KEYS = [
  "besoins:doudou", "lieux:maison", "lieux:ecole", "lieux:hopital", "personnes:maman", "personnes:papa",
  "personnes:soeur", "personnes:frere", "personnes:professeur", "personnes:medecin", "lieux:voiture", "lieux:parc",
];

/** Le vrai doudou, la vraie école : une photo remplace le pictogramme pour cet enfant. */
const ChildPhotos = ({ profileId }: { profileId: string }) => {
  const [photos, setPhotos] = useState<Record<string, string>>({});
  const [target, setTarget] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const input = useRef<HTMLInputElement>(null);

  const reload = () => loadChildPhotos(profileId).then(setPhotos);
  useEffect(() => { reload(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [profileId]);

  const onFile = async (f?: File) => {
    if (!f || !target) return;
    setBusy(true);
    try {
      await setChildPhoto(profileId, target, f);
      await reload();
    } catch {
      toast({ description: "Photo impossible à ajouter.", variant: "destructive" });
    }
    setBusy(false);
    setTarget(null);
  };

  return (
    <div>
      <p className="mb-1 text-sm font-semibold text-foreground">Mes photos</p>
      <p className="mb-2 text-[11px] text-muted-foreground">Touche une case pour mettre une vraie photo. Elles restent privées.</p>
      <input ref={input} type="file" accept="image/*" className="hidden" onChange={(e) => { onFile(e.target.files?.[0]); e.target.value = ""; }} />
      <div className="grid grid-cols-4 gap-2">
        {KEYS.map((k) => {
          const p = picto(k);
          return (
            <div key={k} className="relative">
              <button
                type="button"
                disabled={busy}
                onClick={() => { setTarget(k); input.current?.click(); }}
                className="flex aspect-square w-full flex-col items-center justify-center gap-1 overflow-hidden rounded-2xl border border-border/70 bg-card text-center"
              >
                {photos[k] ? <img src={photos[k]} alt={p.label} className="h-full w-full object-cover" /> : <span className="text-2xl" aria-hidden>{p.emoji}</span>}
                {!photos[k] && <span className="px-1 text-[10px] font-medium leading-tight text-muted-foreground">{p.label}</span>}
              </button>
              {photos[k] && (
                <button
                  type="button"
                  aria-label={`Retirer la photo ${p.label}`}
                  onClick={async () => { await removeChildPhoto(profileId, k); reload(); }}
                  className="absolute -right-1 -top-1 rounded-full border border-border bg-card p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ChildPhotos;
