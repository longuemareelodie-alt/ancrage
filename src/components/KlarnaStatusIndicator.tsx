import { useEffect, useState } from "react";
import { CheckCircle2, XCircle, Loader2, ChevronDown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { PREMIUM_PRICE_EUR } from "@/lib/premiumOffer";

type MethodInfo = { id: string; description: string };
type Result = {
  mode?: "live" | "test";
  klarnaAvailable: boolean;
  klarnaIds: string[];
  methods: MethodInfo[];
};

/**
 * Bandeau de diagnostic Klarna :
 * - interroge Mollie au montage (méthodes activées pour le montant Premium)
 * - affiche un état très clair AVANT le clic « Payer » :
 *   vert si Klarna sera proposé, rouge sinon, ambre pendant la vérif.
 */
const KlarnaStatusIndicator = () => {
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        if (!sessionData.session) {
          if (!cancelled) setHidden(true);
          return;
        }
        const amount = PREMIUM_PRICE_EUR.toFixed(2);
        const { data, error } = await supabase.functions.invoke(
          `check-mollie-methods?amount=${amount}`,
          { method: "GET" },
        );
        if (cancelled) return;
        if (error) setHidden(true);
        else setResult(data as Result);
      } catch {
        if (!cancelled) setHidden(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (hidden) return null;


  // Styles selon état
  const tone = loading
    ? {
        wrap: "border-amber-300 bg-amber-50 text-amber-900",
        icon: <Loader2 className="h-5 w-5 animate-spin" />,
        title: "Vérification de Klarna…",
        sub: "On interroge Mollie pour confirmer.",
      }
    : error
      ? {
          wrap: "border-destructive/40 bg-destructive/10 text-destructive",
          icon: <XCircle className="h-5 w-5" />,
          title: "Impossible de vérifier Klarna",
          sub: error,
        }
      : result?.klarnaAvailable
        ? {
            wrap: "border-emerald-300 bg-emerald-50 text-emerald-900",
            icon: <CheckCircle2 className="h-5 w-5" />,
            title: "Klarna sera proposé au checkout ✅",
            sub: "Tu pourras choisir Klarna sur la page de paiement Mollie.",
          }
        : {
            wrap: "border-destructive/40 bg-destructive/10 text-destructive",
            icon: <XCircle className="h-5 w-5" />,
            title: "Klarna NON proposé au checkout",
            sub: "Utilise le bouton « Payer avec Klarna » dédié (qui force la méthode).",
          };

  return (
    <div className={`rounded-xl border p-3 text-sm ${tone.wrap}`}>
      <div className="flex items-start gap-3">
        <span className="mt-0.5 shrink-0">{tone.icon}</span>
        <div className="min-w-0 flex-1">
          <p className="font-semibold leading-tight">{tone.title}</p>
          <p className="mt-0.5 text-xs opacity-80">{tone.sub}</p>
        </div>
        {result && (
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="shrink-0 text-xs uppercase tracking-wide opacity-70 hover:opacity-100"
            aria-label="Détails"
          >
            <ChevronDown
              className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`}
            />
          </button>
        )}
      </div>

      {open && result && (
        <div className="mt-3 space-y-1 border-t border-current/20 pt-2 text-xs opacity-90">
          <p>
            <span className="font-medium">Mode :</span> {result.mode}
          </p>
          <p>
            <span className="font-medium">Klarna IDs :</span>{" "}
            {result.klarnaIds.length ? result.klarnaIds.join(", ") : "—"}
          </p>
          <p className="font-medium">Méthodes actives ({result.methods.length}) :</p>
          <ul className="ml-3 list-disc">
            {result.methods.map((m) => (
              <li key={m.id}>
                <span className="font-mono">{m.id}</span> — {m.description}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default KlarnaStatusIndicator;
