import { useCallback, useEffect, useState } from "react";
import { Bell, BellOff, Moon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { confirmSoft, gentleError, haptic } from "@/lib/feedback";
import SoftLoading from "@/components/SoftLoading";

type Prefs = {
  routine_reminders: boolean;
  emotion_reminders: boolean;
  morning_time: string;
  evening_time: string;
  quiet_start: string;
  quiet_end: string;
  max_per_day: number;
  timezone: string;
};

const DEFAULTS: Prefs = {
  routine_reminders: true,
  emotion_reminders: true,
  morning_time: "08:30",
  evening_time: "20:30",
  quiet_start: "21:30",
  quiet_end: "07:30",
  max_per_day: 2,
  timezone: "Europe/Paris",
};

/** `08:30:00` → `08:30` (l'input time n'accepte pas les secondes ici). */
const hhmm = (v: string | null | undefined, fallback: string) =>
  v ? v.slice(0, 5) : fallback;

/**
 * Rappels doux — le parent décide de tout : ce qu'il reçoit, à quelle heure,
 * et quand Éclosia se tait complètement.
 */
const NotificationPreferences = () => {
  const { user } = useAuth();
  const { isSupported, isSubscribed, subscribe, unsubscribe, loading: pushLoading } =
    usePushNotifications();
  const [prefs, setPrefs] = useState<Prefs>(DEFAULTS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    let active = true;
    (async () => {
      const { data } = await supabase
        .from("notification_preferences")
        .select(
          "routine_reminders, emotion_reminders, morning_time, evening_time, quiet_start, quiet_end, max_per_day, timezone",
        )
        .eq("user_id", user.id)
        .maybeSingle();
      if (!active) return;
      if (data) {
        setPrefs({
          routine_reminders: data.routine_reminders,
          emotion_reminders: data.emotion_reminders,
          morning_time: hhmm(data.morning_time, DEFAULTS.morning_time),
          evening_time: hhmm(data.evening_time, DEFAULTS.evening_time),
          quiet_start: hhmm(data.quiet_start, DEFAULTS.quiet_start),
          quiet_end: hhmm(data.quiet_end, DEFAULTS.quiet_end),
          max_per_day: data.max_per_day,
          timezone: data.timezone,
        });
      }
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [user]);

  const save = useCallback(
    async (patch: Partial<Prefs>) => {
      const next = { ...prefs, ...patch };
      setPrefs(next);
      if (!user) return;
      const timezone =
        Intl.DateTimeFormat().resolvedOptions().timeZone || next.timezone;
      const { error } = await supabase.from("notification_preferences").upsert(
        { user_id: user.id, ...next, timezone },
        { onConflict: "user_id" },
      );
      if (error) {
        gentleError("Le réglage n'a pas été enregistré");
        return;
      }
      confirmSoft("C'est noté 🌸");
    },
    [prefs, user],
  );

  const togglePush = async () => {
    haptic("light");
    if (isSubscribed) {
      await unsubscribe();
      confirmSoft("Rappels mis en pause 💛", "Tu peux les réactiver quand tu veux.");
    } else {
      const ok = await subscribe();
      if (ok) confirmSoft("Rappels activés 🌸", "Toujours doux, jamais insistants.");
      else gentleError("Les rappels n'ont pas pu être activés");
    }
  };

  if (loading) return <SoftLoading count={1} label="Chargement de tes rappels" />;

  return (
    <section className="rounded-3xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Bell className="h-5 w-5" aria-hidden="true" />
        </span>
        <div>
          <h2 className="font-serif text-lg text-foreground">Rappels doux</h2>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
            Deux rappels par jour au maximum, jamais pendant ta plage de silence.
            Tu peux tout couper en un geste.
          </p>
        </div>
      </div>

      {/* Interrupteur principal (autorisation appareil) */}
      {isSupported && (
        <button
          type="button"
          onClick={togglePush}
          disabled={pushLoading}
          className="calm-press mt-5 flex min-h-11 w-full items-center justify-between gap-3 rounded-2xl border-2 border-border bg-background px-4 py-3 text-left disabled:opacity-60"
        >
          <span className="flex items-center gap-2 text-sm font-medium text-foreground">
            {isSubscribed ? (
              <Bell className="h-4 w-4 text-primary" aria-hidden="true" />
            ) : (
              <BellOff className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
            )}
            {isSubscribed ? "Rappels activés sur cet appareil" : "Activer les rappels"}
          </span>
          <span className="text-xs text-muted-foreground">
            {isSubscribed ? "Mettre en pause" : "Activer"}
          </span>
        </button>
      )}

      <div className="mt-5 space-y-4">
        <div className="flex items-center justify-between gap-4">
          <Label htmlFor="routine-reminders" className="text-sm font-normal leading-relaxed">
            Rappels de routines
            <span className="block text-xs text-muted-foreground">
              « Tu peux reprendre cette routine quand tu seras prête. »
            </span>
          </Label>
          <Switch
            id="routine-reminders"
            checked={prefs.routine_reminders}
            onCheckedChange={(v) => save({ routine_reminders: v })}
          />
        </div>

        <div className="flex items-center justify-between gap-4">
          <Label htmlFor="emotion-reminders" className="text-sm font-normal leading-relaxed">
            Émotion du jour
            <span className="block text-xs text-muted-foreground">
              Une invitation à déposer ce que tu ressens, sans obligation.
            </span>
          </Label>
          <Switch
            id="emotion-reminders"
            checked={prefs.emotion_reminders}
            onCheckedChange={(v) => save({ emotion_reminders: v })}
          />
        </div>
      </div>

      {/* Horaires */}
      <div className="mt-6 grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="morning-time" className="text-xs text-muted-foreground">
            Le matin, vers
          </Label>
          <input
            id="morning-time"
            type="time"
            value={prefs.morning_time}
            onChange={(e) => save({ morning_time: e.target.value })}
            className="mt-1 min-h-11 w-full rounded-2xl border border-input bg-background px-3 text-sm text-foreground"
          />
        </div>
        <div>
          <Label htmlFor="evening-time" className="text-xs text-muted-foreground">
            Le soir, vers
          </Label>
          <input
            id="evening-time"
            type="time"
            value={prefs.evening_time}
            onChange={(e) => save({ evening_time: e.target.value })}
            className="mt-1 min-h-11 w-full rounded-2xl border border-input bg-background px-3 text-sm text-foreground"
          />
        </div>
      </div>

      {/* Plage de silence */}
      <div className="mt-6 rounded-2xl bg-muted/60 p-4">
        <p className="flex items-center gap-2 text-sm font-medium text-foreground">
          <Moon className="h-4 w-4 text-primary" aria-hidden="true" />
          Plage de silence
        </p>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
          Aucune notification pendant ces heures, même un rappel prévu.
        </p>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="quiet-start" className="text-xs text-muted-foreground">
              À partir de
            </Label>
            <input
              id="quiet-start"
              type="time"
              value={prefs.quiet_start}
              onChange={(e) => save({ quiet_start: e.target.value })}
              className="mt-1 min-h-11 w-full rounded-2xl border border-input bg-background px-3 text-sm text-foreground"
            />
          </div>
          <div>
            <Label htmlFor="quiet-end" className="text-xs text-muted-foreground">
              Jusqu'à
            </Label>
            <input
              id="quiet-end"
              type="time"
              value={prefs.quiet_end}
              onChange={(e) => save({ quiet_end: e.target.value })}
              className="mt-1 min-h-11 w-full rounded-2xl border border-input bg-background px-3 text-sm text-foreground"
            />
          </div>
        </div>
      </div>

      {/* Fréquence maximale */}
      <div className="mt-6">
        <Label htmlFor="max-per-day" className="text-xs text-muted-foreground">
          Au maximum, par jour
        </Label>
        <div
          role="radiogroup"
          aria-label="Nombre maximum de rappels par jour"
          id="max-per-day"
          className="mt-2 grid grid-cols-4 gap-2"
        >
          {[0, 1, 2, 3].map((n) => {
            const active = prefs.max_per_day === n;
            return (
              <button
                key={n}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => save({ max_per_day: n })}
                className={`calm-press min-h-11 rounded-2xl border-2 text-sm font-medium ${
                  active
                    ? "border-primary bg-primary/10 text-foreground"
                    : "border-border bg-background text-muted-foreground"
                }`}
              >
                {n === 0 ? "Aucun" : n}
              </button>
            );
          })}
        </div>
        {prefs.max_per_day === 0 && (
          <p className="mt-2 text-xs text-muted-foreground">
            Éclosia restera silencieuse. Tout reste accessible quand tu ouvres l'app.
          </p>
        )}
      </div>
    </section>
  );
};

export default NotificationPreferences;
