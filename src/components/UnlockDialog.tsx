import { useNavigate } from "react-router-dom";
import { Sparkles } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PREMIUM_PRICE_LONG, PREMIUM_LIFETIME_LABEL } from "@/lib/premiumOffer";

interface UnlockDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Titre personnalisable (par défaut : message bienveillant générique). */
  title?: string;
  /** Description personnalisable. */
  description?: string;
}

/**
 * Popup bienveillant déclenché au clic sur un contenu verrouillé.
 * Renvoie vers /paywall.
 */
const UnlockDialog = ({
  open,
  onOpenChange,
  title = "Ce contenu t'attend de l'autre côté.",
  description,
}: UnlockDialogProps) => {
  const navigate = useNavigate();
  const fullDescription =
    description ??
    `Eclosia complet — ${PREMIUM_PRICE_LONG} · ${PREMIUM_LIFETIME_LABEL}. Pas d'abonnement, jamais.`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm rounded-3xl">
        <DialogHeader className="space-y-3 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
            <Sparkles className="h-7 w-7 text-primary" aria-hidden />
          </div>
          <DialogTitle className="text-lg font-bold leading-snug">
            {title}
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground leading-relaxed">
            {fullDescription}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex flex-col gap-2 sm:flex-col">
          <button
            type="button"
            onClick={() => {
              onOpenChange(false);
              navigate("/paywall");
            }}
            className="w-full rounded-2xl bg-[hsl(270_50%_60%)] px-5 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:opacity-90 active:scale-[0.98]"
          >
            Je déverrouille tout
          </button>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="w-full rounded-2xl border border-border bg-background px-5 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted"
          >
            Plus tard
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UnlockDialog;
