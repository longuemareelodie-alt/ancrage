import { useState } from "react";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useMolliePayment } from "@/hooks/useMolliePayment";
import { toast } from "sonner";

interface Props {
  promoCode?: string | null;
  className?: string;
}

/**
 * Bouton dédié « Payer en plusieurs fois avec Klarna ».
 * Klarna exige une adresse de facturation complète (rue, CP, ville, pays) —
 * on la collecte dans un mini-formulaire, puis on force `method: "klarna"`
 * côté Mollie pour ouvrir directement le checkout Klarna.
 */
const KlarnaPayButton = ({ promoCode = null, className }: Props) => {
  const { startPayment, loading } = useMolliePayment();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    givenName: "",
    familyName: "",
    streetAndNumber: "",
    postalCode: "",
    city: "",
    country: "FR",
  });

  const update = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const required = ["streetAndNumber", "postalCode", "city", "country"] as const;
    if (required.some((k) => !form[k].trim())) {
      toast.error("Merci de remplir adresse, code postal, ville et pays.");
      return;
    }
    await startPayment({
      promoCode,
      method: "klarna",
      billingAddress: {
        givenName: form.givenName.trim() || undefined,
        familyName: form.familyName.trim() || undefined,
        streetAndNumber: form.streetAndNumber.trim(),
        postalCode: form.postalCode.trim(),
        city: form.city.trim(),
        country: form.country.trim().toUpperCase(),
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          className={
            className ??
            "w-full rounded-xl border border-primary/30 bg-background py-3 text-sm font-semibold text-primary hover:bg-primary/5"
          }
        >
          Payer en plusieurs fois avec Klarna
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Payer avec Klarna</DialogTitle>
          <DialogDescription>
            Klarna a besoin de ton adresse de facturation pour proposer le paiement
            en plusieurs fois.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label htmlFor="givenName">Prénom</Label>
              <Input id="givenName" value={form.givenName} onChange={update("givenName")} />
            </div>
            <div>
              <Label htmlFor="familyName">Nom</Label>
              <Input id="familyName" value={form.familyName} onChange={update("familyName")} />
            </div>
          </div>
          <div>
            <Label htmlFor="streetAndNumber">Adresse *</Label>
            <Input
              id="streetAndNumber"
              required
              value={form.streetAndNumber}
              onChange={update("streetAndNumber")}
              placeholder="12 rue des Lilas"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label htmlFor="postalCode">Code postal *</Label>
              <Input id="postalCode" required value={form.postalCode} onChange={update("postalCode")} />
            </div>
            <div>
              <Label htmlFor="city">Ville *</Label>
              <Input id="city" required value={form.city} onChange={update("city")} />
            </div>
          </div>
          <div>
            <Label htmlFor="country">Pays *</Label>
            <Input
              id="country"
              required
              value={form.country}
              onChange={update("country")}
              maxLength={2}
              placeholder="FR"
            />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Redirection…
                </>
              ) : (
                "Continuer vers Klarna"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default KlarnaPayButton;
