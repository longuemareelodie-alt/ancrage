import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Copy, Share2, ArrowLeft, Sparkles, Heart, CheckCircle2, Loader2, FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CURRENT_CONTRACT_VERSION, type ContractStatus } from "@/lib/ambassadorContract";

type Tier = "graine" | "fleur" | "fondatrice";

interface Impact {
  is_ambassador: boolean;
  referral_code?: string;
  current_tier?: Tier;
  current_rate?: number;
  mamans_accompagnees?: number;
  total_earned_cents?: number;
  pending_cents?: number;
  next_tier?: Tier | null;
  next_threshold?: number | null;
  has_iban?: boolean;
  joined_at?: string;
}

const TIER_META: Record<Tier, { emoji: string; label: string; subtitle: string; gradient: string }> = {
  graine: {
    emoji: "🌱",
    label: "Cercle Graine",
    subtitle: "Tu sèmes les premières graines.",
    gradient: "from-sage/40 via-sage/20 to-secondary/30",
  },
  fleur: {
    emoji: "🌸",
    label: "Cercle Fleur",
    subtitle: "Ton chemin éclot et inspire.",
    gradient: "from-secondary/60 via-secondary/30 to-sage/30",
  },
  fondatrice: {
    emoji: "💛",
    label: "Cercle Fondatrice",
    subtitle: "Tu fais grandir Eclosia avec nous.",
    gradient: "from-amber-200/70 via-secondary/40 to-sage/30",
  },
};

const formatEuros = (cents: number) => `${(cents / 100).toFixed(2).replace(".", ",")} €`;

