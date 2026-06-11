import { useEffect, useState } from "react";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
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
 * Petit badge de diagnostic : interroge Mollie (méthodes activées
 * pour le montant Premium) et affiche si Klarna est proposé au checkout.
 */
const KlarnaStatusIndicator = () => {
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const amount = PREMIUM_PRICE_EUR.toFixed(2);
        const { data, error } = await supabase.functions.invoke(
          `check-mollie-methods?amount=${amount}`,
          { method: "GET" },
        );
        if (cancelled) return;
        if (error) {
          setError(error.message ?? "Erreur");
        } else {
          setResult(data as Result);
        }
      } catch (e) {
        if (!cancelled) setError((e as Error).message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="rounded-xl border border-border bg-card p-3 text-xs">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-2 text-left"
      >
        <span className="flex items-center gap-2 font-medium">
          {loading ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Vérification Klarna…
            </>
          ) : error ? (
            <>
              <XCircle className="h-3.5 w-3.5 text-destructive" />
              Klarna : erreur ({error})
            </>
          ) : result?.klarnaAvailable ? (
            <>
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
              Klarna proposé au checkout
            </>
          ) : (
            <>
              <XCircle className="h-3.5 w-3.5 text-destructive" />
              Klarna NON proposé
            </>
          )}
        </span>
        {result && (
          <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
            {result.mode} · {open ? "−" : "+"}
          </span>
        )}
      </button>

      {open && result && (
        <div className="mt-2 space-y-1 border-t border-border pt-2 text-muted-foreground">
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
