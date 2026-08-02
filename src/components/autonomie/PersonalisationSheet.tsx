import { useEffect, useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import {
  AGE_BANDS,
  CONTEXTS,
  LANGUAGE_LEVELS,
  OBJECTIVES,
  Personalisation,
  softHaptic,
} from "@/lib/supportPersonalisation";
import { Loader2, Sparkles } from "lucide-react";

type Profile = { id: string; first_name: string; birth_date?: string | null };

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  label: string;
  profiles: Profile[];
  value: Personalisation;
  loading?: boolean;
  onConfirm: (p: Personalisation) => void;
};

const Chips = ({
  title,
  options,
  value,
  onChange,
}: {
  title: string;
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) => (
  <div>
    <p className="pb-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
      {title}
    </p>
    <div className="flex flex-wrap gap-2">
      {options.map((o) => (
        <button
          key={o}
          type="button"
          onClick={() => {
            softHaptic();
            onChange(value === o ? "" : o);
          }}
          className={`rounded-full border px-3.5 py-2 text-xs font-medium transition-all active:scale-[0.97] ${
            value === o
              ? "border-primary/40 bg-primary/10 text-foreground"
              : "border-border/70 bg-card text-muted-foreground"
          }`}
        >
          {o}
        </button>
      ))}
    </div>
  </div>
);

/**
 * Avant de créer : quatre questions douces, toutes facultatives.
 * Le parent peut valider immédiatement — rien ici n'est un formulaire obligatoire.
 */
const PersonalisationSheet = ({
  open,
  onOpenChange,
  label,
  profiles,
  value,
  loading,
  onConfirm,
}: Props) => {
  const [draft, setDraft] = useState<Personalisation>(value);

  useEffect(() => {
    if (open) setDraft(value);
  }, [open, value]);

  const set = (patch: Partial<Personalisation>) => setDraft((d) => ({ ...d, ...patch }));

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="max-h-[88vh] overflow-y-auto rounded-t-[28px] border-border/70 px-5 pb-8"
      >
        <SheetHeader className="pb-2 text-left">
          <SheetTitle className="font-serif text-xl font-semibold text-foreground">
            {label}
          </SheetTitle>
          <p className="text-xs leading-relaxed text-muted-foreground">
            Quelques repères pour que ce support lui aille bien. Tu peux tout passer.
          </p>
        </SheetHeader>

        <div className="space-y-5 pt-2">
          {profiles.length > 0 && (
            <div>
              <p className="pb-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                Pour qui ?
              </p>
              <div className="flex flex-wrap gap-2">
                {profiles.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      softHaptic();
                      set({ childId: draft.childId === p.id ? null : p.id });
                    }}
                    className={`rounded-full border px-3.5 py-2 text-xs font-medium transition-all active:scale-[0.97] ${
                      draft.childId === p.id
                        ? "border-primary/40 bg-primary/10 text-foreground"
                        : "border-border/70 bg-card text-muted-foreground"
                    }`}
                  >
                    {p.first_name}
                  </button>
                ))}
              </div>
            </div>
          )}

          <Chips
            title="Quel âge ?"
            options={AGE_BANDS}
            value={draft.ageBand}
            onChange={(v) => set({ ageBand: v })}
          />
          <Chips
            title="Où en est-il avec les mots ?"
            options={LANGUAGE_LEVELS}
            value={draft.language}
            onChange={(v) => set({ language: v })}
          />
          <Chips
            title="Quel objectif ?"
            options={OBJECTIVES}
            value={draft.objective}
            onChange={(v) => set({ objective: v })}
          />
          <Chips
            title="Quel moment ?"
            options={CONTEXTS}
            value={draft.context}
            onChange={(v) => set({ context: v })}
          />
        </div>

        <button
          onClick={() => {
            softHaptic([10, 30, 10]);
            onConfirm(draft);
          }}
          disabled={loading}
          className="mt-7 flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-5 py-4 text-sm font-semibold text-primary-foreground transition-transform active:scale-[0.98] disabled:opacity-60"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2} /> Je prépare…
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" strokeWidth={1.75} /> Créer mon support
            </>
          )}
        </button>
      </SheetContent>
    </Sheet>
  );
};

export default PersonalisationSheet;