export default function MonImpact() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [impact, setImpact] = useState<Impact | null>(null);
  const [contract, setContract] = useState<ContractStatus | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const [impactRes, contractRes] = await Promise.all([
      supabase.rpc("get_my_ambassador_impact"),
      supabase.rpc("get_my_contract_status"),
    ]);
    if (impactRes.error) {
      console.error(impactRes.error);
      toast.error("Impossible de charger ton impact.");
    } else {
      setImpact(impactRes.data as unknown as Impact);
    }
    if (!contractRes.error) {
      setContract(contractRes.data as unknown as ContractStatus);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (user) load();
  }, [user]);

  const goToContract = () => navigate("/ambassadrice/contrat");

  const contractOutdated =
    contract?.accepted && contract.version !== CURRENT_CONTRACT_VERSION;

  const referralUrl =
    impact?.referral_code && typeof window !== "undefined"
      ? `${window.location.origin}/?ref=${impact.referral_code}`
      : "";

  const copyLink = async () => {
    if (!referralUrl) return;
    await navigator.clipboard.writeText(referralUrl);
    toast.success("Lien copié");
  };

  const share = async () => {
    if (!referralUrl) return;
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Eclosia",
          text:
            "Je t'ouvre la porte d'Eclosia, l'app qui m'accompagne chaque jour. Tu veux découvrir ?",
          url: referralUrl,
        });
      } catch {
        /* user cancelled */
      }
    } else {
      copyLink();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Chargement…</div>
      </div>
    );
  }

  // Pas encore ambassadrice : proposer l'activation
  if (!impact?.is_ambassador) {
    return (
      <div className="min-h-screen bg-background pb-24">
        <div className="max-w-2xl mx-auto px-6 pt-8">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6"
          >
            <ArrowLeft className="w-4 h-4" /> Retour
          </Link>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-[2rem] bg-gradient-to-br from-secondary/40 via-secondary/20 to-sage/20 p-8 sm:p-12 shadow-soft text-center"
          >
            <div className="text-5xl mb-4">🌱</div>
            <h1 className="font-serif-display text-3xl sm:text-4xl text-primary-dark mb-3">
              Rejoins le cercle des Ambassadrices
            </h1>
            <p className="text-foreground/80 max-w-md mx-auto mb-8">
              Quand tu partages Eclosia avec une autre maman, tu lui ouvres une porte. Tu reçois
              aussi une part en reconnaissance de ce que tu transmets.
            </p>
            <Button onClick={goToContract} size="lg" className="rounded-full">
              <FileText className="w-4 h-4 mr-2" />
              Lire et accepter le contrat d'affiliation
            </Button>
            <p className="text-xs text-muted-foreground mt-4">
              L'activation se fait en 1 minute après acceptation du contrat.
            </p>
          </motion.div>
        </div>
      </div>
    );
  }

  const tier = (impact.current_tier ?? "graine") as Tier;
  const meta = TIER_META[tier];
  const count = impact.mamans_accompagnees ?? 0;
  const nextThreshold = impact.next_threshold;
  const progressValue = nextThreshold ? Math.min(100, (count / nextThreshold) * 100) : 100;
  const rate = Math.round((impact.current_rate ?? 0) * 100);

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-2xl mx-auto px-6 pt-8 space-y-6">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4" /> Retour
        </Link>

        <header className="text-center">
          <h1 className="font-serif-display text-3xl sm:text-4xl text-primary-dark">
            Mon Impact
          </h1>
          <p className="text-muted-foreground mt-2">
            Chaque maman que tu accompagnes compte vraiment.
          </p>
        </header>

        {contractOutdated && (
          <div className="rounded-2xl bg-amber-50 border border-amber-200 p-4 text-sm flex items-start gap-3">
            <FileText className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="font-medium text-foreground">
                Le contrat d'affiliation a été mis à jour.
              </div>
              <div className="text-muted-foreground mt-1">
                Merci de relire et accepter la nouvelle version pour continuer
                à recevoir tes commissions.
              </div>
              <Button
                size="sm"
                variant="outline"
                className="mt-3 rounded-full"
                onClick={goToContract}
              >
                Mettre à jour mon contrat
              </Button>
            </div>
          </div>
        )}

        {contract?.accepted && !contractOutdated && (
          <div className="text-xs text-muted-foreground text-center">
            <Link
              to="/ambassadrice/contrat"
              className="inline-flex items-center gap-1 hover:text-foreground"
            >
              <FileText className="w-3 h-3" /> Contrat d'affiliation signé le{" "}
              {contract.accepted_at
                ? new Date(contract.accepted_at).toLocaleDateString("fr-FR")
                : ""}
            </Link>
          </div>
        )}



        {/* Carte cercle actuel */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className={`rounded-[2rem] bg-gradient-to-br ${meta.gradient} p-8 shadow-soft text-center`}
        >
          <div className="text-5xl mb-3">{meta.emoji}</div>
          <h2 className="font-serif-display text-2xl text-primary-dark">{meta.label}</h2>
          <p className="text-foreground/70 mt-1">{meta.subtitle}</p>
          <div className="mt-6 inline-flex items-center gap-2 bg-background/70 backdrop-blur px-4 py-2 rounded-full">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">Part actuelle : {rate} %</span>
          </div>
        </motion.section>

        {/* Stats */}
        <section className="grid grid-cols-2 gap-4">
          <div className="rounded-2xl bg-card p-5 shadow-soft">
            <div className="text-sm text-muted-foreground">Mamans accompagnées</div>
            <div className="text-3xl font-serif-display text-primary-dark mt-1">{count}</div>
          </div>
          <div className="rounded-2xl bg-card p-5 shadow-soft">
            <div className="text-sm text-muted-foreground">Total reçu</div>
            <div className="text-3xl font-serif-display text-primary-dark mt-1">
              {formatEuros(impact.total_earned_cents ?? 0)}
            </div>
          </div>
          {(impact.pending_cents ?? 0) > 0 && (
            <div className="col-span-2 rounded-2xl bg-secondary/30 p-4 text-sm text-foreground/80">
              <Heart className="w-4 h-4 inline mr-1 text-primary" />
              {formatEuros(impact.pending_cents ?? 0)} en cours de validation (sous 14 jours).
            </div>
          )}
        </section>

        {/* Progression vers prochain cercle */}
        {nextThreshold && impact.next_tier && (
          <section className="rounded-2xl bg-card p-6 shadow-soft">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="text-sm text-muted-foreground">Prochain cercle</div>
                <div className="font-serif-display text-lg text-primary-dark">
                  {TIER_META[impact.next_tier].emoji} {TIER_META[impact.next_tier].label}
                </div>
              </div>
              <div className="text-sm text-muted-foreground">
                {count} / {nextThreshold}
              </div>
            </div>
            <Progress value={progressValue} className="h-2" />
            <p className="text-xs text-muted-foreground mt-3">
              Encore {Math.max(0, nextThreshold - count)} maman
              {nextThreshold - count > 1 ? "s" : ""} accompagnée
              {nextThreshold - count > 1 ? "s" : ""} pour rejoindre ce cercle.
            </p>
          </section>
        )}

        {/* Lien de partage */}
        <section className="rounded-2xl bg-card p-6 shadow-soft space-y-4">
          <div>
            <div className="text-sm text-muted-foreground mb-2">Ton lien personnel</div>
            <div className="bg-secondary/20 rounded-xl px-4 py-3 text-sm break-all font-mono">
              {referralUrl}
            </div>
          </div>
          <div className="flex gap-3">
            <Button onClick={copyLink} variant="outline" className="flex-1 rounded-full">
              <Copy className="w-4 h-4 mr-2" /> Copier
            </Button>
            <Button onClick={share} className="flex-1 rounded-full">
              <Share2 className="w-4 h-4 mr-2" /> Partager
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Quand une maman rejoint Eclosia via ton lien dans les 90 jours, ta contribution est
            comptabilisée automatiquement.
          </p>
        </section>

        <IbanSection hasIban={!!impact.has_iban} onSaved={load} />
      </div>
    </div>
  );
}

