import { Compass, Sparkles } from "lucide-react";
import {
  useTourSettings,
  type TourFrequency,
} from "@/lib/tourSettings";
import { START_TOUR_EVENT } from "@/components/GuidedTour";

const FREQUENCIES: { value: TourFrequency; label: string; hint: string }[] = [
  { value: "once", label: "Une seule fois", hint: "Affichée à la première utilisation" },
  { value: "weekly", label: "Une fois par semaine", hint: "Petit rappel hebdomadaire" },
  { value: "monthly", label: "Une fois par mois", hint: "Rappel mensuel discret" },
  { value: "never", label: "Jamais automatiquement", hint: "Tu la lances quand tu veux" },
];

/**
 * Settings card: control auto-relaunch of the guided tour.
 */
export default function GuidedTourSettings() {
  const [settings, update] = useTourSettings();

  return (
    <div className="space-y-4 rounded-xl bg-card p-5 shadow-sm">
      <div className="flex items-start gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Compass className="h-4 w-4" />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="text-base font-bold text-foreground">Visite guidée</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Choisis si — et à quel rythme — la visite se relance toute seule.
          </p>
        </div>
      </div>

      {/* Auto-relaunch toggle */}
      <label className="flex cursor-pointer items-center justify-between gap-3 rounded-lg border border-border bg-background p-3">
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-semibold text-foreground">
            Relances automatiques
          </span>
          <span className="block text-xs text-muted-foreground">
            Désactive pour ne plus être interrompu·e
          </span>
        </span>
        <span
          role="switch"
          aria-checked={settings.autoEnabled}
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === " " || e.key === "Enter") {
              e.preventDefault();
              update({ autoEnabled: !settings.autoEnabled });
            }
          }}
          onClick={() => update({ autoEnabled: !settings.autoEnabled })}
          className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
            settings.autoEnabled ? "bg-primary" : "bg-muted"
          }`}
        >
          <span
            className={`inline-block h-5 w-5 transform rounded-full bg-card shadow transition-transform ${
              settings.autoEnabled ? "translate-x-5" : "translate-x-0.5"
            }`}
          />
        </span>
      </label>

      {/* Frequency picker */}
      <fieldset
        disabled={!settings.autoEnabled}
        className={`space-y-2 transition-opacity ${
          settings.autoEnabled ? "" : "opacity-50"
        }`}
      >
        <legend className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Quand la relancer ?
        </legend>
        <div className="grid gap-2">
          {FREQUENCIES.map((f) => {
            const active = settings.frequency === f.value;
            return (
              <label
                key={f.value}
                className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors ${
                  active
                    ? "border-primary bg-primary/5"
                    : "border-border bg-background hover:border-primary/40"
                }`}
              >
                <input
                  type="radio"
                  name="tour-frequency"
                  value={f.value}
                  checked={active}
                  onChange={() => update({ frequency: f.value })}
                  className="mt-0.5 h-4 w-4 accent-primary"
                />
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold text-foreground">
                    {f.label}
                  </span>
                  <span className="block text-xs text-muted-foreground">{f.hint}</span>
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>

      {/* Manual relaunch */}
      <button
        type="button"
        onClick={() =>
          window.dispatchEvent(new CustomEvent(START_TOUR_EVENT))
        }
        className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.01] focus:outline-none focus-visible:ring-4 focus-visible:ring-primary/40"
      >
        <Sparkles className="h-4 w-4" />
        Refaire la visite maintenant
      </button>
    </div>
  );
}
