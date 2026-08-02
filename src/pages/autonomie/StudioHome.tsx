import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import HubShell from "@/components/hub/HubShell";
import { SUPPORT_ORDER, SUPPORT_TYPES, SupportType } from "@/data/supportTemplates";
import PersonalisationSheet from "@/components/autonomie/PersonalisationSheet";
import {
  loadPersonalisation,
  Personalisation,
  savePersonalisation,
  softHaptic,
} from "@/lib/supportPersonalisation";
import { cacheSupports, isOffline, readCachedSupports } from "@/lib/supportsCache";
import {
  Sparkles,
  ChevronRight,
  Library,
  Printer,
  Star,
  ShieldAlert,
  FileText,
  WifiOff,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

type Support = {
  id: string;
  title: string;
  support_type: string;
  profile_id: string | null;
  is_favorite: boolean;
};
type Profile = { id: string; first_name: string };

/**
 * Le Studio répond à une seule question : « qu'est-ce que tu veux créer aujourd'hui ? »
 * Ordre volontaire : aider tout de suite → laisser l'assistant faire → créer soi-même → retrouver.
 */
const StudioHome = () => {
  const navigate = useNavigate();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [supports, setSupports] = useState<Support[]>([]);
  const [creating, setCreating] = useState(false);
  const [pending, setPending] = useState<SupportType | null>(null);
  const [perso, setPerso] = useState<Personalisation>(loadPersonalisation);
  const [offline, setOffline] = useState(isOffline());

  useEffect(() => {
    const cached = readCachedSupports();
    if (cached.length) setSupports(cached.filter((s) => !s.archived).slice(0, 4) as Support[]);
    (async () => {
      const [{ data: p }, { data: s }] = await Promise.all([
        supabase.from("family_medical_profiles").select("id, first_name").order("created_at"),
        supabase
          .from("autonomy_supports")
          .select(
            "id, title, support_type, profile_id, is_favorite, archived, updated_at, use_count, content",
          )
          .order("updated_at", { ascending: false })
          .limit(60),
      ]);
      setProfiles(p ?? []);
      if (s) {
        cacheSupports(s as never);
        setSupports((s as unknown as (Support & { archived: boolean })[])
          .filter((x) => !x.archived)
          .slice(0, 4));
      }
      setOffline(isOffline());
      if (p?.length && !loadPersonalisation().childId) {
        setPerso((prev) => ({ ...prev, childId: p[0].id }));
      }
    })();
  }, []);

  const create = async (p: Personalisation) => {
    if (creating || !pending) return;
    setCreating(true);
    const { data: auth } = await supabase.auth.getUser();
    const uid = auth.user?.id;
    if (!uid) {
      setCreating(false);
      return;
    }
    savePersonalisation(p);
    setPerso(p);
    const def = SUPPORT_TYPES[pending];
    const { data, error } = await supabase
      .from("autonomy_supports")
      .insert({
        user_id: uid,
        profile_id: p.childId || null,
        support_type: pending,
        title: def.label,
        content: { items: [{ label: "" }] },
        personalisation: {
          ageBand: p.ageBand,
          language: p.language,
          objective: p.objective,
          context: p.context,
        },
      })
      .select("id")
      .single();
    setCreating(false);
    if (error || !data) {
      toast({ description: "Impossible de créer ce support.", variant: "destructive" });
      return;
    }
    setPending(null);
    softHaptic([10, 40, 10]);
    toast({ description: "Ton support est prêt 🌸" });
    navigate("/autonomie/support/" + data.id);
  };

  const nameFor = (id: string | null) => profiles.find((p) => p.id === id)?.first_name;

  return (
    <HubShell title="Studio" subtitle="Que souhaites-tu créer aujourd'hui ?">
      {offline && (
        <div className="flex items-center gap-3 rounded-[20px] border border-border/70 bg-card px-5 py-3.5">
          <WifiOff className="h-4 w-4 shrink-0 text-muted-foreground" strokeWidth={1.75} />
          <p className="text-xs leading-relaxed text-muted-foreground">
            Hors ligne. Tes supports déjà créés restent consultables et imprimables.
          </p>
        </div>
      )}

      {/* Besoin immédiat : toujours en premier, toujours atteignable */}
      <Link
        to="/autonomie/assistant?crise=1"
        className="flex items-center gap-4 rounded-[24px] border border-destructive/25 bg-destructive/5 px-5 py-5 transition-all active:scale-[0.99]"
      >
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-destructive/10">
          <ShieldAlert className="h-[18px] w-[18px] text-destructive" strokeWidth={1.75} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-semibold text-foreground">
            J'ai besoin d'aide maintenant
          </span>
          <span className="mt-0.5 block text-xs leading-relaxed text-muted-foreground">
            Des gestes simples tout de suite, et un support à imprimer après.
          </span>
        </span>
        <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" strokeWidth={1.75} />
      </Link>

      {/* Assistant : la voie la plus rapide vers un support prêt */}
      <Link
        to="/autonomie/assistant"
        className="flex items-center gap-4 rounded-[24px] border border-primary/30 bg-primary/5 px-5 py-5 transition-all active:scale-[0.99]"
      >
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/15">
          <Sparkles className="h-[18px] w-[18px] text-primary-dark" strokeWidth={1.75} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-semibold text-foreground">Assistant Éclosia</span>
          <span className="mt-0.5 block text-xs leading-relaxed text-muted-foreground">
            Décris la situation, il choisit et crée les supports pour toi.
          </span>
        </span>
        <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" strokeWidth={1.75} />
      </Link>

      {/* Créer soi-même : grandes cartes, un geste par type */}
      <p className="pb-1 pt-4 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        Créer moi-même
      </p>
      <div className="grid grid-cols-2 gap-3">
        {SUPPORT_ORDER.map((type, i) => {
          const def = SUPPORT_TYPES[type];
          return (
            <motion.button
              key={type}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: i * 0.04, ease: [0.22, 1, 0.36, 1] }}
              onClick={() => {
                softHaptic();
                setPending(type);
              }}
              disabled={creating}
              className="flex min-h-[128px] flex-col items-start gap-2 rounded-[24px] border border-border/70 bg-card px-4 py-5 text-left transition-all hover:border-primary/40 active:scale-[0.98] disabled:opacity-60"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-secondary/60">
                <def.icon className="h-[18px] w-[18px] text-foreground" strokeWidth={1.75} />
              </span>
              <span className="text-sm font-semibold text-foreground">{def.label}</span>
              <span className="text-[11px] leading-snug text-muted-foreground">{def.desc}</span>
            </motion.button>
          );
        })}

        <Link
          to="/autonomie/pdf"
          className="flex min-h-[128px] flex-col items-start gap-2 rounded-[24px] border border-border/70 bg-card px-4 py-5 text-left transition-all hover:border-primary/40 active:scale-[0.98]"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-secondary/60">
            <FileText className="h-[18px] w-[18px] text-foreground" strokeWidth={1.75} />
          </span>
          <span className="text-sm font-semibold text-foreground">Générateur PDF</span>
          <span className="text-[11px] leading-snug text-muted-foreground">
            Réunir plusieurs supports en un seul document.
          </span>
        </Link>
      </div>

      {/* Reprendre */}
      {supports.length > 0 && (
        <>
          <p className="pb-1 pt-6 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            Reprendre
          </p>
          <div className="space-y-2">
            {supports.map((s) => (
              <Link
                key={s.id}
                to={"/autonomie/support/" + s.id}
                className="flex items-center gap-4 rounded-[20px] border border-border/70 bg-card px-5 py-4"
              >
                {s.is_favorite ? (
                  <Star
                    className="h-4 w-4 shrink-0 fill-primary text-primary"
                    strokeWidth={1.75}
                  />
                ) : (
                  <Printer className="h-4 w-4 shrink-0 text-muted-foreground" strokeWidth={1.75} />
                )}
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-foreground">
                    {s.title}
                  </span>
                  <span className="mt-0.5 block text-xs text-muted-foreground">
                    {SUPPORT_TYPES[s.support_type as keyof typeof SUPPORT_TYPES]?.label ??
                      s.support_type}
                    {nameFor(s.profile_id) ? " · " + nameFor(s.profile_id) : ""}
                  </span>
                </span>
                <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" strokeWidth={1.75} />
              </Link>
            ))}
          </div>
        </>
      )}

      {/* Retrouver */}
      <div className="space-y-2 pt-6">
        <Link
          to="/autonomie/bibliotheque"
          className="flex items-center gap-4 rounded-[20px] border border-border/70 bg-card px-5 py-4"
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-secondary/60">
            <Library className="h-[18px] w-[18px]" strokeWidth={1.75} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-semibold text-foreground">
              Bibliothèque de modèles
            </span>
            <span className="mt-0.5 block text-xs text-muted-foreground">
              Ne pars jamais d'une page blanche.
            </span>
          </span>
          <ChevronRight className="h-4 w-4 text-muted-foreground" strokeWidth={1.75} />
        </Link>

        <Link
          to="/autonomie/mes-supports"
          className="flex items-center gap-4 rounded-[20px] border border-border/70 bg-card px-5 py-4"
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-secondary/60">
            <Printer className="h-[18px] w-[18px]" strokeWidth={1.75} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-semibold text-foreground">Mes créations</span>
            <span className="mt-0.5 block text-xs text-muted-foreground">
              Derniers, favoris, brouillons, les plus utilisés.
            </span>
          </span>
          <ChevronRight className="h-4 w-4 text-muted-foreground" strokeWidth={1.75} />
        </Link>
      </div>

      <PersonalisationSheet
        open={Boolean(pending)}
        onOpenChange={(o) => !o && setPending(null)}
        label={pending ? SUPPORT_TYPES[pending].label : ""}
        profiles={profiles}
        value={perso}
        loading={creating}
        onConfirm={create}
      />
    </HubShell>
  );
};

export default StudioHome;