function IbanSection({ hasIban, onSaved }: { hasIban: boolean; onSaved: () => void }) {
  const [editing, setEditing] = useState(!hasIban);
  const [iban, setIban] = useState("");
  const [holder, setHolder] = useState("");
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!iban.trim() || !holder.trim()) {
      toast.error("Renseigne ton IBAN et le nom du titulaire.");
      return;
    }
    setSaving(true);
    const { error } = await supabase.rpc("set_my_iban", {
      _iban: iban,
      _holder_name: holder,
    });
    setSaving(false);
    if (error) {
      toast.error(
        error.message?.includes("Invalid IBAN")
          ? "Format d'IBAN invalide. Vérifie qu'il commence par 2 lettres (ex: FR76...)."
          : "Impossible d'enregistrer ton IBAN.",
      );
      return;
    }
    toast.success("IBAN enregistré 🌸");
    setIban("");
    setEditing(false);
    onSaved();
  };

  if (hasIban && !editing) {
    return (
      <section className="rounded-2xl bg-sage/15 border border-sage/30 p-5 text-sm">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-foreground">
            <CheckCircle2 className="w-4 h-4 text-sage" />
            <span>Ton IBAN est enregistré. Les virements sont effectués chaque 1<sup>er</sup> du mois (seuil : 20 €).</span>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setEditing(true)}>
            Modifier
          </Button>
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-2xl bg-card p-6 shadow-soft space-y-4">
      <div>
        <h3 className="font-serif-display text-lg text-primary-dark">Recevoir tes contributions</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Renseigne ton IBAN une seule fois. Tes commissions validées de plus de 20 € sont virées
          automatiquement le 1<sup>er</sup> du mois.
        </p>
      </div>
      <div className="space-y-3">
        <div>
          <Label htmlFor="holder">Nom du titulaire du compte</Label>
          <Input
            id="holder"
            value={holder}
            onChange={(e) => setHolder(e.target.value)}
            placeholder="Marie Dupont"
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="iban">IBAN</Label>
          <Input
            id="iban"
            value={iban}
            onChange={(e) => setIban(e.target.value.toUpperCase())}
            placeholder="FR76 1234 5678 9012 3456 7890 123"
            className="mt-1 font-mono"
            autoComplete="off"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Seul toi peux le voir. Il est utilisé uniquement pour te virer tes contributions.
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={save} disabled={saving} className="rounded-full">
            {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
            Enregistrer
          </Button>
          {hasIban && (
            <Button variant="ghost" onClick={() => setEditing(false)} disabled={saving}>
              Annuler
            </Button>
          )}
        </div>
      </div>
    </section>
  );
}
